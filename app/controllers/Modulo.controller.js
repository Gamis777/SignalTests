const db = require("../models")
const Modulo = db.modulo

exports.obtenerTodos = async (_req, res) => {
    try {
        const modulos = await Modulo.findAll({
            include: 'submodulos'
        })
        return res.status(200).json({
            estado: true,
            modulos
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener los modulos."
        })
    }
};
