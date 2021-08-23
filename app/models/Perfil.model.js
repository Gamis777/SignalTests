module.exports = (sequelize, Sequelize) => {
    const Perfil = sequelize.define("perfiles", {
        id_perfil: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        nombre: {
            type: Sequelize.STRING
        },
        descripcion: {
            type: Sequelize.STRING
        },
        estado: {
            type: Sequelize.ENUM('A', 'D')
        }
    }, {
        timestamps: false
    });
    //Perfil.sync({ alter: true });
    return Perfil;
};
