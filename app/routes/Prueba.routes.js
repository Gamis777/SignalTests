const pruebas = require("../controllers/Prueba.controller.js");

module.exports = (app, asteriskService = null) => {

    pruebas.setAsteriskService(asteriskService);

    var router = require("express").Router();

    router.get("/", pruebas.obtenerTodos);

    router.post("/", pruebas.crear);

    router.post("/externo", pruebas.crearExterno);

    router.post("/ejecutar/originate", pruebas.originate);

    router.post("/ejecutar/c2c", pruebas.canalHaciaCanal);

    router.post("/ejecutar/matriz", pruebas.matriz);

    router.post("/test_equipo", pruebas.equipo);

    router.get("/:id_prueba", pruebas.buscarUno);

    router.put("/:id_prueba", pruebas.actualizar);

    router.delete("/:id_prueba", pruebas.eliminar);

    app.use('/api/pruebas', router);
};

exports.getController = async () => {
    return pruebas;
};
