// importaciones
const { Decrypt, Encrypt } = require("./../../helpers/cipher");
const admin = require("firebase-admin");

// declaraciones
const controllers = {};


controllers.editUser = async (req, res) => {
    let db = admin.firestore();
    let auth = admin.auth();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { uid } = res.locals;
    let { objectData, objectParams } = req.body;
    let { userIdParam } = req.query;

    if (objectData == null || objectParams == null || userIdParam == null || uid == null)
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

    if (objectData.startsWith("U2FsdGVkX1") == false || objectParams.startsWith("U2FsdGVkX1") == false || userIdParam.startsWith("U2FsdGVkX1") == false)
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

    let object = Decrypt(objectData);
    let params = Decrypt(objectParams);
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

    if (typeof(params.editEmail) != "boolean" || typeof(params.editPassword) != "boolean" || typeof(params.editRegionCommune) != "boolean")
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

    if (object.rut == null || object.name == null || object.surname == null)
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

    if (object.rut.startsWith("U2FsdGVkX1") == false || object.name.startsWith("U2FsdGVkX1") == false || object.surname.startsWith("U2FsdGVkX1") == false)
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

    if (typeof(Decrypt(object.rut)) != "string" || typeof(Decrypt(object.name)) != "string" || typeof(Decrypt(object.surname)) != "string")
    {
        code = "BAD_TYPE_BODY_VALUES";
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

    if (Decrypt(object.rut) == "" || Decrypt(object.name) == "" || Decrypt(object.surname) == "")
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

    Decrypt(object.rut).replace(',', '');
    Decrypt(object.rut).replace('.', '');

    if (params.editEmail == true)
    {
        if (object.email == null)
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

        if (object.email.startsWith("U2FsdGVkX1") == false)
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

        if (typeof(Decrypt(object.email)) != "string")
        {
            code = "BAD_TYPE_BODY_VALUES";
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

        if (Decrypt(object.email) == "")
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


        // Db query
        await auth.updateUser(userId, {
            email: Decrypt(object.email)
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
    }
    else
    {
        delete object.email;
    }

    if (params.editPassword == true)
    {
        if (object.password == null || object.passwordRepeat == null)
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

        if (object.password.startsWith("U2FsdGVkX1") == false || object.passwordRepeat.startsWith("U2FsdGVkX1") == false)
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

        if (typeof(Decrypt(object.password)) != "string" || typeof(Decrypt(object.passwordRepeat)) != "string")
        {
            code = "BAD_TYPE_BODY_VALUES";
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

        if (Decrypt(object.password) == "" || Decrypt(object.password) == "")
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

        if (Decrypt(object.password) != Decrypt(object.password))
        {
            code = "PASSWORDS_DOESNT_MATCH";
            message = "Las contraseñas no coinciden"; 
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


        // Db query
        await auth.updateUser(userId, {
            password: Decrypt(object.password)
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

        delete object.password;
        delete object.passwordRepeat;
    }
    else
    {
        delete object.password;
        delete object.passwordRepeat;
    }

    if (params.editRegionCommune == true)
    {
        if (object.region == null || object.commune == null)
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

        if (object.region.startsWith("U2FsdGVkX1") == false || object.commune.startsWith("U2FsdGVkX1") == false)
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

        if (typeof(Decrypt(object.region)) != "string" || typeof(Decrypt(object.commune)) != "string")
        {
            code = "BAD_TYPE_BODY_VALUES";
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

        if (Decrypt(object.region) == "" || Decrypt(object.commune) == "")
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
    }
    else
    {
        delete object.region;
        delete object.commune;
    }

    delete object.level;
    await auth.updateUser(userId, {
        displayName: `${Decrypt(object.name)} ${Decrypt(object.surname)}`
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

    await db.collection("users").doc(userId).update(object)
    .then(() => {
        code = "PROCESS_OK";
        message = "Usuario editado exitosamente";
        type = "success";
        status = 201;
    })
    .catch(error => { 
        code = error.code;
        message = "Ha ocurrido un error al editar el usuario"; 
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