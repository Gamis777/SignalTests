'use strict';

var AsteriskManagerMock = function Manager() {

    var obj = {};

    obj.setCallResult = function(result) {
        this.callResult = result;
    };
    obj.setCalleridnum = function(phone) {
        this.calleridnum = phone;
    };

    obj.setCallFailureReason = function(reason) {
        this.res = {
            event: 'event',
            response: 'Failure',
            reason: reason,
            actionid: '0'
        };
    };

    obj.setHangupCauseCode = function(cause) {
        this.cause = cause;
    };

    obj.setActivePeers = function(peers) {
        this.activePeers = peers;
    };

    obj.on = function(action, callback) {
        var evt = {},
            self = this;
        setTimeout(function() {
            if (action === 'response') {
                evt.message = 'Authentication accepted';
                callback(evt);
            }
            if (action === 'managerevent') {
                evt.event = 'PeerlistComplete';
                evt.actionid = 1;
                callback(evt);
            }
            if (action === 'hangup') {
                evt.cause = self.cause;
                evt.calleridnum = self.calleridnum;
                evt.uniqueid = '0.0';
                callback(evt);
            }
        });
    };

    obj.action = function(config, callback) {
        var self = this;
        self.res = self.res ? self.res : {};
        setTimeout(function() {
            if (config.action === 'sipshowpeer') {
                self.res.status = 'UNKNOWN';
                if (self.activePeers.indexOf(config.peer) !== -1) {
                    self.res.status = 'OK';
                }
                callback(null, self.res);
            }
            if (config.action === 'originate') {
                self.res.calleridnum = self.calleridnum;
                callback(null, self.res);
            }
        });

        return '0';
    };

    obj.isConnected = function() {
        return true;
    };

    obj.keepConnected = function() {
        return true;
    };

    obj.login = function() {
        return true;
    };


    return obj;
};

module.exports = AsteriskManagerMock;
