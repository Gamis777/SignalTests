module.exports = app => {
    const numeroexterno = require("../controllers/NumeroExterno.controller.js");

    var router = require("express").Router();

    router.get("/", numeroexterno.obtenerTodos);

    router.post("/", numeroexterno.crear);

    router.get("/:id_numero_externo", numeroexterno.buscarUno)

    router.put("/:id_numero_externo", numeroexterno.actualizar)

    router.delete("/:id_numero_externo", numeroexterno.eliminar)

    app.use('/api/numeros-externos', router);
}
