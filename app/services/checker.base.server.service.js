'use strict';

var CheckerBase = this;
module.exports = CheckerBase;

CheckerBase.statuses = {
    start: 'STATUS_START',
    originateSuccess: 'STATUS_ORIGINATE_SUCCESS',
    originateFailure: 'STATUS_ORIGINATE_FAILURE',
    responseFailure: 'STATUS_SERVER_RESPONSE_FAILURE',
    authFailure: 'STATUS_SERVER_AUTH_FAILURE',
    connectFailure: 'STATUS_SERVER_CONNECT_FAILURE',
    connectTimeout: 'STATUS_SERVER_CONNECT_TIMEOUT',
    notAnsweredByClient: 'STATUS_CALL_NOT_ANSWERED_BY_CLIENT',
    notAnsweredByPeer: 'STATUS_CALL_NOT_ANSWERED_BY_PEER',
    rejectedByClient: 'STATUS_CALL_REJECTED_BY_CLIENT',
    rejectedByPeer: 'STATUS_CALL_REJECTED_BY_PEER',
    excludedPrefix: 'STATUS_EXCLUDED_PREFIX',
    noActivePeers: 'STATUS_NO_ACTIVE_PEERS',
    notEnoughMoney: 'STATUS_NOT_ENOUGH_MONEY',
    disabled: 'STATUS_CHANNEL_DISABLED',
    noSendIfsuccess: 'STATUS_NO_SEND_IF_SUCCESS',
    beyondWorkTime: 'STATUS_BEYOND_WORK_TIME',
    sendSuccess: 'STATUS_SEND_SUCCESS',
    sendFailure: 'STATUS_SEND_FAILURE',
    somethingWrong: 'STATUS_SOMETHING_WENT_WRONG'
};

/**
 * Initialize a new model.
 *
 * @param {Object} service - channel service.
 * @api public
 */
CheckerBase.init = function(spec) {
    this.channelSettings = spec.channelSettings;
    this.callbackRequest = spec.callbackRequest;
    this.notification = spec.notification;
    this.previousNotifications = spec.previousNotifications;
    this.channel = spec.channel;
    this.user = spec.user;
    this.result = spec.result;
    return this;
};

CheckerBase.create = function() {
    var o = Object.create(this);
    o.init.apply(o, Array.prototype.slice.call(arguments));
    return o;
};

CheckerBase.check = function() {
    throw new Error('Method not implemented');
};

CheckerBase.setChannelSettings = function(channelSettings) {
    this.channelSettings = channelSettings;
};

CheckerBase.setChannel = function(channel) {
    this.channel = channel;
};

CheckerBase.setCallbackRequest = function(callbackRequest) {
    this.callbackRequest = callbackRequest;
};

CheckerBase.setPrevNotifications = function(previousNotifications) {
    this.previousNotifications = previousNotifications;
};

CheckerBase.setUser = function(user) {
    this.user = user;
};
