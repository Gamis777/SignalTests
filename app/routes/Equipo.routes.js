module.exports = (app, asteriskService = null) => {
    const equipo = require("../controllers/Equipo.controller.js");

    equipo.setAsteriskService(asteriskService);

    var router = require("express").Router();

    router.get("/:id_equipo", equipo.buscarUno);

    router.get("/", equipo.obtenerTodos);

    router.post("/", equipo.crear);

    router.put("/:id_equipo", equipo.actualizar);

    router.delete("/:id_equipo", equipo.eliminar);

    app.use('/api/equipos', router);
}
