module.exports = (sequelize, Sequelize) => {
    const PerfilSubmodulo = sequelize.define("perfiles_submodulos", {
        id_submodulo: {
            type: Sequelize.INTEGER
        },
        id_perfil: {
            type: Sequelize.INTEGER
        }
    }, {
        timestamps: false
    });
    //PerfilSubmodulo.sync({ alter: true });
    return PerfilSubmodulo;
};
