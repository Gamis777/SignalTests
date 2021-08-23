module.exports = (sequelize, Sequelize) => {
    const Error = sequelize.define("errores", {
        id_error: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        codigo: {
            type: Sequelize.STRING
        },
        estado: {
            type: Sequelize.STRING
        },
        mensaje: {
            type: Sequelize.STRING
        }
    }, {
        timestamps: false
    });
    //Error.sync({ alter: true });
    return Error;
};
