var ldap = require('ldapjs');
const lConfig = require("../config/ldap.js");
const host = lConfig.HOST


//class AuthLdapController{

const authDN = (client, username, password) => {
    return new Promise((resolve, reject) => {
        let bind_dn = `${username}`;
        if (lConfig.baseUser!=""){
            bind_dn = `${lConfig.bindDN}=${username}`
        }
        if(lConfig.bindDN!=""){
            bind_dn = `${bind_dn},${lConfig.bindDN}`
        }
        console.log(bind_dn);
        client.bind(bind_dn, password, function(error, res) {
            if (error) {
                console.log(error.message);
                client.unbind(function(error) {
                    if (error) {
                        console.log(error.message);
                        //response['message'] = 'Datos incorrectos';
                    } else {
                        console.log('client disconnected');
                        //response['message'] = 'client disconnected';
                    }
                });
                resolve({
                    status: false
                });
            } else {
                console.log('connected ldap');
                resolve({
                    status: true
                });
            }
            client.unbind();
        });
    });
}

const getClient = () => {
    return new Promise((resolve, reject) => {
        const url = `ldap://${host}/${lConfig.baseDN}`;
        var opts = {
            url,
            timeout: lConfig.TIMEOUT,
            connectTimeout: lConfig.CONNECTTIMEOUT
        };
        console.log(opts);
        const client = ldap.createClient(opts);
        client.once('error', () => {
            console.log('client: error');
            reject({
                status: false
            });
        });
        client.on('connect', () => {
            console.log('client: connect');
            resolve(client);
        });
    });
}

exports.Auth = async (req, res) => {
    try {
        var username = req.body.correo;
        var password = req.body.clave;
        const client = await getClient();
        console.log('--- going to try to connect user ---');
        let response = {};
        response['status'] = false;
        response['codigo'] = 404;
        response['result'] = [];
        let promise = await authDN(client, username, password);
        if (promise.status) {
            response['codigo'] = 200;
            response['status'] = promise.status;
        }
        return response;
    } catch (error) {
        console.log(error);
        return {
            status: false
        }
    }
};
