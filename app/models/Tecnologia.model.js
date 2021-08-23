module.exports = (sequelize, Sequelize) => {
    const Tecnologia = sequelize.define("tecnologias", {
        id_tecnologia: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        nombre: {
            type: Sequelize.STRING
        }
    }, {
        timestamps: false
    });
    //Tecnologia.sync({ alter: true });
    return Tecnologia;
};
