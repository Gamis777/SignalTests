var Q = require('q'),
    fs = require('fs'),
    Checker = require('../services/checker.base.server.service');

var FtpService = this;
module.exports = FtpService;

FtpService.init = function(spec) {
    this.params = spec.params;
    this.user = spec.user;
    return this;
};

FtpService.create = function() {
    var o = Object.create(this);
    this.init.apply(o, Array.prototype.slice.call(arguments));
    return o;
};

FtpService.connect = function() {
    var def = Q.defer(),
        self = this;
    var FtpManagerService = this.getFtpManagerService();
    self.ftp = new FtpManagerService();
    self.ftp.on('close', (hadErr) => {
        self.isConnect = false;
        def.resolve();
    });
    self.ftp.on('end', () => {
        self.isConnect = false;
        def.resolve();
    });
    self.ftp.on('ready', () => {
        console.log('ftp: ready');
        self.isConnect = true;
        def.resolve();
    });
    self.ftp.on('error', console.dir);
    self.ftpConnect = self.ftp.connect({
        host: this.params.host,
        port: this.params.port,
        user: this.params.user,
        password: this.params.secret
    });
    setTimeout(function() {
        if (self.ftpConnect && !self.isConnected()) {
            self.errorStatus = Checker.statuses.connectTimeout;
            def.resolve();
        }
    }, 5000);

    return def.promise;
};

FtpService.uploadFile = async function(spec) {
    var def = Q.defer(),
        self = this,
        local_file = spec.data.local,
        remote_file = spec.data.remote;
    self.waitIsConnected().then(function() {
        self.ftp.fastPut(local_file, remote_file)
            .then(() => {
                def.resolve();
            }).catch((e) => {
                def.reject(e);
            });
    });
    return def.promise;
}

FtpService.upload = async function(spec) {
    var def = Q.defer(),
        self = this,
        text = spec.data.text,
        remote_file = spec.data.remote;
    var registro = Date.now().toString();
    var local_file = `./data/cache/${registro}`;
    fs.writeFile(local_file, text, function(err) {
        if (err) def.reject(err);
        self.uploadFile({
            'data': {
                'local': local_file,
                'remote': remote_file
            }
        }).then(() => {
            fs.unlinkSync(local_file);
            def.resolve();
        }).catch((e) => {
            fs.unlinkSync(local_file);
            def.reject(e);
        });
    });
    return def.promise;
}

FtpService.isConnected = function() {
    var self = this;
    if (!self.isConnect || !self.ftp.sftp) {
        return false;
    }
    return true;
}

FtpService.waitIsConnected = function() {
    var def = Q.defer(),
        isConnected, self = this;
    if (this.ftpConnect) {
        var checkConnection = setInterval(function() {
            isConnected = self.isConnected();
            if (isConnected) {
                def.resolve();
                clearInterval(checkConnection);
            }
        }, 100);

        setTimeout(function() {
            if (self.ftpConnect && !self.isConnected()) {
                clearInterval(checkConnection);
                self.connect({
                    host: self.params.host,
                    port: self.params.port,
                    user: self.params.user,
                    password: self.params.secret
                }).then(function() {
                    def.resolve();
                });
            }
        }, 1000);
    } else {
        self.connect({
                host: this.params.host,
                port: this.params.port,
                user: this.params.user,
                password: this.params.secret
            })
            .then(function() {
                def.resolve();
            });
    }

    return def.promise;
};

FtpService.setFtpManagerService = function(service) {
    this.ftpManagerService = service;
};

FtpService.getFtpManagerService = function() {
    if (!this.ftpManagerService) {
        this.ftpManagerService = new require('ssh2-sftp-client');
    }
    return this.ftpManagerService;
};
