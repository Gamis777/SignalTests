const db = require("../models");
const Escenario = db.escenario;
const Canal = db.canal;
const moment = require('moment');

const Error = db.error;

const originResponse = async(event) => {
    //console.log("######### IMPRESION DE EVENT originResponse ##########");
    //console.log(event);
    //console.log("######### IMPRESION DE EVENT originResponse ##########");

    const { uniqueid, response, calleridname, reason } = event;

    const id_escenario = parseInt(calleridname.split(':')[1]);
    if(isNaN(id_escenario)){
        return;
    }
    let id_error = null;
    if (response != 'Success') {
        id_error = reason;
    }

    //let hora_saliente = moment().format("HH:mm:ss");

    await Escenario.update({
        estado: response,
        uniqueid_sal: uniqueid,
        //hora_saliente: hora_saliente,
        id_error: id_error
    }, {
        where: {
            id_escenario: id_escenario
        }
    });
};

const newExten = async(event) => {
    //console.log("######### IMPRESION DE EVENT newExten ##########");
    //console.log(event);
    //console.log("######### IMPRESION DE EVENT newExten ##########");
    const { channelstatedesc, calleridnum, exten, priority, context, calleridname, uniqueid } = event;
    if (context === 'monitoreo'){
        if (channelstatedesc === 'Up' && priority === '1'){
            const id_escenario = parseInt(calleridname.split(':')[1]);
            if(isNaN(id_escenario)){
                return;
            }
        }
    } else if (context === 'entrantes') {
        if (channelstatedesc === 'Ring' && priority === '1'){
            let escenario = await Escenario.findOne({
                where: {
                    '$canal_origen.numero$': calleridnum,
                    '$destino.numero$': exten,
                    estado: 'PENDIENTE'
                },
                include: [
                    {
                        model: db.canal,
                        as: 'canal_origen',
                        required: false
                    },
                    {
                        model: db.canal,
                        as: 'destino',
                        where: {
                                '$escenarios.tipo$': 'C',
                        },
                        required: false,
                    }
                ],
            });
            if(escenario){
                let hora_entrante = moment().format("HH:mm:ss");
                await escenario.update({
                    uniqueid_en: uniqueid,
                    hora_entrante: hora_entrante,
                });
            }
        }
    }
};

const hangUp = async(event) => {
    //console.log("######### IMPRESION DE EVENT hangUp ##########");
    //console.log(event);
    //console.log("######### IMPRESION DE EVENT hangUp ##########");

    const { calleridname, cause } = event;
    const id_escenario = parseInt(calleridname.split(':')[1]);
    if(isNaN(id_escenario)){
        return;
    }
    //console.log(id_escenario);
    let escenario = await Escenario.findOne({
        where: {
            id_escenario: id_escenario
        },
        include: [
            {
                model: db.canal,
                as: 'canal_origen',
                required: false
            },
            {
                model: db.canal,
                as: 'destino',
                where: {
                        '$escenarios.tipo$': 'C',
                },
                required: false,
            }
        ],
    });
    //console.log(cause);
    let hangupReason = {
        cause: cause,
        description: event['cause-txt']
    };
    escenario.update({
        hangupReason: JSON.stringify(hangupReason)
    });
    if (escenario) {
        escenario.canal_origen.update({
            estado_llamada: 'LIBRE',
        });
        if(escenario.destino){
            escenario.destino.update({
                estado_llamada: 'LIBRE',
            });
        }
    }
};

module.exports = {
    originResponse,
    newExten,
    hangUp
};