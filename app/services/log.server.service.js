'use strict';

var _ = require('lodash'),
    translations = require('../data/translations-server'),
    Polyglot = require('node-polyglot'),
    config = require('../../config/config'),
    log4js = require('log4js');

exports.level = {
    info: 'info',
    warn: 'warn',
    error: 'error',
    fatal: 'fatal'
};

exports.log = function(spec) {
    var self = this;
    if (!(spec.user && _.isString(spec.user))) {
        try {
            return self.doLogging(spec);
        } catch (e) {
            return self;
        }

    }
    return self;
};

exports.email = function(spec) {
    var polyglot = new Polyglot();
    polyglot.extend(translations[spec.user.lang]);
    var phone = 'unknown',
        //host = '',
        widgetServerHost = config.host;
    if (spec.callbackRequest) {
        phone = spec.callbackRequest.data.phone;
        //host = new URL(spec.callbackRequest.data.referer).host;
        widgetServerHost = spec.callbackRequest.data.widgetServerHost;
    }

    var emailData = {
        error: spec.error,
        text: polyglot.t('EMAIL_CALLBACK_REQUESTS_ERROR1', {
            phone: phone
        }),
        widgetServerHost: widgetServerHost
    };
    return emailData;
};

exports.doLogging = function(spec) {
    var logFileName = 'general';
    if (spec.user) {
        logFileName = spec.user.id;
    }
    if (!spec.user || (spec.user && spec.user.doLogging)) {
        log4js.configure({
            appenders: [{
                type: 'file',
                maxLogSize: 2048000,
                backups: 1,
                filename: 'logs/' + logFileName + '.log',
                category: spec.category
            }],
            replaceConsole: true
        });
        var logger = log4js.getLogger(spec.category);
        logger[spec.level](spec.message);
    }
    return this;
};
