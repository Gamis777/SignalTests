module.exports = (sequelize, Sequelize) => {
    const NumeroExterno = sequelize.define("numeros_externos", {
        id_numero_externo: {
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
        numero: {
            type: Sequelize.STRING
        }
    }, {
        timestamps: false
    });
    //NumeroExterno.sync({ alter: true });
    return NumeroExterno;
};
