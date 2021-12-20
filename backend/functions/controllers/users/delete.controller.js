// importaciones
const { Decrypt, Encrypt } = require("./../../helpers/cipher");
const admin = require("firebase-admin");

// declaraciones
const controllers = {};

controllers.deleteUser = async (req, res) => {
    let db = admin.firestore();
    let auth = admin.auth();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { uid } = res.locals;
    let { userIdParam } = req.query;

    if (userIdParam == null || uid == null)
    {
        code = "DATA_SENT_NULL";
        message = "Asegurese de enviar los datos no nulos"; 
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        uid = null;
        db = null;
        code = null;
        message = null;
        type = null;
        status = null;

        return;
    }

    if (userIdParam.startsWith("U2FsdGVkX1") == false)
    {
        code = "DATA_SENT_INVALID";
        message = "Asegurese de enviar los datos con el formato correcto"; 
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        uid = null;
        db = null;
        code = null;
        message = null;
        type = null;
        status = null;

        return;
    }

    let userId = Decrypt(userIdParam);

    if (typeof(userId) != "string")
    {
        code = "BAD_TYPE_PARAMS_VALUES";
        message = "Asegurese de enviar los tipos de datos correctos"; 
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        uid = null;
        db = null;
        code = null;
        message = null;
        type = null;
        status = null;

        return;
    }

    if (userId == "")
    {
        code = "BODY_SENT_NULL";
        message = "Asegurese de enviar los tipos de datos correctos"; 
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        uid = null;
        db = null;
        code = null;
        message = null;
        type = null;
        status = null;

        return;
    }

    await auth.updateUser(userId, {
        disabled: true
    })
    .catch(error => {
        code = error.code;
        message = "Ha ocurrido un error al editar el comentario"; 
        type = "error";
        status = 500;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    });

    await db.collection("users").doc(userId).update({
        deleted: true
    })
    .then(() => {
        code = "PROCESS_OK";
        message = "Usuario eliminado exitosamente";
        type = "success";
        status = 201;
    })
    .catch(error => { 
        code = error.code;
        message = "Ha ocurrido un error al eliminar el usuario"; 
        type = "error";
        status = 500;
    })
    .finally(() => {
        res.status(status).send({ code: code, message: message, data: data, type: type });

        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    });
}

module.exports = controllers;