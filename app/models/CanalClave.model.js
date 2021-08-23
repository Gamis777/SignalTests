module.exports = (sequelize, Sequelize) => {
    const CanalClave = sequelize.define("canales_claves", {
        id_canal: {
            type: Sequelize.INTEGER
        },
        id_registro_clave: {
            type: Sequelize.INTEGER
        }
    }, {
        timestamps: false
    });
    //CanalClave.sync({ alter: true });
    return CanalClave;
};
