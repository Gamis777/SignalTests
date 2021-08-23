const db = require("../models");
const Matriz = db.matriz;

exports.obtenerTodos = async (_req, res) => {
    try {
        const matrices = await Matriz.findAll({
          where : {
            estado : true
          }
        });
        return res.status(200).json({
            estado: true,
            matrices
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener las matrices."
        });
    }
};

exports.crear = async (req, res) => {
    /*const t = await db.sequelize.transaction();
    try {
        const datos_matriz = {
            nombre: req.body.nombre,
        };
        const matriz = await Matriz.create(datos_matriz, { transaction: t })
        await Matriz.insertarDataMatrizCanales(
            matriz.id_matriz,
            req.body.matriz_canales,
            t
        );
        await Matriz.insertarDataMatrizNumerosExternos(
            matriz.id_matriz,
            req.body.matriz_numeros_externos,
            t
        );
        await t.commit()
        return res.status(201).json({ estado: true, mensaje: "Se creó correctamente la matriz." })
    } catch (error) {
        await t.rollback()
        console.log(error.message)
        return res.status(500).json({ error: "Error al crear la matriz." })
    }*/
    const t = await db.sequelize.transaction();
    try {
        const datos_matriz = {
            nombre: req.body.nombre,
            estado: true
        };
        const matriz = await Matriz.create(datos_matriz, {
            transaction: t
        });
        await Matriz.insertarDataMatriz(matriz.id_matriz, req.body.matriz_data, t);
        await t.commit();
        return res
            .status(201)
            .json({
                estado: true,
                mensaje: "Se creó correctamente la matriz.",
                data: matriz
            });
    } catch (error) {
        await t.rollback();
        console.log(error.message);
        return res.status(500).json({
            error: "Error al crear la matriz."
        });
    }
};

exports.buscarUno = async (req, res) => {
    try {
        const id_matriz = req.params.id_matriz;
        let matriz = await Matriz.findOne({
            where: {
                id_matriz: id_matriz
            },
            include: [{
                model: db.matriz_canal_destino,
                as: 'conexiones',
                where: {
                    'estado': 'ACTIVO'
                },
                required: false,
                include: [
                    {
                        model: db.canal,
                        as: 'canal_origen',
                        include: [{
                            model: db.tecnologiaoperador,
                            as: 'tecnologia_operador',
                            include: [{
                                    model: db.tecnologia,
                                    as: 'tecnologia'
                                },
                                {
                                    model: db.operadortelefonico,
                                    as: 'operador'
                                }
                            ]
                        }],
                        required: false
                    },
                    {
                        model: db.canal,
                        as: 'canal_destino',
                        where: {
                            '$conexiones.tipo$': 'C'
                        },
                        required: false,
                        include: [{
                            model: db.tecnologiaoperador,
                            as: 'tecnologia_operador',
                            include: [{
                                    model: db.tecnologia,
                                    as: 'tecnologia'
                                },
                                {
                                    model: db.operadortelefonico,
                                    as: 'operador'
                                }
                            ]
                        }]
                    },
                    {
                        model: db.numeroexterno,
                        as: 'numero_externo',
                        required: false,
                        where: {
                            '$conexiones.tipo$': 'E'
                        },
                    }
                ]
            }]
        });
        return res.status(200).json({
            estado: true,
            matriz
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Error al obtener la matriz."
        });
    }
};

exports.actualizar = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const id_matriz = req.params.id_matriz
        await Matriz.update(req.body, {
            where: {
                id_matriz: id_matriz
            },
            transaction: t
        })
        await Matriz.eliminarDataMatrizCanales(id_matriz, t)
        //await Matriz.eliminarDataMatrizNumerosExternos(id_matriz, t)
        await Matriz.insertarDataMatriz(id_matriz, req.body.matriz_data, t);
        //await Matriz.insertarDataMatrizNumerosExternos(id_matriz, req.body.matriz_numeros_externos, t);
        await t.commit();
        return res.status(200).json({
            estado: true,
            mensaje: "Se actualizó correctamente la matriz"
        })
    } catch (error) {
        await t.rollback()
        console.log(error.message)
        return res.status(500).json({
            error: "Error al actualizar la matriz."
        })
    }
};

exports.eliminar = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const id_matriz = req.params.id_matriz;
        let matriz = await Matriz.findOne({
            where: {
                id_matriz: id_matriz,
                estado: true
            }});
        if(matriz){
            await matriz.update({ estado: false }, {transaction: t});
            await t.commit();
            return res.status(200).json({
                estado: true,
                mensaje: "Se eliminó correctamente la matriz",
            })
        }
        return res.status(404).send('La matriz con el ID especificado no existe')
    } catch (error) {
        await t.rollback()
        console.log(error.message);
        return res.status(500).send({
            error: "Error al eliminar la matriz."
        })
    }
};
