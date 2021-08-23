module.exports = app => {
    const perfiles = require("../controllers/Perfil.controller.js");

    var router = require("express").Router();

    router.get("/", perfiles.obtenerTodos);

    router.post("/", perfiles.crear);

    router.get("/:id_perfil", perfiles.buscarUno);

    router.put("/:id_perfil", perfiles.actualizar);

    router.delete("/:id_perfil", perfiles.eliminar);

    app.use('/api/perfiles', router);
};
