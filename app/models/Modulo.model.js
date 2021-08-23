module.exports = (sequelize, Sequelize) => {
    const Modulo = sequelize.define("modulos", {
        id_modulo: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        nombre: {
            type: Sequelize.STRING
        },
        ruta: {
            type: Sequelize.STRING
        },
        icono: {
            type: Sequelize.STRING
        }
    }, {
        timestamps: false
    });
    //Modulo.sync({ alter: true });
    return Modulo;
};
