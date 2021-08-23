'use strict';
const { originResponse, newExten, hangUp } = require('../helpers/dataUpdateEscenario')
var Q = require('q'),
    Checker = require('../services/checker.base.server.service'),
    LogService = require('../../app/services/log.server.service'),
    _ = require('lodash');


var AsteriskService = this;
module.exports = AsteriskService;

AsteriskService.callMethods = {
    peerToClient: '1',
    clientToDialPlan: '2'
};

AsteriskService.create = function() {
    var o = Object.create(this);
    this.init.apply(o, Array.prototype.slice.call(arguments));
    return o;
};

AsteriskService.init = function(spec) {
    this.params = spec.params;
    this.user = spec.user;
    return this;
};

AsteriskService.connect = function() {
    var def = Q.defer(),
        self = this,
        message;
    var ManagerService = this.getAsteriskManagerService();
    self.ami = ManagerService(this.params.port, this.params.host, this.params.user, this.params.secret, true);
    self.ami.on('response', function(evt) {
        if (evt.message === 'Authentication accepted') {
            def.resolve();
            LogService.log({
                message: JSON.stringify(evt),
                user: self.user,
                category: 'asterisk',
                level: LogService.level.info
            });
        } else if (evt.message === 'Authentication failed') {
            def.resolve();
            LogService.log({
                message: JSON.stringify(evt),
                user: self.user,
                category: 'asterisk',
                level: LogService.level.error
            });
            self.errorStatus = Checker.statuses.authFailure;
        }
        if (evt.event === 'OriginateResponse') {
            originResponse(evt);
            //let id_escenario = null;
            //if (evt.calleridname.indexOf('id_escenario:') != -1) {
            //    id_escenario = parseInt(evt.calleridname.split(':')[1]);
            //}
            //console.log(`id_escenario: ${id_escenario}`);
            //TODO ACTUALIZAR ESCENARIO CON evt.uniqueid
            //si evt.response === 'Failure' actualizar con error
            //actualizas solo el unique.id
            /*setTimeout(function(){
                if(evt.response === 'Failure'){
                    def.reject(evt);
                }
            }, 1000);//waiting for possible failure response in "originate" function
            var message = 'OriginateResponse event, callback request guid "' + spec.guid + '", event data: "' + JSON.stringify(evt) + '"';
            LogService.log({message: message, user: self.user, category: 'asterisk', level: LogService.level.info});*/
        } else {
            //console.log('%%%%%%%%%%%%');
            //console.log(evt);
            //console.log('%%%%%%%%%%%%');
        }
    });
    self.ami.on('managerevent', function(evt) {
        if (evt.event == 'Newexten'){
            newExten(evt);
        }
        //TODO ACTUALIZAR RESPUESTA HANGUP AL ESCENARIO CON UNIQUEID evt.uniqueid
        // actualizar estado
    });
    self.ami.on('hangup', function(evt) {
        hangUp(evt);
        //TODO ACTUALIZAR RESPUESTA HANGUP AL ESCENARIO CON UNIQUEID evt.uniqueid
        // actualizar estado
    });

    self.ami.on('error', function(evt) {
        console.log(evt);
        def.resolve();
        message = 'Event error, data: "' + JSON.stringify(evt) + '"';
        LogService.log({
            message: message,
            user: self.user,
            category: 'asterisk',
            level: LogService.level.error
        });
    });

    setTimeout(function() {
        if (self.ami && !self.ami.isConnected()) {
            self.errorStatus = Checker.statuses.connectTimeout;
            def.resolve();
        }
    }, 5000);

    return def.promise;
};

AsteriskService.waitIsConnected = function() {
    var def = Q.defer(),
        isConnected, self = this;

    if (this.ami) {
        var checkConnection = setInterval(function() {
            isConnected = self.ami.isConnected();
            if (isConnected) {
                def.resolve();
                clearInterval(checkConnection);
            }
        }, 100);

        setTimeout(function() {
            if (self.ami && !self.ami.isConnected()) {
                clearInterval(checkConnection);
                LogService.log({
                    message: 'Login to asterisk server',
                    user: self.user,
                    category: 'asterisk',
                    level: LogService.level.info
                });
                self.connect().then(function() {
                    def.resolve();
                });
            }
        }, 1000);
    } else {
        self.connect()
            .then(function() {
                def.resolve();
            });
    }

    return def.promise;
};

AsteriskService.getPeersToCheck = function() {
    var peers;
    switch (this.params.callMethod) {
        case this.callMethods.peerToClient:
            peers = [this.params.method1Params.peer];
            break;
        case this.callMethods.clientToDialPlan:
            peers = this.params.method2Params.checkActivePeers.split(',');
            peers = _.map(peers, function(peer) {
                return peer.trim();
            });
            break;
    }
    return peers;
};

AsteriskService.getOriginateParams = function(spec) {
    var def = Q.defer(),
        destination, routes, routeChannel, phone = spec.phone;

    var originateParams = {};
    switch (this.params.callMethod) {
        case this.callMethods.peerToClient:
            originateParams.channel = 'SIP/' + this.params.method1Params.peer;
            originateParams.context = this.params.method1Params.context;
            originateParams.exten = phone;
            def.resolve(originateParams);
            break;
        case this.callMethods.clientToDialPlan:
            destination = this.params.method2Params.destination.split(',');

            routes = _.sortBy(this.params.method2Params.routes, 'idx');
            _.forEach(routes, function(route) {
                if (route.prefix && phone.indexOf(route.prefix) === 0) {
                    phone = phone.slice(route.prefix.length);
                }
                if (!routeChannel && route.pattern && phone.indexOf(route.pattern) === 0) {
                    routeChannel = route.channel + '/' + phone;
                }
            });

            if (!routeChannel) {
                def.reject({
                    code: 'STATUS_NO_ROUTE'
                });
            } else if (destination.length === 3) {
                originateParams.context = destination[0].trim(); //monitoreo
                originateParams.exten = destination[1].trim(); //s
                originateParams.priority = destination[2].trim(); //1
                originateParams.channel = routeChannel; //
                //'channel': 'SIP/TRONAL/PREFIJO_origen(ranura-slot)-DESTINO
                //'channel': 'SIP/$canal.equipo.nombre/$canal.equipo.ranura$canal.nro_ranura$canal.numero$canal.numero',<-!
                //'channel': 'SIP/$canal.equipo.nombre/$canal.equipo.ranura$canal.nro_ranura$numero_externos.numero',
                def.resolve(originateParams);
            } else {
                def.reject({
                    code: 'STATUS_WRONG_PARAMS',
                    error: 'Wrong asterisk config provided: ' + this.params.method2Params.destination
                });
            }
            break;
        default:
            def.resolve({})

    }

    return def.promise;
};

AsteriskService.reload = function(spec) {
    var def = Q.defer(),
        self = this;

    LogService.log({
        message: 'reload',
        user: self.user,
        category: 'asterisk',
        level: LogService.level.info
    });

    var commonReloadParams = {
            'action': 'reload',
            'async': true
        },
        serverResponse;

    self.waitIsConnected()
        .then(function() {
            var reloadParams = commonReloadParams;
            self.originateId = self.ami.action(reloadParams, function(err, res) {
                if (self.checkIfCurrentActionId(res.actionid)) {
                    serverResponse = true;
                }
                var message = 'Reload action response received',
                    level = LogService.level.info,
                    messageTitle = '',
                    code;
                if (err) {
                    message = 'Reload action error: "' + JSON.stringify(err) + '"';
                    level = LogService.level.error;
                    def.reject({
                        code: Checker.statuses.reloadFailure
                    });
                } else if (res && res.reason) {
                    message = 'result: "' + JSON.stringify(res) + '"';
                    if (res.response === 'Failure') {
                        messageTitle = 'Reload action error, ';
                        code = self.getFailureCode({
                            code: res.reason
                        });
                        def.reject({
                            code: code
                        });
                    }
                    message = messageTitle + message;
                }
                LogService.log({
                    message: message,
                    user: self.user,
                    category: 'asterisk',
                    level: level
                });
            });

            var waitIsConnected = setInterval(function() {
                self.waitIsConnected();
            }, 1000);

            setTimeout(function() {
                if (!serverResponse) {
                    clearInterval(waitIsConnected);
                    def.reject({
                        code: Checker.statuses.responseFailure
                    });
                }
            }, 1000 * 60); //reject in one minute if no any originate response

            setTimeout(function() {
                clearInterval(waitIsConnected);
                def.reject({
                    code: Checker.statuses.responseFailure
                });
            }, 1000 * 60 * 60); //reject in one hour if no any change status response
        });

    return def.promise;
};

AsteriskService.originate = async function(spec) {
    var def = Q.defer(),
        self = this,
        phone = spec.data.phone;

    LogService.log({
        message: 'Originate action, callback request guid "' + spec.guid + '", phone: ' + JSON.stringify(phone),
        user: self.user,
        category: 'asterisk',
        level: LogService.level.info
    });

    var commonOriginateParams = {
            'action': 'originate',
            'async': true,
            'callerid': spec.data.referer + ' <' + phone + '>'
        },
        serverResponse;

    var optionalParams = ['context', 'exten', 'priority', 'channel', 'referer'];
    for (var i in optionalParams) {
        var optionalParam = optionalParams[i];
        if (spec.data[optionalParam]) {
            commonOriginateParams[optionalParam] = spec.data[optionalParam];
        }
    }
    self.waitIsConnected()
        .then(function() {
            return self.getOriginateParams({
                phone: phone
            });
        })
        .then(function(originateParams) {
            originateParams = _.merge(commonOriginateParams, originateParams);
            //console.log(originateParams);
            self.originateId = self.ami.action(originateParams, function(err, res) {
                if (self.checkIfCurrentActionId(res.actionid)) {
                    serverResponse = true;
                }
                console.log('%%%%%%%%%%%%')
                console.log(err);
                console.log(res);
                console.log(serverResponse);
                console.log('%%%%%%%%%%%%')
                var message = 'Originate action response received',
                    level = LogService.level.info,
                    messageTitle = '',
                    code;
                LogService.log({
                    message: message,
                    user: self.user,
                    category: 'asterisk',
                    level: level
                });
                if (err) {
                    message = 'Originate action error, callback request guid "' + spec.guid + '", error: "' + JSON.stringify(err) + '"';
                    level = LogService.level.error;
                    if (res.calleridnum === phone) {
                        def.reject({
                            code: Checker.statuses.originateFailure
                        });
                    }
                } else if (res && res.reason) {
                    message = 'callback request guid "' + spec.guid + '", result: "' + JSON.stringify(res) + '"';
                    if (res.response === 'Failure') {
                        messageTitle = 'Originate action error, ';
                        if (res.calleridnum === phone) {
                            code = self.getFailureCode({
                                code: res.reason
                            });
                            def.reject({
                                code: code
                            });
                        }
                    }
                    //actionId = res.actionId;
                    message = messageTitle + message;
                }
                var actionId = res.actionId;
                message = messageTitle + message;
                //console.log(message)
                //console.log(res)
                LogService.log({
                    message: message,
                    user: self.user,
                    category: 'asterisk',
                    level: level
                });
                //console.log(Checker.statuses.originateSuccess);
                def.resolve({
                    code: Checker.statuses.originateSuccess
                }, actionId);
            });
        });
    return def.promise;
};

AsteriskService.checkIfCurrentActionId = function(eventId) {
    return this.originateId.indexOf(eventId) === 0;
};

AsteriskService.getFailureCode = function(spec) {
    var failureCode = Checker.statuses.originateFailure;
    var callMethod = this.params.callMethod;
    if ((callMethod === '1' && spec.code === '3') || (callMethod === '2' && spec.code === '17')) {
        failureCode = Checker.statuses.notAnsweredByPeer;
    } else if ((callMethod === '1' && spec.code === '5') || (callMethod === '2' && (spec.code === '21' || spec.code === '19'))) {
        failureCode = Checker.statuses.rejectedByPeer;
    } else if ((callMethod === '1' && spec.code === '17') || (callMethod === '2' && spec.code === '5')) {
        failureCode = Checker.statuses.rejectedByClient;
    } else if ((callMethod === '1' && (spec.code === '19' || spec.code === '21')) || (callMethod === '2' && spec.code === '3')) {
        failureCode = Checker.statuses.notAnsweredByClient;
    }
    return failureCode;
};

AsteriskService.checkPeersStatus = function(peersToCheck) {
    var self = this,
        promiseChain = new Q([]);

    _.forEach(peersToCheck, function(peer) {
        promiseChain = promiseChain.then(function(results) {
            return self.checkPeerStatus({
                peer: peer,
                results: results
            });
        });
        promiseChain = promiseChain.then(function(results) {
            return self.wait({
                ms: 100,
                results: results
            });
        });
    });
    return promiseChain;
};

AsteriskService.checkPeerStatus = function(spec) {
    var def = Q.defer(),
        self = this,
        result;

    self.waitIsConnected()
        .then(function() {
            return self.ami.action({
                action: 'sipshowpeer',
                peer: spec.peer
            }, function(err, res) {
                if (err || !res.status) {
                    result = false;
                    LogService.log({
                        message: JSON.stringify(err),
                        user: self.user,
                        category: 'asterisk',
                        level: LogService.level.error
                    });
                } else {
                    result = res.status.indexOf('OK') !== -1;
                    LogService.log({
                        message: JSON.stringify(res),
                        user: self.user,
                        category: 'asterisk',
                        level: LogService.level.info
                    });
                }
                spec.results.push(result);
                def.resolve(spec.results);
            });
        });

    return def.promise;
};

AsteriskService.isOnline = function() {
    var peerOnline = false,
        peersToCheck = this.getPeersToCheck();
    return this.checkPeersStatus(peersToCheck)
        .then(function(peersStatus) {
            _.forEach(peersStatus, function(peerStatus) {
                if (peerStatus) {
                    peerOnline = true;
                }
            });
            return new Q({
                'online': peerOnline
            });
        });
};

AsteriskService.wait = function(spec) {
    var def = Q.defer();

    setTimeout(function() {
        def.resolve(spec.results);
    }, spec.ms);

    return def.promise;
};

AsteriskService.setAsteriskManagerService = function(service) {
    this.asteriskManagerService = service;
};

AsteriskService.getAsteriskManagerService = function() {
    if (!this.asteriskManagerService) {
        this.asteriskManagerService = new require('asterisk-manager');
    }
    return this.asteriskManagerService;
};