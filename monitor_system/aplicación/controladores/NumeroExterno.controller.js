const db = require("../models");
const NumeroExterno = db.numeroexterno;

exports.obtenerTodos = async (_req, res) => {
    try {
        const numerosExternos = await NumeroExterno.findAll()
        return res.status(200).json({
            estado: true,
            numerosExternos
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener los números externos."
        })
    }
};

exports.crear = async (req, res) => {
    try {
        const datos_numeros_externos = {
            nombre: req.body.nombre,
            comentario: req.body.comentario,
            numero: req.body.numero
        }
        const numeroExterno = await NumeroExterno.create(datos_numeros_externos)
        return res.status(201).json({
            estado: true,
            mensaje: "Se creó correctamente el número externo.",
            data: numeroExterno
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al crear el número externo."
        })
    }
};

exports.buscarUno = async (req, res) => {
    try {
        const id_numero_externo = req.params.id_numero_externo
        const numeroExterno = await NumeroExterno.findOne({
            where: {
                id_numero_externo: id_numero_externo
            }
        })
        if (numeroExterno) {
            return res.status(200).json({
                estado: true,
                numeroExterno
            })
        }
        return res.status(404).send('El número externo con el ID especificado no existe')
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener la tecnologia."
        })
    }
};

exports.actualizar = async (req, res) => {
    try {
        const id_numero_externo = req.params.id_numero_externo
        const numeroExterno = await NumeroExterno.findOne({
            where: {
                id_numero_externo: id_numero_externo
            }
        })
        if (numeroExterno) {
            if (await NumeroExterno.update(req.body, {
                    where: {
                        id_numero_externo: id_numero_externo
                    }
                })) {
                //const usuario = await Usuario.findOne({ where: { id_usuario: id_usuario } })
                return res.status(200).json({
                    estado: true,
                    mensaje: "Se actualizó correctamente el número externo."
                })
            }
        }
        return res.status(404).send('El número externo con el ID especificado no existe')
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({
            error: "Error al actualizar el número externo."
        })
    }
};

exports.eliminar = async (req, res) => {
    try {
        const id_numero_externo = req.params.id_numero_externo
        await NumeroExterno.destroy({
            where: {
                id_numero_externo: id_numero_externo
            },
            force: true
        })
        return res.status(200).json({
            estado: true,
            mensaje: "Se eliminó correctamente el número externo."
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({
            error: "Error al eliminar el número externo."
        })
    }
};
