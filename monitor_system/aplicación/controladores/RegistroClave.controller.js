const db = require("../models")
const RegistroClave = db.registroclave
const Canal = db.canal
const OperadorTelefonico = db.operadortelefonico
const Tecnologia = db.tecnologia
const Op = db.Sequelize.Op


exports.obtenerTodos = async (req, res) => {
    try {
        const datos = await RegistroClave.findAll()
        return res.status(200).json({
            estado: true,
            datos
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener."
        })
    }
};

exports.crear = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const datos = {
            nombre: req.body.nombre,
            comentario: req.body.comentario,
            clave: req.body.clave
        }
        const registro_clave = await RegistroClave.create(datos, {
            transaction: t
        })
        await registro_clave.addCanales(req.body.canales, {
            transaction: t
        })
        await t.commit();
        return res.status(201).json({
            estado: true,
            mensaje: "Se creó correctamente."
        })
    } catch (error) {
        await t.rollback();
        console.log(error.message);
        return res.status(500).json({
            error: "Error al crear."
        })
    }
};

exports.buscarUno = async (req, res) => {
    try {
        const id_registro_clave = req.params.id_registro_clave
        const dato = await RegistroClave.findOne({
            where: {
                id_registro_clave: id_registro_clave
            },
            include: [{
                model: Canal,
                as: 'canales',
                include: ['tecnologia_operador']
            }]
        })
        if (dato) {
            const canales = await iterarCanalesRegistroClave(dato.canales)
            dato.setDataValue('canales', canales)
            return res.status(200).json({
                estado: true,
                dato
            })
        }
        return res.status(404).send('El ID especificado no existe')
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener los datos."
        })
    }
};

exports.actualizar = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const id_registro_clave = req.params.id_registro_clave
        const canales = req.body.canales
        const dato = await RegistroClave.findOne({
            where: {
                id_registro_clave: id_registro_clave
            },
            include: ['canales']
        })
        if (dato) {
            await RegistroClave.update(req.body, {
                where: {
                    id_registro_clave: id_registro_clave
                }
            }, {
                transaction: t
            })
            /**Proceso para agregar y eliminar canales que pertenecen a un registro */
            const canalesArrayId = dato.canales.map((x) => x.id_canal)
            const canalesAgregar = canales.filter(x => !canalesArrayId.includes(x))
            const canalesEliminar = canalesArrayId.filter(x => !canales.includes(x))
            await dato.addCanales(canalesAgregar, {
                transaction: t
            })
            await dato.removeCanales(canalesEliminar, {
                transaction: t
            })
            /**---------------------------------------------------------------------- */
            await t.commit();
            return res.status(200).json({
                estado: true,
                mensaje: "Se actualizó correctamente"
            })
        }
        return res.status(404).send('El ID especificado no existe')
    } catch (error) {
        await t.rollback();
        console.log(error.message);
        return res.status(500).send({
            error: "Error al actualizar."
        })
    }
};

exports.eliminar = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const id_registro_clave = req.params.id_registro_clave
        const dato = await RegistroClave.findOne({
            where: {
                id_registro_clave: id_registro_clave
            },
            include: ['canales']
        })
        const canalesArrayId = dato.canales.map((x) => x.id_canal)
        await dato.removeCanales(canalesArrayId, {
            transaction: t
        })
        await RegistroClave.destroy({
            where: {
                id_registro_clave: id_registro_clave
            },
            force: true,
            transaction: t
        })
        await t.commit();
        return res.status(200).json({
            estado: true,
            mensaje: "Se eliminó correctamente"
        })
    } catch (error) {
        await t.rollback();
        console.log(error.message);
        return res.status(500).send({
            error: "Error al eliminar."
        })
    }
};

const iterarCanalesRegistroClave = async (canales) => {
    for (const i in canales) {
        let operadortelefonico = await OperadorTelefonico.findOne({
            where: {
                id_operador_telefonico: canales[i].tecnologia_operador.id_operador_telefonico
            }
        })
        let tecnologia = await Tecnologia.findOne({
            where: {
                id_tecnologia: canales[i].tecnologia_operador.id_tecnologia
            }
        })
        canales[i].tecnologia_operador.setDataValue('nombre_operador', operadortelefonico.nombre)
        canales[i].tecnologia_operador.setDataValue('nombre_tecnologia', tecnologia.nombre)
    }
    return canales
}
