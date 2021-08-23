module.exports = (sequelize, Sequelize) => {
    const Submodulo = sequelize.define("submodulos", {
        id_submodulo: {
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
        },
        id_modulo: {
            type: Sequelize.INTEGER
        }
    }, {
        timestamps: false
    });
    //Submodulo.sync({ alter: true });
    return Submodulo;
};
