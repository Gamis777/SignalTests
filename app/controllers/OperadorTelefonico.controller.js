const db = require("../models");
const Operador = db.operadortelefonico;

exports.obtenerTodos = async (_req, res) => {
    try {
        const operadores = await Operador.findAll({
            include: ["tecnologias"]
        })
        return res.status(200).json({
            estado: true,
            operadores
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener los operadores."
        })
    }
};

exports.crear = async (req, res) => {
    try {
        const datos_operador = {
            nombre: req.body.nombre,
            codigo: req.body.codigo
        }
        const operador = await Operador.create(datos_operador, {
            transaction: t
        })
        await operador.addTecnologias(req.body.tecnologias, {
            transaction: t
        })
        return res.status(201).json({
            estado: true,
            mensaje: "Se creó correctamente el operador."
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al crear el operador."
        })
    }
};

exports.buscarUno = async (req, res) => {
    try {
        const id_operador_telefonico = req.params.id_operador_telefonico
        const operador = await Operador.findOne({
            where: {
                id_operador_telefonico: id_operador_telefonico
            },
            include: ["tecnologias"]
        })
        if (operador) {
            return res.status(200).json({
                estado: true,
                operador
            })
        }
        return res.status(404).send('El operador con el ID especificado no existe')
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener el operador."
        })
    }
};

exports.actualizar = async (req, res) => {
    try {
        const id_operador_telefonico = req.params.id_operador_telefonico
        const tecnologias = req.body.tecnologias
        const operador = await Operador.findOne({
            where: {
                id_operador_telefonico: id_operador_telefonico
            },
            include: ["tecnologias"]
        })
        if (operador) {
            await Operador.update(req.body, {
                where: {
                    id_operador_telefonico: id_operador_telefonico
                }
            })
            /**Proceso para agregar y eliminar tecnologias que pertenecen a un operador telefonico */
            const tecnologiasArrayId = operador.tecnologias.map((x) => x.id_tecnologia)
            const tecnologiasAgregar = tecnologias.filter(x => !tecnologiasArrayId.includes(x))
            const tecnologiasEliminar = tecnologiasArrayId.filter(x => !tecnologias.includes(x))
            await operador.addTecnologias(tecnologiasAgregar)
            await operador.removeTecnologias(tecnologiasEliminar)
            /**---------------------------------------------------------------------- */
            return res.status(200).json({
                estado: true,
                mensaje: "Se actualizó correctamente el operador"
            })
        }
        return res.status(404).send('El operador con el ID especificado no existe')
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({
            error: "Error al actualizar el operador."
        })
    }
};

exports.eliminar = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const id_operador_telefonico = req.params.id_operador_telefonico
        const operador = await Operador.findOne({
            where: {
                id_operador_telefonico: id_operador_telefonico
            },
            include: ["tecnologias"]
        })
        const tecnologiasArrayId = operador.tecnologias.map((x) => x.id_tecnologia)
        await operador.removeTecnologias(tecnologiasArrayId, {
            transaction: t
        })
        await Operador.destroy({
            where: {
                id_operador_telefonico: id_operador_telefonico
            },
            force: true,
            transaction: t
        })
        await t.commit();
        return res.status(200).json({
            estado: true,
            mensaje: "Se eliminó correctamente el operador."
        })
    } catch (error) {
        await t.rollback();
        console.log(error.message);
        return res.status(500).send({
            error: "Error al eliminar el operador."
        })
    }
};
