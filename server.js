'use strict';

require('dotenv').config();
var config = require('./config/config'),
    express = require("express"),
    bodyParser = require("body-parser"),
    cors = require("cors"),
    db = require("./app/models"),
    moment = require('moment'),
    handlbars = require('handlebars'),
    cron = require('node-cron'),
    AsteriskService = require('./app/services/asterisk.server.service');

const { Op } = require("sequelize");

var asteriskService = AsteriskService.create({
    params: config.asterisk,
    user: {}
});

const app = express();

/*var corsOptions = {
  origin: "http://localhost:8081"
};*/

app.use(cors());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

// ruta default
app.get("/", (_req, res) => {
    res.json({ message: "Aplicación creada por Phantomzx" })
})

handlbars.registerHelper('validarEscenario', function(tipo, canal, numeroExterno) {
    let data = tipo == 'C' ? "Canal " + canal : numeroExterno;
    return data;
});

require("./app/routes/RegistroClave.routes")(app);
require("./app/routes/Perfil.routes")(app);
require("./app/routes/Usuario.routes")(app);
require("./app/routes/Modulo.routes")(app);
require("./app/routes/Equipo.routes")(app, asteriskService);
require("./app/routes/Sede.routes")(app);
require("./app/routes/Canal.routes")(app);
require("./app/routes/OperadorTelefonico.routes")(app);
require("./app/routes/Tecnologia.routes")(app);
require("./app/routes/NumeroExterno.routes")(app);
require("./app/routes/Matriz.routes")(app);
require("./app/routes/Prueba.routes")(app, asteriskService);
require("./app/routes/Ejecucion.routes")(app);

//CRON: pruebas programadas
const pruebas = require("./app/controllers/Prueba.controller.js");
const ejecucionService = require("./app/services/ejecucion.service.js");
pruebas.setAsteriskService(asteriskService);
//Buscar pruebas programadas
cron.schedule('*/10 * * * * *', async() => {
    if (process.env.ASTERISK_ENV == 'production') {
        const limit = Number(process.env.ESCENARIOS_LIMIT, 5);
        const fecha_actual = moment().format("YYYY-MM-DD HH:mm:ss");
        let pruebasProgramadas = await db.prueba.buscarProgramadas(fecha_actual);
        for await (const prueba of pruebasProgramadas) {
            await pruebas.ejecutarMatriz(prueba.id_matriz, prueba.id_prueba);
        }
        //iterar por todas las ejecuciones con estado PENDIENTE,
        //buscar escenarios con estado CREADO, por cada uno
        //si no existe marcar como finalizado.
        let ejecuciones = await db.ejecucion.findAll({ where: { estado: 'PENDIENTE' } });
        for await (const ejecucion of ejecuciones) {
            let escenarios = await db.escenario.findAll(
                {
                    where: {
                        id_ejecucion: ejecucion.id_ejecucion,
                        estado: 'CREADO' 
                    },
                    include: [
                        {
                            model: db.canal,
                            as: 'canal_origen',
                            required: false
                        },
                        {
                            model: db.canal,
                            as: 'destino',
                            where: {
                                    '$escenarios.tipo$': 'C',
                            },
                            required: false,
                        }
                    ],
                    limit: 1
                }
            );
            if (escenarios.length > 0) {
                let escenarios_libres = await db.escenario.findAll({ 
                    where: {
                        [Op.and]: [
                            {
                                id_ejecucion: ejecucion.id_ejecucion,
                                estado: 'CREADO',
                                '$canal_origen.estado_llamada$': 'LIBRE',
                            },
                            {
                                [Op.or]: [
                                    {
                                        '$destino.estado_llamada$': 'LIBRE',
                                    },
                                    {
                                        'tipo': 'E'
                                    }
                                ]
                            }
                        ]
                    },
                    include: [
                        {
                            model: db.canal,
                            as: 'canal_origen',
                            required: false
                        },
                        {
                            model: db.canal,
                            as: 'destino',
                            where: {
                                    '$escenarios.tipo$': 'C',
                            },
                            required: false,
                        }
                    ],
                    limit: 1
                })
                if(escenarios_libres.length > 0){
                    for await (const escenario of escenarios_libres) {
                        await pruebas.ejecutarEscenario(escenario);
                    }
                } else {
                    for await (const escenario of escenarios) {
                        const origenUpdatedAt = moment(escenario.canal_origen.updatedAt).format("YYYY-MM-DD HH:mm:ss");
                        const destinoUpdatedAt = escenario.tipo === 'C' ? moment(escenario.destino.updatedAt).format("YYYY-MM-DD HH:mm:ss") : moment();
                        if (moment().diff(origenUpdatedAt,'seconds') > 60){
                            //console.log('origenUpdatedAt');
                            escenario.canal_origen.update({
                                estado_llamada: 'LIBRE'
                            });
                        }
                        if (moment().diff(destinoUpdatedAt,'seconds') > 60){
                            //console.log('destinoUpdatedAt');
                            escenario.destino.update({
                                estado_llamada: 'LIBRE'
                            });
                        }
                    }
                }
            } else {
                escenarios = await db.escenario.findAll(
                    {
                        where: {
                            id_ejecucion: ejecucion.id_ejecucion,
                            estado: 'PENDIENTE'
                        }
                    }
                )
                console.log(`ejecucion ${ejecucion.id_ejecucion}: escenarios ${escenarios.length}`);
                if(escenarios.length == 0){
                    await db.ejecucion.update(
                        {
                            estado: 'FINALIZADO',
                            fecha_fin: fecha_actual
                        }, 
                        {
                            where: {
                                id_ejecucion: ejecucion.id_ejecucion
                            }
                        });
                    ejecucionService.sendEjecutionByMail(ejecucion.id_ejecucion);
                }
            }
        }
    }
}, {
    scheduled: true,
    timezone: "America/Lima"
});
////////////////////////////////////////////

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
})