'use strict';

module.exports = {
    port: 3000,
    portHttps: 3433,
    host: 'localhost',
    //db: 'mongodb://localhost/staging',
    //db: 'mongodb://localhost/production',
    asterisk: {
        'host': process.env.ASTERISK_HOST || 'localhost',
        'port': process.env.ASTERISK_PORT || 5038,
        'user': process.env.ASTERISK_USER || 'asterisk',
        'secret': process.env.ASTERISK_PASSWORD || ''
    },
    log: {
        // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
        format: 'dev',
        // Stream defaults to process.stdout
        // Uncomment to enable logging to a log on the file system
        options: {
            stream: 'logs/access.log'
        }
    },
    app: {
        title: 'NewIp monitor'
    },
};
