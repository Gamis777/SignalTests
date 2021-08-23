var Q = require('q'),
    db = require("../models"),
    FtpService = require('../services/ftp.server.service');

var Equipo = db.equipo;
var AsteriskConfService = this;
module.exports = AsteriskConfService;

AsteriskConfService.sip = async function() {
    const equipos = await Equipo.findAll();
    var conf = "";
    for (var i in equipos) {
        var equipo = equipos[i];
        conf += `
            [${equipo.nombre}]
            type=friend
            disallow=all
            allow=ulaw,alaw,g729
            context=entrantes
            qualify=yes
            dtmfmode=RFC2833
            host=${equipo.ip}
            directmedia=no
            insecure=invite,port
            `;
    }
    return Q.when(conf);
}

AsteriskConfService.extensions = async function() {
    const equipos = await Equipo.findAll();
    var conf = "";
    conf += `
        [monitoreo]
        exten => s,1,Noop(Llamada Saliente)
        same => n,playback(hello-world)
        same => hangup()

        exten => h,1,Set(RTCP_data=\${CHANNEL(rtpqos,audio,all)})
        exten => h,n,NoOp(RTCP Values : \${RTCP_data})

        [entrantes]
        `;
    for (var i in equipos) {
        var equipo = equipos[i];
        var canales = await equipo.getCanales();
        for (var j in canales) {
            var canal = canales[j];
            console.log(canal);
            if (canal.numero) {
                conf += `
                    exten => ${canal.numero},1,Noop(Llamada Entrante)
                    same => n,playback(hello-world)
                    same => hangup()
                    `;
            }
        }
    }
    console.log(conf);
    return Q.when(conf);
}

AsteriskConfService.write = async function() {
    console.log('write');
    var self = this;
    var ftpParams = {
        'host': process.env.FTP_HOST || 'localhost',
        'port': process.env.FTP_PORT || 22,
        'user': process.env.FTP_USER || root,
        'secret': process.env.FTP_PASSWORD || ''
    };
    var ftpService = await FtpService.create({
        params: ftpParams,
        user: {}
    });
    await ftpService.connect();
    var sip_conf = await self.sip();
    var extensions_conf = await self.extensions();
    console.log(sip_conf);
    console.log(extensions_conf);
    await ftpService.upload({
        'data': {
            'text': sip_conf,
            'remote': '/etc/asterisk/sip.monitoreo.conf'
        }
    });
    await ftpService.upload({
        'data': {
            'text': extensions_conf,
            'remote': '/etc/asterisk/extensions.monitoreo.conf'
        }
    });
}
