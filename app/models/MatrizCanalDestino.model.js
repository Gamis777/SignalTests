module.exports = (sequelize, Sequelize) => {
    const MatrizCanalDestino = sequelize.define("matrices_canales_destinos", {
        id_matriz_canal_destino: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        id_matriz: {
            type: Sequelize.INTEGER
        },
        id_canal_origen: {
            type: Sequelize.INTEGER
        },
        id_canal_destino: {
            type: Sequelize.INTEGER
        },
        id_numero_externo_destino: {
            type: Sequelize.INTEGER
        },
        tipo: {
            type: Sequelize.ENUM('E', 'C')
        },
        estado: {
            allowNull: false,
            type: Sequelize.ENUM('ACTIVO','INACTIVO'),
            default: 'ACTIVO'
        }
    }, {
        timestamps: false
    });
    //MatrizCanalDestino.sync({ alter: true });
    return MatrizCanalDestino;
};
