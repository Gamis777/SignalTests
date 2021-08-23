const db = require("../models")
const Perfil = db.perfil
const Usuario = db.usuario
const Submodulo = db.submodulo

exports.obtenerTodos = async (_req, res) => {
    try {
        const perfiles = await Perfil.findAll({
            include: [{
                    model: Submodulo,
                    as: 'submodulos',
                    attributes: ['id_submodulo', 'nombre', 'icono'],
                    through: {
                        attributes: []
                    }
                },
                {
                    model: Usuario,
                    as: 'usuarios',
                    attributes: ['id_usuario', 'nombres', 'apellidos']
                }
            ]
        })
        return res.status(200).json({
            estado: true,
            perfiles
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Se produjo un error al recuperar los perfiles."
        })
    }
};

exports.crear = async (req, res) => {
    //Transacción
    const t = await db.sequelize.transaction();
    try {
        const datos_perfil = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            estado: 'A'
        }
        const perfil = await Perfil.create(datos_perfil, {
            transaction: t
        })
        await perfil.addSubmodulos(req.body.submodulos, {
            transaction: t
        })
        await t.commit();
        return res.status(201).json({
            estado: true,
            mensaje: "Se creó correctamente el perfil"
        })
    } catch (error) {
        await t.rollback();
        console.log(error.message);
        return res.status(500).json({
            error: "Error al crear el perfil."
        })
    }
};

exports.buscarUno = async (req, res) => {
    try {
        const id_perfil = req.params.id_perfil
        const perfil = await Perfil.findOne({
            where: {
                id_perfil: id_perfil
            },
            include: [{
                model: Submodulo,
                as: 'submodulos',
                attributes: ['id_submodulo', 'nombre', 'icono'],
                through: {
                    attributes: []
                }
            }]
        })
        if (perfil) {
            return res.status(200).json({
                estado: true,
                perfil
            })
        }
        return res.status(404).send('El perfil con el ID especificado no existe')
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener el perfil."
        })
    }
};

exports.actualizar = async (req, res) => {
    //Transacción
    const t = await db.sequelize.transaction();
    try {
        const id_perfil = req.params.id_perfil
        const submodulos = req.body.submodulos
        const perfil = await Perfil.findOne({
            where: {
                id_perfil: id_perfil
            },
            include: ["submodulos"]
        })
        if (perfil) {
            await Perfil.update(req.body, {
                where: {
                    id_perfil: id_perfil
                }
            }, {
                transaction: t
            })
            /**Proceso para agregar y eliminar submodulos que pertenecen a un perfil */
            const submodulosArrayId = perfil.submodulos.map((x) => x.id_submodulo)
            const submodulosAgregar = submodulos.filter(x => !submodulosArrayId.includes(x))
            const submodulosEliminar = submodulosArrayId.filter(x => !submodulos.includes(x))
            await perfil.addSubmodulos(submodulosAgregar, {
                transaction: t
            })
            await perfil.removeSubmodulos(submodulosEliminar, {
                transaction: t
            })
            /**---------------------------------------------------------------------- */
            await t.commit();
            return res.status(200).json({
                estado: true,
                mensaje: "Se actualizó correctamente el perfil"
            })
        }
        return res.status(404).send('El perfil con el ID especificado no existe')
    } catch (error) {
        await t.rollback();
        console.log(error.message);
        return res.status(500).send({
            error: "Error al actualizar el perfil."
        })
    }
};

exports.eliminar = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const id_perfil = req.params.id_perfil
        const perfil = await Perfil.findOne({
            where: {
                id_perfil: id_perfil
            },
            include: ["submodulos"]
        })
        const submodulosArrayId = perfil.submodulos.map((x) => x.id_submodulo)
        await perfil.removeSubmodulos(submodulosArrayId, {
            transaction: t
        })
        await Perfil.destroy({
            where: {
                id_perfil: id_perfil
            },
            force: true,
            transaction: t
        })
        await t.commit();
        return res.status(200).json({
            estado: true,
            mensaje: "Se eliminó correctamente el perfil"
        })
    } catch (error) {
        await t.rollback();
        console.log(error.message);
        return res.status(500).send({
            error: "Error al eliminar el perfil."
        })
    }
};
