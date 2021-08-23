module.exports = (sequelize, Sequelize) => {
    const RegistroClave = sequelize.define("registros_claves", {
        id_registro_clave: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        nombre: {
            type: Sequelize.STRING
        },
        comentario: {
            type: Sequelize.STRING
        },
        clave: {
            type: Sequelize.STRING
        }
    }, {
        timestamps: false
    });
    //RegistroClave.sync({ alter: true });
    return RegistroClave;
};
