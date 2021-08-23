'use strict';

var AsteriskService = require('../../app/services/asterisk.server.service');

var asteriskParams;
var asteriskService;

asteriskParams = {
    'host': '161.132.121.218',
    'port': 55338,
    'user': 'newipsip',
    'secret': '$%NIS2019'
};

asteriskService = AsteriskService.create({
    params: asteriskParams,
    user: {}
});

asteriskService.connect();
asteriskService.reload();
