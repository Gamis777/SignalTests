module.exports = app => {
    const registroclave = require("../controllers/RegistroClave.controller.js");

    var router = require("express").Router();

    router.get("/", registroclave.obtenerTodos);

    router.post("/", registroclave.crear);

    router.get("/:id_registro_clave", registroclave.buscarUno);

    router.put("/:id_registro_clave", registroclave.actualizar);

    router.delete("/:id_registro_clave", registroclave.eliminar);

    app.use('/api/registro-clave', router);
};
