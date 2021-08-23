module.exports = app => {
    const sede = require("../controllers/Sede.controller.js")

    var router = require("express").Router();

    router.get("/", sede.obtenerTodos);

    app.use('/api/sedes', router);
}
