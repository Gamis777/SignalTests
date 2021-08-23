const db = require("../models"),
    AsteriskConfService = require('../services/asterisk.conf.service');
const Equipo = db.equipo;
const Canal = db.canal;
const TecnologiaOperador = db.tecnologiaoperador;
const Op = db.Sequelize.Op;
var asteriskService = null;

exports.setAsteriskService = async (baseAsteriskService) => {
    asteriskService = baseAsteriskService;
}

exports.obtenerTodos = async (req, res) => {
    try {
        const results = await Equipo.findAll({
            include: ["canales", "sede"],
            order: [
                ["id_equipo", "ASC"],
                ["canales","posicion","ASC"], 
                ["canales", "id_canal", "ASC"]
            ]
        })
        const equipos = await iterarEquipos(results)
        return res.status(200).json({
            estado: true,
            equipos
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener los equipos."
        })
    }
};

exports.crear = async (req, res) => {
    //Transacción
    const t = await db.sequelize.transaction();
    try {

        let datos_equipo = {
            nombre: req.body.nombre,
            ip: req.body.ip,
            tipo: req.body.tipo,
            ranuras: req.body.ranuras,
            id_sede: req.body.id_sede,
            estado: 'A',
            canales: []
        }
        datos_equipo.canales = await iterarCanales(req.body.canales)
        const equipo = await Equipo.create(datos_equipo, {
            include: ["canales"]
        }, {
            transaction: t
        })
        await t.commit();
        if (asteriskService != null) {
            await AsteriskConfService.write();
            asteriskService.reload();
        }
        //await equipo.addCanales(req.body.canales)
        return res.status(201).json({
            estado: true,
            mensaje: "Se creó correctamente el equipo",
            data: equipo
        })
    } catch (error) {
        await t.rollback();
        console.log(error.message);
        return res.status(500).json({
            error: "Error al crear el equipo."
        })
    }
};

exports.buscarUno = async (req, res) => {
    try {
        const id_equipo = req.params.id_equipo
        const equipo = await Equipo.findOne({
            where: {
                id_equipo: id_equipo
            },
            include: ["canales"]
        })
        if (equipo) {
            let equipo_response = await Equipo.findOne({
                where: {
                    id_equipo: id_equipo
                },
                include: ["sede"]
            })
            const canales = await iterarCanalesBuscar(equipo.canales);
            equipo_response.setDataValue('canales', canales)
            return res.status(200).json({
                estado: true,
                equipo_response
            })
        }
        return res.status(404).send('El equipo con el ID especificado no existe')
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener el equipo."
        })
    }
};

exports.actualizar = async (req, res) => {
    try {
        const id_equipo = req.params.id_equipo
        const equipo = await Equipo.findOne({
            where: {
                id_equipo: id_equipo
            },
            include: ["canales"]
        })
        if (equipo) {
            let datos_equipo = {
                nombre: req.body.nombre,
                ip: req.body.ip,
                tipo: req.body.tipo,
                ranuras: req.body.ranuras,
                id_sede: req.body.id_sede,
            }
            await Equipo.update(datos_equipo, {
                where: {
                    id_equipo: id_equipo
                }
            })
            const canales = await iterarCanales(req.body.canales)
            const canales_actualizar = canales.filter((e) => {
                return e.hasOwnProperty('id_canal')
            })
            const canales_agregar = canales.filter((e) => {
                return !e.hasOwnProperty('id_canal')
            })
            const canales_eliminar = await compararCanales(equipo.canales, canales_actualizar)
            await iterarCanalesActualizar(canales_actualizar)
            await iterarCanalesCrear(canales_agregar, id_equipo)
            await iterarCanalesEliminar(canales_eliminar)
            if (asteriskService != null) {
                await AsteriskConfService.write();
                asteriskService.reload();
            }
            return res.status(200).json({
                estado: true,
                mensaje: "Se actualizó correctamente el equipo"
            })
        }
        return res.status(404).send('El equipo con el ID especificado no existe')
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({
            error: "Error al actualizar el equipo."
        })
    }
};

exports.eliminar = async (req, res) => {
    try {
        const id_equipo = req.params.id_equipo
        await Canal.destroy({
            where: {
                id_equipo: id_equipo
            },
            force: true
        })
        await Equipo.destroy({
            where: {
                id_equipo: id_equipo
            },
            force: true
        })
        if (asteriskService != null) {
            await AsteriskConfService.write();
            asteriskService.reload();
        }
        return res.status(200).json({
            estado: true,
            mensaje: "Se eliminó correctamente el equipo."
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({
            error: "Error al eliminar equipo."
        })
    }
};

const iterarCanales = async (canales) => {
    let data = []
    for (const i in canales) {
        let tecnologiaoperador = await TecnologiaOperador.findOne({
            where: {
                [Op.and]: [{
                    id_tecnologia: canales[i].id_tecnologia
                }, {
                    id_operador_telefonico: canales[i].id_operador
                }]
            }
        })
        let id_tecnologia_operador = tecnologiaoperador ? tecnologiaoperador.id_tecnologia_operador : null
        let send = {
            id_tecnologia_operador: id_tecnologia_operador,
            nro_ranura: canales[i].nro_ranura,
            numero: canales[i].numero
        }
        if (canales[i].id_canal) {
            send.id_canal = canales[i].id_canal
        }
        if (canales[i].posicion) {
            send.posicion = Number(canales[i].posicion)
        } else {
            send.posicion = Number(i)
        }
        data.push(send)
    }
    return data
}

const iterarCanalesBuscar = async (canales) => {
    let data = []
    for (let i in canales) {
        if (canales[i].id_tecnologia_operador != null) {
            let tecnologiaoperador = await TecnologiaOperador.findOne({
                where: {
                    id_tecnologia_operador: canales[i].id_tecnologia_operador
                },
                include: ["operador", "tecnologia"]
            })
            canales[i].setDataValue('nombre_operador', tecnologiaoperador.tecnologia.nombre)
            canales[i].setDataValue('nombre_tecnologia', tecnologiaoperador.operador.nombre)
            canales[i].setDataValue('id_tecnologia', tecnologiaoperador.id_tecnologia)
            canales[i].setDataValue('id_operador', tecnologiaoperador.id_operador_telefonico)
        }
        data.push(canales[i])
    }
    return data
}


const iterarCanalesActualizar = async (canales) => {
    let promises = [];
    canales.forEach(function(canal) {
        promises.push(Canal.update({
            id_tecnologia_operador: canal.id_tecnologia_operador,
            nro_ranura: canal.nro_ranura,
            numero: canal.numero,
            posicion: canal.posicion
        }, {
            where: {
                id_canal: canal.id_canal
            }
        }))
    })
    Promise.all(promises).then(function() {
        return true
    }, function(err) {
        // error
        return false
    });
}

const compararCanales = async (canales_db, canales_body) => {
    const canalesArrayId = canales_body.map((x) => x.id_canal)
    const canalesEliminar = canales_db.filter(x => !canalesArrayId.includes(x.id_canal))
    return canalesEliminar
}

const iterarCanalesCrear = async (canales, id_equipo) => {
    let promises = [];
    canales.forEach(function(canal) {
        promises.push(Canal.create({
            id_tecnologia_operador: canal.id_tecnologia_operador,
            id_equipo: id_equipo,
            numero: canal.numero,
            nro_ranura: canal.nro_ranura,
            posicion: canal.posicion
        }))
    })
    Promise.all(promises).then(function() {
        return true
    }, function(err) {
        // error
        return false
    });
}

const iterarCanalesEliminar = async (canales) => {
    let promises = [];
    canales.forEach(function(canal) {
        promises.push(Canal.destroy({
            where: {
                id_canal: canal.id_canal
            },
            force: true
        }))
    })
    Promise.all(promises).then(function() {
        return true
    }, function(err) {
        // error
        return false
    });
}

const iterarEquipos = async (equipos) => {
    for (const i in equipos) {
        let estado = JSON.stringify(await asteriskService.checkPeerStatus({
            'peer': equipos[i].nombre,
            'results': []
        })).split('')[1] === 't' ? 'A' : 'D'
        equipos[i].setDataValue('estado', estado)
    }
    return equipos
}
