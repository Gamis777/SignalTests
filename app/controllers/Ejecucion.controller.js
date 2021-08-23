const db = require("../models");
const ejecucionService = require("../services/ejecucion.service");
const Ejecucion = db.ejecucion
const Prueba = db.prueba
const Usuario = db.usuario
const Matriz = db.matriz
let moment = require('moment')
let pdf = require("pdf-creator-node")
let fs = require('fs')
let html = fs.readFileSync('./app/templates/formato_pdf_ejecucion.html', 'utf8')
const nodemailer = require("nodemailer")
const { Op } = require("sequelize");

exports.obtenerTodos = async(req, res) => {
    try {
        const ejecuciones = await Ejecucion.findAll({
            include: [{
                model: Prueba,
                as: 'prueba',
                include: ['matriz']
            }]
        })
        return res.status(200).json({
            estado: true,
            ejecuciones
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener las ejecuciones."
        })
    }
};

exports.buscarUno = async(req, res) => {
    try {
        const id_ejecucion = req.params.id_ejecucion
        let ejecucion = await ejecucionService.findById(id_ejecucion);
        if (ejecucion) {
            return res.status(200).json({
                estado: true,
                ejecucion,
            })
        }
        return res.status(404).send('La ejecución con el ID especificado no existe')
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener la ejecución."
        })
    }
};

exports.buscarEscenarios = async(req, res) => {
    try {
        const id_ejecucion = req.params.id_ejecucion
        let escenarios = await db.escenario.findAll({ 
            where: {
                [Op.and]: [
                    {
                        id_ejecucion: id_ejecucion,
                        '$canal_origen.estado_llamada$': 'LIBRE',
                    },
                    {
                        [Op.or]: [
                            {
                                '$destino.estado_llamada$': 'LIBRE',
                            },
                            {
                                'tipo': 'E'
                            }
                        ]
                    }
                ]
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
            ]
        })
        if (escenarios) {
            return res.status(200).json({
                estado: true,
                escenarios,
            })
        }
        return res.status(404).send('La ejecución con el ID especificado no existe')
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener la ejecución."
        })
    }
};

exports.sendEjecutionByMail = async(req, res) => {
    const id_ejecucion = req.params.id_ejecucion
    let ejecucion = await ejecucionService.findById(id_ejecucion);
    try {
        await ejecucionService.createAndSendPdf(ejecucion);
        return res.status(200).json({
            estado: true,
            ejecucion,
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            ejecucion,
        })
    }
};
