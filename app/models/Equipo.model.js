module.exports = (sequelize, Sequelize) => {
    const Equipo = sequelize.define("equipos", {
        id_equipo: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        nombre: {
            type: Sequelize.STRING
        },
        ip: {
            type: Sequelize.STRING
        },
        tipo: {
            type: Sequelize.STRING
        },
        ranuras: {
            type: Sequelize.STRING
        },
        id_sede: {
            type: Sequelize.INTEGER
        },
        estado: {
            type: Sequelize.STRING
        },
    }, {
        timestamps: false
    });
    //Equipo.sync({ alter: true });
    return Equipo;
};
