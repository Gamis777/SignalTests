module.exports = (sequelize, Sequelize) => {
    const Canal = sequelize.define("canales", {
        id_canal: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        id_tecnologia_operador: {
            type: Sequelize.INTEGER
        },
        id_equipo: {
            type: Sequelize.INTEGER
        },
        estado: {
            type: Sequelize.ENUM('A', 'D')
        },
        nro_ranura: {
            type: Sequelize.INTEGER
        },
        numero: {
            type: Sequelize.STRING
        },
        posicion: {
            type: Sequelize.INTEGER
        },
        estado_llamada: {
            type: Sequelize.ENUM('LIBRE', 'SALIENTE', 'ENTRANTE')
        },
        createdAt: {
          type: Sequelize.DATE,
        },
        updatedAt: {
          type: Sequelize.DATE,
        }
    });
    //Canal.sync({ alter: true });
    return Canal;
};
