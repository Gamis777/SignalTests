module.exports = app => {
    const usuarios = require("../controllers/Usuario.controller.js");

    var router = require("express").Router();

    router.get("/", usuarios.obtenerTodos);

    router.post("/", usuarios.crear);

    router.get("/:id_usuario", usuarios.buscarUno);

    router.put("/:id_usuario", usuarios.actualizar);

    router.delete("/:id_usuario", usuarios.eliminar);

    router.post("/validar-credenciales", usuarios.validarCredenciales);

    app.use('/api/usuarios', router);
};
