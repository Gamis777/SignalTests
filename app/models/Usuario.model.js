module.exports = (sequelize, Sequelize) => {
    const Usuario = sequelize.define("usuarios", {
        id_usuario: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        nombres: {
            type: Sequelize.STRING
        },
        apellidos: {
            type: Sequelize.STRING
        },
        correo: {
            type: Sequelize.STRING,
            unique: true
        },
        acceso: {
            type: Sequelize.ENUM('A', 'D')
        },
        clave: {
            type: Sequelize.STRING
        },
        id_perfil: {
            type: Sequelize.INTEGER
        }
    }, {
        timestamps: false
    });
    //Usuario.sync({ alter: true });
    return Usuario;
};
