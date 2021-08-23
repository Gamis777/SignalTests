module.exports = app => {
    const canal = require("../controllers/Canal.controller.js")

    var router = require("express").Router();

    router.get("/", canal.obtenerTodos);

    router.get("/:id_canal", canal.obtenerUno);

    router.put("/:id_canal", canal.actualizar);

    app.use('/api/canales', router);
}
