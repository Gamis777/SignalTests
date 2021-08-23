const db = require("../models");
const Ejecucion = db.ejecucion
const Prueba = db.prueba
const Usuario = db.usuario
const Matriz = db.matriz
let moment = require('moment')
let pdf = require("pdf-creator-node")
let fs = require('fs')
let html = fs.readFileSync('./app/templates/formato_pdf_ejecucion.html', 'utf8')
const nodemailer = require("nodemailer");
const { stringify } = require("querystring");

exports.createAndSendPdf = (ejecucion) => {
    return new Promise((resolve, reject) => {
        let ejecutionDetail = {
            name: ejecucion.prueba.nombre,
            startDate: ejecucion.fecha_inicio,
            endDate: ejecucion.fecha_fin,
            userName: `${ejecucion.prueba.usuario.nombres} ${ejecucion.prueba.usuario.apellidos}`,
            matrizName: ejecucion.prueba.matriz.nombre,
            scenarios: []
        }
        ejecucion.escenarios.forEach( (scene) => {
            ejecutionDetail.scenarios.push({
                origin: {
                    idCanal: scene.canal_origen.id_canal,
                    operatorName: scene.canal_origen.tecnologia_operador.operador.nombre,
                    tecnologyName: scene.canal_origen.tecnologia_operador.tecnologia.nombre,
                    number: scene.canal_origen.numero
                },
                destination: {
                    type: scene.tipo === 'C' ? `Canal`
                        : `Número Externo`,
                    id: scene.tipo === 'C' ? scene.destino.id_canal
                        : scene.numero_externo.id_numero_externo,
                    name: scene.tipo === 'C' ?
                        `${scene.destino.tecnologia_operador.operador.nombre} ${scene.destino.tecnologia_operador.tecnologia.nombre}`
                        : scene.numero_externo.nombre,
                    number: scene.tipo === 'C' ? scene.destino.numero
                        : scene.numero_externo.numero
                },
                outputResult: scene.estado ==='Success' ? 'Exito' : 'Error',
                inputResult: (scene.tipo === 'C') ? (scene.uniqueid_en ? 'Exito' : 'Error'): '-',   
                outputDate : scene.hora_saliente,
                hangupReason : JSON.parse(scene.hangupReason).description,
                inputDate : (scene.tipo === 'C') ? (scene.hora_entrante): '-',    
                result: (scene.tipo === 'C') ? (scene.uniqueid_en ? 'Exito' : 'Error'): (scene.estado ==='Success' ? 'Exito' : 'Error'),  
                mos: (scene.tipo === 'C') ? ((scene.uniqueid_en && !scene.mos) ? 5 : scene.mos): (scene.estado ==='Success' ? 5 : '') 
            })
        });
        const path = "../proyecto_entel_frontend/public/" + ejecucion.id_ejecucion + ".pdf"
        //Crear pdf
        var document = {
            html: html,
            data: {
                ejecucion: ejecutionDetail
            },
            path: path
        };
        var header  = "";
        var options = {
            format: "A4",
            orientation: "portrait",
            border: "10mm",
            header: {
                height: "45mm",
                contents: `<div style="text-align: center;">${header}</div>`
            },
            footer: {
                height: "28mm",
                contents: {
                    first: 'Cover page',
                    2: 'Second page', // Any page number is working. 1-based index
                    default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                    last: 'Last Page'
                }
            }
        };
        pdf.create(document, options)
            .then(async result => {
                console.log(`Enviando archivo: ${path}`);
                let selfSignedConfig = {
                host: process.env.SMPT_HOST,
                port: process.env.SMPT_PORT,
                //secure: true, // upgrade later with STARTTLS
                };
                if(process.env.SMPT_USER && process.env.SMPT_PASS){
                selfSignedConfig['auth'] = {
                    user: process.env.SMPT_USER,
                    pass: process.env.SMPT_PASS
                }
                }
                let transporter = nodemailer.createTransport(selfSignedConfig)
                await transporter.sendMail({
                from: process.env.SMPT_USER,
                to: ejecucion.prueba.correo, // list of receivers
                subject: "REPORTE DE EJECUCIÓN", // Subject line
                text: "Se envia reporte de ejecución en el siguente archivo adjunto :", // plain text body
                attachments: [{
                    filename: 'Reporte_De_Ejecucion.pdf',
                    content: fs.createReadStream(path)
                }]
                });
                resolve(ejecucion);
            })
            .catch(error => {
                reject(error);
            });
    });
};

exports.findById = async (id_ejecucion) => {
    return await Ejecucion.findOne({
        where: {
            id_ejecucion: id_ejecucion
        },
        include: [
            {
                model: Prueba,
                as: 'prueba',
                include: ['matriz','usuario']
            }, 
            {
                model: db.escenario,
                as: 'escenarios',
                required: false,
                include: [
                    {
                        model: db.canal,
                        as: 'canal_origen',
                        include: [{
                            model: db.tecnologiaoperador,
                            as: 'tecnologia_operador',
                            include: [{
                                    model: db.tecnologia,
                                    as: 'tecnologia'
                                },
                                {
                                    model: db.operadortelefonico,
                                    as: 'operador'
                                }
                            ]
                        }],
                        required: false
                    },
                    {
                        model: db.canal,
                        as: 'destino',
                        where: {
                            '$escenarios.tipo$': 'C'
                        },
                        required: false,
                        include: [{
                            model: db.tecnologiaoperador,
                            as: 'tecnologia_operador',
                            include: [{
                                    model: db.tecnologia,
                                    as: 'tecnologia'
                                },
                                {
                                    model: db.operadortelefonico,
                                    as: 'operador'
                                }
                            ]
                        }]
                    },
                    {
                        model: db.numeroexterno,
                        as: 'numero_externo',
                        required: false,
                        where: {
                            '$escenarios.tipo$': 'E'
                        },
                    },
                    {
                        model: db.error,
                        as: 'error',
                        required: false
                    }
                ]
            }
        ]
    })
} 

exports.sendEjecutionByMail = async (id_ejecucion) => {
    let ejecucion = await this.findById(id_ejecucion)
    return this.createAndSendPdf(ejecucion)
};