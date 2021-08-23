module.exports = app => {
    const matriz = require("../controllers/Matriz.controller.js");

    var router = require("express").Router();

    router.get("/", matriz.obtenerTodos);

    router.post("/", matriz.crear);

    router.get("/:id_matriz", matriz.buscarUno)

    router.put("/:id_matriz", matriz.actualizar)

    router.delete("/:id_matriz", matriz.eliminar)

    app.use('/api/matrices', router);
}
