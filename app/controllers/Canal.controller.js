const db = require("../models")
const Canal = db.canal
const OperadorTelefonico = db.operadortelefonico
const Tecnologia = db.tecnologia
const Op = db.Sequelize.Op

exports.obtenerUno = async (req, res) => {
    try {

        const id_canal = req.params.id_canal;

        let canal = await Canal.findOne({
            where: {
                id_canal
            },
            include: ['tecnologia_operador']
        })

        if (canal) {
            canal = await agregarOperadorYTecnologia(canal);
            return res.status(200).json({
                estado: true,
                canal
            })
        }
        return res.status(404).send('El canal con el ID especificado no existe')

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener el canal."
        })
    }
};

exports.actualizar = async (req, res) => {
    try {
        const id_canal = req.params.id_canal
        const canal = await Canal.findOne({
            where: {
                id_canal
            }
        })
        if (canal) {
            if (await Canal.update(req.body, {
                    where: {
                        id_canal: id_canal
                    }
                })) {
                return res.status(200).json({
                    estado: true,
                    mensaje: "Se actualizó correctamente el canal"
                })
            }
        }
        return res.status(404).send('El canal con el ID especificado no existe')
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({
            error: "Error al actualizar el canal."
        })
    }
};

exports.obtenerTodos = async (_req, res) => {
    try {
        const canales_i = await Canal.findAll({
            where: {
                [Op.not]: {
                    id_tecnologia_operador: null
                }
            },
            include: ['tecnologia_operador']
        })
        const canales = await iterarCanalesTodos(canales_i)
        return res.status(200).json({
            estado: true,
            canales
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener los canales.",
            message: error.message
        })
    }
};

const agregarOperadorYTecnologia = async (canal) => {
    let operadortelefonico = await OperadorTelefonico.findOne({
        where: {
            id_operador_telefonico: canal.tecnologia_operador.id_operador_telefonico
        }
    });
    let tecnologia = await Tecnologia.findOne({
        where: {
            id_tecnologia: canal.tecnologia_operador.id_tecnologia
        }
    });
    canal.tecnologia_operador.setDataValue('nombre_operador', operadortelefonico.nombre);
    canal.tecnologia_operador.setDataValue('nombre_tecnologia', tecnologia.nombre);
    return canal;
}

const iterarCanalesTodos = async (canales) => {
    for (const i in canales) {
        canales[i] = await agregarOperadorYTecnologia(canales[i]);
    }
    return canales
}
