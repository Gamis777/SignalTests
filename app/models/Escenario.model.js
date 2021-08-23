module.exports = (sequelize, Sequelize) => {
    const Escenario = sequelize.define("escenarios", {
        id_escenario: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        id_ejecucion: {
            type: Sequelize.INTEGER
        },
        id_canal_origen: {
            type: Sequelize.INTEGER
        },
        id_destino: {
            type: Sequelize.INTEGER
        },
        tipo: {
            type: Sequelize.ENUM('C', 'E')
        },
        numero_intento: {
            type: Sequelize.INTEGER
        },
        uniqueid_en: {
            type: Sequelize.STRING
        },
        uniqueid_sal: {
            type: Sequelize.STRING
        },
        estado: {
            type: Sequelize.STRING
        },
        hangupReason: {
            type: Sequelize.STRING
        },
        mos: {
            type: Sequelize.STRING
        },
        id_error: {
            type: Sequelize.INTEGER
        },
        hora_saliente: {
            type: Sequelize.TIME,
        },
        hora_entrante: {
            type: Sequelize.TIME,
        },
        createdAt: {
            type: Sequelize.DATE,
        },
        updatedAt: {
            type: Sequelize.DATE,
        }
    });
    //Escenario.sync({ alter: true });
    return Escenario;
};