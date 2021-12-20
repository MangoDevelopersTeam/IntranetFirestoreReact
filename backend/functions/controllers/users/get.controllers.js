// Importaciones
const { Decrypt, Encrypt } = require("./../../helpers/cipher");
const admin = require("firebase-admin");


// Declaraciones
const controllers = {};


// Metodos
/**
 * Metodo para obtener la información del Usuario
 * @param {import("express").Request} req Objeto Request
 * @param {import("express").Response} res Objeto Response
 */
controllers.whoami = async (req, res) => {
    let auth = admin.auth();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { uid } = res.locals;

    await auth.getUser(uid)
    .then(result => {
        let object = {
            email: Encrypt(result.displayName),
            displayName: Encrypt(result.email),
        }

        code = "PROCESS_OK";
        data = Encrypt(object);
        type = "success";
        status = 200;
    })
    .catch(error => {
        code = error.code;
        message = error.message;
        type = "error";
        status = 404;
    })
    .finally(() => {
        res.status(status).send({ code: code, data: data, message: message, type: type });
        
        auth = null;
        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    });
};

/**
 * Metodo para obtener a todos los alumnos del sistema
 * @param {import("express").Request} req Objeto Request
 * @param {import("express").Response} res Objeto Response
 */
controllers.getSystemStudents = async (req, res) => {
    const { filter, filterData } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (filter == null)
    {
        code = "DATA_SENT_NULL";
        message = "Asegurate de enviar los datos de forma correcta y completa";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        db = null;
        auth = null;
        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    }

    if (typeof(filter) != "string")
    {
        code = "BAD_TYPE_PARAMS";
        message = "Los tipos de datos enviados deben ser validos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        db = null;
        auth = null;
        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    }

    if (filter == "true")
    {
        if (filterData == null)
        {
            code = "DATA_SENT_NULL";
            message = "Asegurate de enviar los datos de forma correcta y completa";
            type = "error";
            status = 400;

            res.status(status).send({ code: code, message: message, data: data, type: type });

            db = null;
            auth = null;
            code = null;
            data = null;
            message = null;
            type = null;
            status = null;
        }

        if (filterData.startsWith("U2FsdGVk") == false)
        {
            code = "DATA_SENT_INVALID";
            message = "Asegurate de enviar los datos de forma correcta y completa";
            type = "error";
            status = 400;

            res.status(status).send({ code: code, message: message, data: data, type: type });

            db = null;
            auth = null;
            code = null;
            data = null;
            message = null;
            type = null;
            status = null;
        }

        let dataFilter = Decrypt(filterData);

        if (dataFilter.number == null || dataFilter.grade == null || dataFilter.letter == null)
        {
            code = "DATA_SENT_NULL";
            message = "Asegurate de enviar los datos de forma correcta y completa";
            type = "error";
            status = 400;

            res.status(status).send({ code: code, message: message, data: data, type: type });

            db = null;
            auth = null;
            code = null;
            data = null;
            message = null;
            type = null;
            status = null;
        }

        if (dataFilter.number == "" || dataFilter.grade == "" || dataFilter.letter == "")
        {
            code = "DATA_SENT_INVALID";
            message = "Asegurate de enviar los datos de forma correcta y completa";
            type = "error";
            status = 400;

            res.status(status).send({ code: code, message: message, data: data, type: type });

            db = null;
            auth = null;
            code = null;
            data = null;
            message = null;
            type = null;
            status = null;
        }

        let letterParam = dataFilter.letter.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        let gradeParam = dataFilter.grade.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        let numberParam = dataFilter.number;

        await db.collection("users").where("deleted", "==", false).where("level", "==", "student").where("assignedToProxie", "==", false).where("number", "==", numberParam).where("letter", "==", letterParam).where("grade", "==", gradeParam).get()
        .then(result => {
            let array = [];

            if (result.size > 0)
            {
                result.forEach(doc => {
                    array.push({
                        id: doc.id,
                        data: doc.data()
                    })
                });

                code = "PROCESS_OK";
                type = "success";
                data = Encrypt(array);
                status = 200;
            }
            else
            {
                code = "STUDENTS_NOT_FOUND";
                message = "No existen usuarios en la plataforma con los datos de filtro proporcionados";
                type = "error";
                status = 404;
            }
        })
        .catch(error => {
            code = error.code;
            type = "error";
            status = 400;
        })
        .finally(() => {
            res.status(status).send({ code: code, message: message, data: data, type: type });

            db = null;
            auth = null;
            code = null;
            data = null;
            message = null;
            type = null;
            status = null;
        });
    }
    else
    {
        await db.collection("users").where("deleted", "==", false).where("level", "==", "student").where("assignedToProxie", "==", false).get()
        .then(result => {
            let array = [];

            if (result.size > 0)
            {
                result.forEach(doc => {
                    array.push({
                        id: doc.id,
                        data: doc.data()
                    })
                });

                code = "PROCESS_OK";
                type = "success";
                data = Encrypt(array);
                status = 200;
            }
            else
            {
                code = "STUDENTS_NOT_FOUND";
                message = "No existen usuarios en la plataforma";
                type = "error";
                status = 404;
            }
        })
        .catch(error => {
            code = error.code;
            type = "error";
            status = 400;
        })
        .finally(() => {
            res.status(status).send({ code: code, message: message, data: data, type: type });

            db = null;
            auth = null;
            code = null;
            data = null;
            message = null;
            type = null;
            status = null;
        });
    }
};

/**
 * Metodo para obtener los usuarios de la base de datos
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 * @returns retorna un json de usuarios
 */
controllers.getUsers = async (req, res) => {
    let { levelParam } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (levelParam == null)
    {
        code = "TYPE_PARAM_NULL";
        message = "El tipo de usuario no puede ser nulo"
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    }

    let level = Decrypt(levelParam);

    if (typeof(level) != "string")
    {
        code = "DATA_TYPE_LEVEL_INVALID";
        message = "El tipo de dato enviado no es correcto";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    }

    if (level == "student" || level == "teacher" || level == "proxie")
    {
        await db.collection("users").where("deleted", "==", false).where("level", "==", level).get()
        .then(result => {
            let array = [];

            if (result.size > 0)
            {
                result.forEach(doc => {
                    array.push({
                        id: doc.id,
                        data: doc.data()
                    });
                });
            }

            code = "PROCESS_OK";
            data = Encrypt(array);
            type = "success";
            status = 200;
        })
        .catch(error => {
            code = error.response.data.error.message;
            message = error.response.data.error.message;
            type = "error";
            status = 400;
        })
        .finally(() => {
            res.status(status).send({ code: code, message: message, data: data, type: type });
    
            uid = null;
            code = null;
            data = null;
            message = null;
            type = null;
            auth = null;
            status = null;
    
            return;
        });
    }
    else
    {
        code = "LEVEL_INVALID";
        message = "El tipo de usuario enviado no esta admitido"
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    }
};

/**
 * Metodo para obtener el numero de administradores creados
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 * @returns retorna una respuesta del numero de administradores o un mensaje de error
 */
controllers.getNumbersOfAdmin = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    await db.collection("users").where("level", "==", "admin").get()
    .then(result => {
        code = "PROCESS_OK";
        data = result.docs.length;
        type = "success";
        status = 200;
    })
    .catch(error => {
        code = error.response.data.error.message;
        type = "error";
        status = 400;
    })
    .finally(() => {
        res.status(status).send({ code: code, message: message, data: data, type: type });

        db = null;
        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    });
};

/**
 * Metodo para obtener los usuarios de la base de datos buscando por la region y comuna
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 * @returns retorna una respuesta de los usuarios encontrados
 */
controllers.getUsersByRegionCommune = async (req, res) => {
    let { communeParam, regionParam } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let region = Decrypt(regionParam);
    let commune = Decrypt(communeParam);

    await db.collection("users").where("deleted", "==", false).get()
    .then(result => {
        let filtered = result.docs.filter(x => Decrypt(x.data().region) === region && Decrypt(x.data().commune) === commune);

        let array = [];

        if (filtered.length > 0)
        {
            filtered.forEach(doc => {
                array.push({
                    id: doc.id,
                    data: doc.data()
                })
            });
        }

        code = "PROCESS_OK";
        data = array;
        type = "success";
        status = 200;
    })
    .catch(error => {
        code = "GET_USERS_ERROR";
        message = error.message;
        type = "error";
        status = 400;
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
};

/**
 * Metodo para obtener el nievel del usuario
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 */
controllers.getAccess = async (req, res) => {
    let auth = admin.auth();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { uid } = res.locals;

    await auth.getUser(uid)
    .then(result => {
        code = "PROCESS_OK";
        data = Encrypt(result.customClaims.level);
        type = "success";
        status = 200;
    })
    .catch(error => {
        code = error.code;
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
};

controllers.getUsersProfile = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { uid } = res.locals;

    if (uid == null)
    {
        code = "PARAMS_BAD_FORMATING";
        message = "El id esta mal formateado";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
                
        db = null;
        data = null;
        code = null;  
        message = null;
        type = null;
        status = null;

        return;
    }

    if (typeof(uid) != "string")
    {
        code = "BAD_TYPES_PARAM";
        message = "Asegurese de enviar los tipos de datos correctos"; 
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        db = null;
        data = null;
        code = null;  
        message = null;
        type = null;
        status = null;

        return;
    }

    if (uid == "")
    {
        code = "PARAMS_EMPTY";
        message = "Los valores enviados no pueden ser vacios";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
                
        db = null;
        data = null;
        code = null;  
        message = null;
        type = null;
        status = null;

        return;
    }

    await db.collection('users').doc(uid).get()
    .then(result => {
        
        if (result.exists == true)
        {
            if (result.data().deleted == false)
            {
                let array = [];
                
                array.push({
                    id: result.id,
                    data: result.data()
                });

                code = "PROCESS_OK";
                data = Encrypt(array);
                type = "success";
                status = 200;
            }
            else
            {
                code = "USER_NOT_FOUND";
                message = "El usuario solicitado no ha sido encontrado, verfique que el identificador este bien escrito, intentelo nuevamente";
                type = "error";
                status = 404;
            }
        }
        else
        {
            code = "USER_NOT_FOUND";
            message = "El usuario solicitado no ha sido encontrado, verfique que el identificador este bien escrito, intentelo nuevamente";
            type = "error";
            status = 404;
        }
    })
    .catch(error => {
        code = error.code;
        message = error.message;
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
};


module.exports = controllers;