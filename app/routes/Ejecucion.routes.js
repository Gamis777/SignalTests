module.exports = app => {
    const ejecucion = require("../controllers/Ejecucion.controller.js")

    var router = require("express").Router();

    router.get("/", ejecucion.obtenerTodos);

    router.get("/:id_ejecucion", ejecucion.buscarUno);

    router.get("/:id_ejecucion/escenarios", ejecucion.buscarEscenarios);

    router.get("/test_pdf/:id_ejecucion", ejecucion.sendEjecutionByMail);

    app.use('/api/ejecuciones', router);
}
