const db = require("../models");
const Prueba = db.prueba
const NumeroExterno = db.numeroexterno
const Canal = db.canal
const Matriz = db.matriz
const Usuario = db.usuario
const Op = db.Sequelize.Op
const Ejecucion = db.ejecucion
const Escenario = db.escenario
const bcrypt = require('bcrypt')
var asteriskService = require('../../app/services/asterisk.server.service')
const auth = require('basic-auth')
var moment = require('moment')

exports.setAsteriskService = async(baseAsteriskService) => {
    asteriskService = baseAsteriskService;
}

exports.obtenerTodos = async(_req, res) => {
    try {
        const pruebas = await Prueba.findAll({
            include: ['matriz']
        })
        return res.status(200).json({
            estado: true,
            pruebas
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener las pruebas."
        })
    }
};

exports.crear = async(req, res) => {
    try {
        /*let datos_prueba = {
            nombre: req.body.nombre,
            comentario: req.body.comentario,
            correo : req.body.correo,
            tiempo_timbrado: req.body.tiempo_timbrado,
            reintentos: req.body.reintentos,
            tipo : 'I',
            tipo_lanzamiento: req.body.tipo_lanzamiento,
            programacion: req.body.programacion,
            fecha_lanzamiento: req.body.fecha_lanzamiento,
            hora_lanzamiento: req.body.hora_lanzamiento,
            dias_lanzamiento: req.body.dias_lanzamiento,
            id_usuario : req.body.id_usuario,
            id_matriz: req.body.id_matriz,
        }*/
        if (req.body.programacion === 'U' && req.body.tipo_lanzamiento === 'Programado') {
            req.body.ejecutado = 'N';
            req.body.activo = 'S';
        }
        if (req.body.programacion === 'T' && req.body.tipo_lanzamiento === 'Programado') {
            req.body.activo = 'S'
        }
        if (req.body.tipo_lanzamiento === 'Instantaneo'){
            req.body.tipo = 'E';
            req.body.fecha_lanzamiento = moment().format("YYYY-MM-DD");
            req.body.hora_lanzamiento = moment().format("HH:mm:ss");
            req.body.ejecutado = 'N';
        }
        //TODO si tipo_lanzamiento === 'Instantaneo' y tipo = 'E'
        //crear ejecucion y escenarios y actualzar en estado pendiente
        const prueba = await Prueba.create(req.body)
        return res.status(201).json({
            estado: true,
            mensaje: "Se creó correctamente la prueba",
            data: prueba
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al crear la prueba."
        })
    }
};

exports.crearExterno = async(req, res) => {
    let user = auth(req)
    const usuario = await Usuario.findOne({
            where: {
                [Op.and]: [{
                    correo: user['name']
                }, {
                    acceso: "A"
                }, {
                    id_perfil: 1
                }]
            }
        })
        //if (user === undefined || user['name'] !== 'USERNAME' || user['pass'] !== 'PASSWORD') {
    if (user === undefined || !usuario || !await bcrypt.compare(user['pass'], usuario.clave)) {
        res.statusCode = 401
        res.setHeader('WWW-Authenticate', 'Basic realm="Node"')
        res.end('Unauthorized')
    } else {
        try {
            let datos_prueba = {
                nombre: req.body.nombre,
                comentario: req.body.comentario,
                correo: req.body.correo,
                tiempo_timbrado: req.body.tiempo_timbrado,
                reintentos: req.body.reintentos,
                tipo: 'E',
                tipo_lanzamiento: 'Instantaneo',
                id_usuario: usuario.id_usuario,
                id_matriz: req.body.id_matriz,
            }
            const prueba = await Prueba.create(datos_prueba)
            return res.status(201).json({
                estado: true,
                mensaje: "Se creó correctamente la prueba",
                data: prueba
            })
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({
                error: "Error al crear la prueba."
            })
        }
    }
};

exports.buscarUno = async(req, res) => {
    try {
        const id_prueba = req.params.id_prueba
        const prueba = await Prueba.findOne({
            where: {
                id_prueba: id_prueba
            },
            include: ['matriz', 'ejecuciones']
        })
        if (prueba) {
            return res.status(200).json({
                estado: true,
                prueba
            })
        }
        return res.status(404).send('La prueba con el ID especificado no existe')
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener la prueba."
        })
    }
};

exports.actualizar = async(req, res) => {
    try {
        const id_prueba = req.params.id_prueba
        const prueba = await Prueba.findOne({
            where: {
                id_prueba: id_prueba
            }
        })
        if (prueba) {
            if (await Prueba.update(req.body, {
                    where: {
                        id_prueba: id_prueba
                    }
                })) {
                return res.status(200).json({
                    estado: true,
                    mensaje: "Se actualizó correctamente la prueba."
                })
            }
        }
        return res.status(404).send('La prueba con el ID especificado no existe')
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({
            error: "Error al actualizar la prueba."
        })
    }
};

exports.eliminar = async(req, res) => {
    try {
        const id_prueba = req.params.id_prueba
        await Prueba.destroy({
            where: {
                id_prueba: id_prueba
            },
            force: true
        })
        return res.status(200).json({
            estado: true,
            mensaje: "Se eliminó correctamente la prueba."
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({
            error: "Error al eliminar la prueba."
        })
    }
};

exports.getOriginateParams = async(body) => {
    var params = ['phone', 'context', 'exten', 'priority', 'channel', 'referer'];
    var data = {
        'context': 'monitoreo',
        'exten': 's',
        'priority': '1',
        'referer': 'test'
    }
    for (var i in params) {
        var param = params[i];
        if (body[param] != undefined) {
            data[param] = body[param];
        }
    }
    return data;
};

exports.originate = async(req, res) => {
    try {
        var data = await this.getOriginateParams(req.body);
        var uid = 'UID';
        const result = await asteriskService.originate({
            'data': data,
            'guid': uid
        });
        return res.status(200).json({
            estado: true,
            result
        })
    } catch (error) {
        return res.status(500).send({
            error
        })
    }
};

exports.getOriginateParamsC2C = async(data, id_escenario = null) => {
    return {
        "phone": data['origen'].numero,
        "context": "monitoreo",
        "exten": "s",
        "priority": "1",
        "channel": "SIP/" + data['origen'].equipo['nombre'] + "/" + data['destino'].numero,
        "referer": id_escenario ? 'id_escenario:' + id_escenario : data['origen'].id_canal + "->" + data['destino'].numero
    };
};

exports.validateC2C = async(id_canal_origen, id_destino, tipo = 'C') => {
    let data = {};
    data['origen'] = await Canal.findOne({
        where: {
            id_canal: id_canal_origen
        },
        include: ['equipo']
    })
    if (!data['origen']) {
        return {
            "status": false,
            "data": {
                "id_origen": "El canal no existe"
            }
        }
    } else if (data['origen']['numero'] == null) {
        return {
            "status": false,
            "data": {
                "id_origen": "Número asociado es null"
            }
        }
    }
    if (tipo == 'C') {
        data['destino'] = await Canal.findOne({
            where: {
                id_canal: id_destino
            },
            include: ['equipo']
        })
    } else if (tipo == 'E') {
        data['destino'] = await NumeroExterno.findOne({
            where: {
                id_numero_externo: id_destino
            }
        })
    }
    if (!data['destino']) {
        return {
            "status": false,
            "data": {
                "id_destino": "El canal no existe"
            }
        }
    } else if (data['origen']['numero'] == null) {
        return {
            "status": false,
            "data": {
                "id_destino": "Número asociado es null"
            }
        }
    }
    return {
        "status": true,
        "data": data
    }
}

exports.canalHaciaCanal = async(req, res) => {
    try {
        const id_canal_origen = req.body.id_origen;
        const id_destino = req.body.id_destino;
        let validateParams = await this.validateC2C(id_canal_origen, id_destino);
        if (!validateParams.status) {
            return res.status(404).send(validateParams.data);
        }
        req.body = await this.getOriginateParamsC2C(validateParams.data);
        return exports.originate(req, res);
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Error."
        })
    }
};

exports.ejecutarEscenario = async(escenario) => {
    try {
        const id_canal_origen = escenario.id_canal_origen;
        const id_destino = escenario.id_destino;
        let validateParams = await this.validateC2C(id_canal_origen, id_destino, escenario.tipo);
        if (!validateParams.status) {
            //TODO: crear error de datos invalidos
            Escenario.update({
                    estado: 'ERROR'
                }, {
                    where: {
                        id_escenario: escenario.id_escenario
                    }
                })
                //return res.status(404).send(validateParams.data);
            return {
                estado: 'error',
                message: 'Parametros no válidos.'
            };
        }
        let originateParams = await this.getOriginateParamsC2C(validateParams.data, escenario.id_escenario);
        Canal.update({ estado_llamada: "SALIENTE"},
        {
            where: {
                id_canal: id_canal_origen
            }
        });
        if(escenario.tipo=='C'){
            Canal.update({ estado_llamada: "ENTRANTE"},{
                where: {
                    id_canal: id_destino
                }
            });
        }
        let hora_saliente = moment().format("HH:mm:ss");
        asteriskService.originate({
            'data': originateParams,
            'id_escenario': escenario.id_escenario
        }).then((res) => {
            if (res.code === 'STATUS_ORIGINATE_SUCCESS'){
                Escenario.update({
                    estado: 'PENDIENTE',
                    hora_saliente: hora_saliente
                }, {
                    where: {
                        id_escenario: escenario.id_escenario
                    }
                });
                return {
                    estado: 'success'
                }
            } else {
                Escenario.update({
                    estado: 'Failure',
                    hora_saliente: hora_saliente
                }, {
                    where: {
                        id_escenario: escenario.id_escenario
                    }
                });
                return {
                    estado: 'failure'
                }
            }
        }).catch((e) => {
            Escenario.update({
                estado: 'ERROR'
            }, {
                where: {
                    id_escenario: escenario.id_escenario
                }
            })
            return {
                estado: 'error',
                error: e
            }
        });
        //return exports.originate(req, res);
    } catch (error) {
        console.log(error);
        //return res.status(500).send({ error: "Error." })
    }
};

exports.ejecutarMatriz = async(id_matriz, id_prueba = null) => {
    const pruebas = [];
    if (id_matriz == null || typeof id_matriz == 'undefined') {
        return pruebas;
    }
    let ejecucion = null;
    if (id_prueba != null) {
        ejecucion = await Ejecucion.create({
            numero_prueba: 0,
            //fecha_inicio: new Date().toLocaleString(),
            fecha_inicio: moment().format("YYYY-MM-DD HH:mm:ss"),
            estado: 'CREADO',
            id_prueba
        });
    }
    const datos_matriz = await Matriz.obtenerDetalleMatriz(id_matriz);
    for await (let c2c of datos_matriz) {
        const id_canal_origen = c2c.id_canal_origen;
        const id_destino = c2c.tipo === 'C'? c2c.id_canal_destino : c2c.id_numero_externo_destino ;
        let validateParams = await this.validateC2C(id_canal_origen, id_destino, c2c.tipo);
        if (validateParams.status) {
            await Escenario.create({
                id_ejecucion: ejecucion.id_ejecucion,
                id_canal_origen: id_canal_origen,
                id_destino: id_destino,
                tipo: c2c.tipo,
                numero_intento: 0,
                estado: 'CREADO'
            });
            pruebas.push({
                'id_origen': id_canal_origen,
                'id_destino': id_destino
            });
            /*let originateParams = await this.getOriginateParamsC2C(validateParams.data);
            asteriskService.originate({
                'data': originateParams
            }).then((res)=>{
            }).catch((e)=>{
            });*/
        }
    }
    await Ejecucion.update({
        numero_prueba: pruebas.length,
        estado: 'PENDIENTE'
    }, {
        where: {
            id_ejecucion: ejecucion.id_ejecucion
        }
    })
    return pruebas;
}

exports.matriz = async(req, res) => {
    try {
        let pruebas = await this.ejecutarMatriz(req.body.id_matriz);
        return res.status(200).json({
            estado: true,
            mensaje: pruebas
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Error."
        })
    }
};

exports.equipo = async(req, res) => {
    try {
        //let pruebas = await this.ejecutarMatriz(req.body.id_matriz);
        //return res.status(200).json({ estado: true, mensaje: pruebas });
        /*asteriskService.isOnline().then((res)=>{
            console.log(res)
        }).catch((e)=>{
        });*/
        /*asteriskService.checkPeerStatus({ 'peer' :  'Base1' , 'results' : [] }).then(res=>{
            console.log(res)
        })*/
        console.log(await asteriskService.checkPeersStatus(['Base1', 'Equipo_prueba']));
        return res.status(200);
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Error."
        })
    }
};