module.exports = app => {
    const tecnologia = require("../controllers/Tecnologia.controller.js");

    var router = require("express").Router();

    router.get("/", tecnologia.obtenerTodos);

    router.post("/", tecnologia.crear);

    router.get("/:id_tecnologia", tecnologia.buscarUno)

    router.put("/:id_tecnologia", tecnologia.actualizar)

    router.delete("/:id_tecnologia", tecnologia.eliminar)

    app.use('/api/tecnologias', router);
}
