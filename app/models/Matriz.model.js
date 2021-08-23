module.exports = (sequelize, Sequelize) => {
    const QueryTypes = Sequelize.QueryTypes;
    const Matriz = sequelize.define(
        "matrices", {
            id_matriz: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                unique: true,
                primaryKey: true,
            },
            nombre: {
                type: Sequelize.STRING,
            },
            estado: {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                default: true
            },
        }, {
            timestamps: false,
        }
    );
    //Matriz.sync({ alter: true });
    Matriz.insertarDataMatriz = async (id_matriz, data, t) => {
        if (data.length == 0) {
            return false;
        }
        let datos_insertar = [];
        let SQL = `INSERT INTO matrices_canales_destinos
            (id_matriz,id_canal_origen,id_canal_destino, id_numero_externo_destino,tipo) VALUES`;
        data.forEach((valor, _i) => {
            let id_canal_destino = 'NULL';
            let id_numero_externo_destino = 'NULL';
            if (valor.tipo === 'C'){
                id_canal_destino = valor.id_destino;
            } else {
                id_numero_externo_destino = valor.id_destino;
            }
            datos_insertar.push(
                `(${id_matriz},${valor.id_canal_origen},${id_canal_destino}, ${id_numero_externo_destino}, '${valor.tipo}')`
            );
        });
        SQL += datos_insertar.join();
        return await sequelize.query(SQL, {
            type: QueryTypes.INSERT,
            transaction: t,
        });
    };
    Matriz.obtenerDetalleMatriz = async (id_matriz) => {
        const SQL_destino_canales = `
            SELECT mcd.*, ot.nombre as nombre_operador, tec.nombre as nombre_tecnologia
            FROM matrices_canales_destinos mcd
            LEFT JOIN canales as can ON mcd.id_canal_destino = can.id_canal
            LEFT JOIN tecnologias_operadores as tos ON can.id_tecnologia_operador=tos.id_tecnologia_operador
            LEFT JOIN tecnologias as tec ON tec.id_tecnologia=tos.id_tecnologia
            LEFT JOIN operadores_telefonicos as ot ON ot.id_operador_telefonico = tos.id_operador_telefonico
            WHERE  mcd.tipo = 'C' AND id_matriz = ${id_matriz} AND mcd.estado = 'ACTIVO'`;
        let SQL_destino_externos = `
            SELECT mcd.id_matriz_canal_destino, mcd.id_matriz, mcd.id_canal_origen, mcd.id_numero_externo_destino, ne.nombre, ne.numero, mcd.tipo
            FROM matrices_canales_destinos mcd
            INNER JOIN numeros_externos ne ON ne.id_numero_externo = mcd.id_numero_externo_destino
            WHERE mcd.tipo = 'E' AND id_matriz = ${id_matriz} AND mcd.estado = 'ACTIVO'`;
        const datos1 = await sequelize.query(SQL_destino_canales, {
            type: QueryTypes.SELECT,
        })
        const datos2 = await sequelize.query(SQL_destino_externos, {
            type: QueryTypes.SELECT
        })
        console.log(datos1);
        console.log(datos2);
        let data = datos1.concat(datos2)
        return data;
    };
    Matriz.eliminarDataMatrizCanales = async (id_matriz, t) => {
        const SQL = `UPDATE matrices_canales_destinos 
            SET estado = 'INACTIVO'
            where id_matriz = ${id_matriz}`;
        return await sequelize.query(SQL, {
            type: QueryTypes.UPDATE,
            transaction: t,
        });
    };
    return Matriz;
};
