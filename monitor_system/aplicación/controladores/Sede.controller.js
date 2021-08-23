const db = require("../models")
const Sede = db.sede
const Op = db.Sequelize.Op


exports.obtenerTodos = async (req, res) => {
    try {
        const sedes = await Sede.findAll()
        return res.status(200).json({
            estado: true,
            sedes
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener las sedes."
        })
    }
};
