'use strict';

var FtpService = require('../services/ftp.server.service');

var ftpParams;
var ftpService;


ftpParams = {
    'host': '161.132.121.218',
    'port': 22120,
    'user': 'root',
    'secret': '$%NIS2020..'
};

ftpService = FtpService.create({
    params: ftpParams,
    user: {}
});

ftpService.connect();
