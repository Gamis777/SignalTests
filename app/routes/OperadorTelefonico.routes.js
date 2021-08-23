module.exports = app => {
    const operadortelefonico = require("../controllers/OperadorTelefonico.controller.js");

    var router = require("express").Router();

    router.get("/", operadortelefonico.obtenerTodos);

    router.post("/", operadortelefonico.crear);

    router.get("/:id_operador_telefonico", operadortelefonico.buscarUno)

    router.put("/:id_operador_telefonico", operadortelefonico.actualizar)

    router.delete("/:id_operador_telefonico", operadortelefonico.eliminar)

    app.use('/api/operadores-telefonicos', router);
}
