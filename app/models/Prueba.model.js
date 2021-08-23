module.exports = (sequelize, Sequelize) => {
    const Prueba = sequelize.define("pruebas", {
        id_prueba: {
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
        correo: {
            type: Sequelize.STRING
        },
        tiempo_timbrado: {
            type: Sequelize.INTEGER
        },
        reintentos: {
            type: Sequelize.INTEGER
        },
        tipo: {
            type: Sequelize.ENUM('I', 'E')
        },
        tipo_lanzamiento: {
            type: Sequelize.STRING
        },
        activo: {
            type: Sequelize.ENUM('S', 'N')
        },
        ejecutado: {
            type: Sequelize.ENUM('S', 'N')
        },
        programacion: {
            type: Sequelize.STRING
        },
        fecha_lanzamiento: {
            type: Sequelize.DATEONLY
        },
        hora_lanzamiento: {
            type: Sequelize.TIME
        },
        dias_lanzamiento: {
            type: Sequelize.STRING
        },
        id_matriz: {
            type: Sequelize.INTEGER
        },
        id_usuario: {
            type: Sequelize.INTEGER
        }
    }, {
        timestamps: false
    });
    //Prueba.sync({ alter: true });
    // TODO: CREAR ENTIDAD SERVICES Y REPOSITORY PARA PRUEBAS.
    /*Prueba.buscarProgramadas = async (fecha_actual) => {
        return [];
    }*/
    Prueba.buscarProgramadas = async (fecha_actual) => {
        //Nota
        //En el campo de programación existen 2 tipos que son Tareas(T) y Únicos(U)
        //Tareas : Son pruebas que se ejecutan en dias es especificos en cada semana
        //Unicos : Son pruebas que se ejecutan una sola vez en un dia en especifico
        //console.log("Buscando pruebas programadas")
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']
        const numero_dia = new Date(fecha_actual).getDay()
        const nombre_dia = dias[numero_dia]
        const SQL = `SELECT p.* FROM pruebas p 
            LEFT JOIN ejecuciones e 
                ON (e.id_prueba = p.id_prueba AND  DATE(e.fecha_inicio) = DATE(now()))
            WHERE
                e.id_ejecucion IS NULL AND 
                    (
                        (((tipo_lanzamiento = 'Programado' AND
                            programacion = 'U') OR (tipo_lanzamiento = 'Instantaneo' AND tipo = 'E'
                            AND ejecutado = 'N')) AND ejecutado = 'N' AND
                            TIMESTAMP(fecha_lanzamiento,hora_lanzamiento) >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) AND
                            TIMESTAMP(fecha_lanzamiento,hora_lanzamiento) <= now())
                        OR (tipo_lanzamiento = 'Programado' AND programacion = 'T' AND
                            hora_lanzamiento <= TIME(now()) AND
                            FIND_IN_SET('${nombre_dia}',REPLACE(dias_lanzamiento, '-', ',')
                        AND
                        activo = 'S'))
                )`
        //console.log(SQL)
        let data = await sequelize.query(SQL, {
            type: sequelize.QueryTypes.SELECT
        })
        return data;
    }
    return Prueba;
};
