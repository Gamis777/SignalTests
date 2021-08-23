module.exports = app => {
    const modulo = require("../controllers/Modulo.controller.js")

    var router = require("express").Router();

    router.get("/", modulo.obtenerTodos);

    app.use('/api/modulos', router);
}
