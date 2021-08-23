module.exports = (sequelize, Sequelize) => {
    const Operador = sequelize.define("operadores_telefonicos", {
        id_operador_telefonico: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        nombre: {
            type: Sequelize.STRING
        },
        codigo: {
            type: Sequelize.STRING
        }
    }, {
        timestamps: false
    });
    //Operador.sync({ alter: true });
    return Operador;
};
