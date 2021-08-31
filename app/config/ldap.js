module.exports = {
    HOST: process.env.LDAP_HOST || "191.98.176.205",
    bindDN: process.env.LDAP_BIND_DN || "",
    baseDN: process.env.LDAP_BASE_DN || "",
    baseUser: process.env.LDAP_BASE_USER || "",
    TIMEOUT: process.env.LDAP_TIMEOUT || 5000,
    CONNECTTIMEOUT: process.env.LDAP_TIMEOUT || 1000,
    // PORT: process.env.LDAP_TIMEOUT ||  389
};