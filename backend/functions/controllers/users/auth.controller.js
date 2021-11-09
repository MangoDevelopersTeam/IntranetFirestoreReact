const admin = require("firebase-admin");
const functions = require("firebase-functions");

const controllers = {};

/**
 * Función que obtendrá el nivel de acceso del usuario para verificar el nivel de acceso
 */
controllers.getAccess = functions.https.onRequest(async (req, res) => {
    let { uid } = res.locals;
    
    let auth = admin.auth();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    await auth.getUser(uid)
    .then(result => {
        code = "PROCESS_OK";
        data = result.customClaims.level;
        type = "success";
        status = 200;
    })
    .catch(() => {
        code = "GET_CUSTOM_CLAIMS_ERROR";
        message = "Hubo un error al obtener los datos del usuario";
        type = "error";
        status = 404;
    })
    .finally(() => {
        res.status(status).send({ code: code, message: message, data: data, type: type });

        auth = null;
        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    });
});


module.exports = controllers;