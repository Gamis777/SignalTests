const db = require("../models")
const Tecnologia = db.tecnologia
const Op = db.Sequelize.Op
const {
    validationResult
} = require('express-validator')


exports.obtenerTodos = async (req, res) => {
    try {
        const tecnologias = await Tecnologia.findAll({
            include: ['operadores']
        })
        return res.status(200).json({
            estado: true,
            tecnologias
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener las tecnologias."
        })
    }
};

exports.crear = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        })
    }

    try {
        const datos_tecnologia = {
            nombre: req.body.nombre
        }
        const tecnologia = await Tecnologia.create(datos_tecnologia)
        return res.status(201).json({
            estado: true,
            mensaje: "Se creó correctamente la tecnologia.",
            data: tecnologia
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al crear la tecnologia."
        })
    }
};

exports.buscarUno = async (req, res) => {
    try {
        const id_tecnologia = req.params.id_tecnologia
        const tecnologia = await Tecnologia.findOne({
            where: {
                id_tecnologia: id_tecnologia
            },
            include: ['operadores']
        })
        if (tecnologia) {
            return res.status(200).json({
                estado: true,
                tecnologia
            })
        }
        return res.status(404).send('La tecnologia con el ID especificado no existe')
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener la tecnologia."
        })
    }
};

exports.actualizar = async (req, res) => {
    try {
        const id_tecnologia = req.params.id_tecnologia
        const tecnologia = await Tecnologia.findOne({
            where: {
                id_tecnologia: id_tecnologia
            }
        })
        if (tecnologia) {
            if (await Tecnologia.update(req.body, {
                    where: {
                        id_tecnologia: id_tecnologia
                    }
                })) {
                return res.status(200).json({
                    estado: true,
                    mensaje: "Se actualizó correctamente la tecnologia"
                })
            }
        }
        return res.status(404).send('La tecnologia con el ID especificado no existe')
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({
            error: "Error al actualizar la tecnologia."
        })
    }
};

exports.eliminar = async (req, res) => {
    try {
        const id_tecnologia = req.params.id_tecnologia
        await Tecnologia.destroy({
            where: {
                id_tecnologia: id_tecnologia
            },
            force: true
        })
        return res.status(200).json({
            estado: true,
            mensaje: "Se eliminó correctamente la tecnología"
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({
            error: "Error al eliminar la tecnología."
        })
    }
};
