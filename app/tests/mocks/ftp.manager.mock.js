'use strict';

var FtpManagerMock = function Manager() {

    var obj = {};

    obj.on = function(action, callback) {
        var evt = {},
            self = this;
        setTimeout(function() {
            if (action === 'ready') {
                callback();
            }
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

    obj.connect = function(options) {
        this.options = options;
        return true;
    }

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

module.exports = FtpManagerMock;
