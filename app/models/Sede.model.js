module.exports = (sequelize, Sequelize) => {
    const Sede = sequelize.define("sedes", {
        id_sede: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        nombre: {
            type: Sequelize.STRING
        }
    }, {
        timestamps: false
    });
    //Sede.sync({ alter: true });
    return Sede;
};
