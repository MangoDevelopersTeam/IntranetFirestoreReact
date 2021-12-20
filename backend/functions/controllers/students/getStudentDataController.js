const admin = require("firebase-admin");

const { Decrypt, Encrypt } = require("../../helpers/cipher");

const controllers = {};


controllers.getStudentAnnotations = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let type = "";
    let status = 0;
    let data = null;
    let message = "";

    let userId = "";
    let arraySubjects = [];
    let arrayAnnotations = [];

    let { uid } = res.locals;
    let { userIdParam } = req.query;

    if (userIdParam != null)
    {
        if (userIdParam.startsWith("U2FsdGVkX") == false)
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

        userId = Decrypt(userIdParam);

        if (typeof(userId) != "string")
        {
            code = "BAD_TYPES_PARAM";
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
            code = "PARAMS_EMPTY";
            message = "Los valores enviados no pueden ser vacios";
            type = "error";
            status = 400;

            res.status(status).send({ code: code, message: message, data: data, type: type });
                
            message = null;
            status = null;
            code = null;  
            data = null;
            type = null;
            db = null;

            return;
        }
    }
    else
    {
        userId = uid;
    }

    await db.collection("courses").where("deleted", "==", false).get()
    .then(async resultSubject => {
        resultSubject.docs.forEach(doc => {
            arraySubjects.push({
                id: doc.id,
                data: doc.data()
            });
        });

        await db.collection("users").doc(userId).collection("annotations").get()
        .then(resultAnnotation => {
            if (resultAnnotation.size > 0)
            {
                resultAnnotation.docs.forEach(doc => {
                    let filter = arraySubjects.filter(x => x.id === doc.data().idSubject);

                    if (filter.length > 0)
                    {
                        arrayAnnotations.push({
                            id: doc.id,
                            data: {
                                type: doc.data().type,
                                description: doc.data().description,
                                created_at: doc.data().created_at,
                                created_by: doc.data().created_by,
                                code: filter[0].data.code,
                                subjectName: filter[0].data.courseName
                            }
                        });
                    }
                });

                code = "PROCESS_OK";
                data = Encrypt(arrayAnnotations);
                type = "success";
                status = 200;
            }
            else
            {
                code = "NO_ANNOTATIONS_EXIST";
                type = "error";
                status = 404;
            }
        })
        .catch(error => {
            code = error.code;
            type = "error";
            status = 500;
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
    })
    .catch(error => {
        code = error.code;
        type = "error";
        status = 500;

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


controllers.getUserInfo = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { idUserParam } = req.query;

    if (idUserParam == null)
    {
        code = "ID_PARAM_NULL";
        message = "El id no puede ser nulo, intentelo nuevamente";
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

    if (idUserParam.startsWith("U2FsdGVkX") == false)
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

    let userId = Decrypt(idUserParam);

    if (typeof(userId) != "string")
    {
        code = "BAD_TYPES_PARAM";
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
        code = "PARAMS_EMPTY";
        message = "Los valores enviados no pueden ser vacios";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        message = null;
        status = null;
        code = null;
        data = null;
        type = null;
        db = null;

        return;
    }

    await db.collection("users").doc(userId).get()
    .then(result => {
        if (result.exists == true)
        {
            let array = [];

            array.push({
                id: result.id,
                data: {
                    name: result.data().name,
                    surname: result.data().surname,
                    level: result.data().level
                }
            });

            code = "PROCESS_OK";
            data = Encrypt(array);
            type = "success";
            status = 200;
        }
        else
        {
            code = "USER_NOT_FOUND";
            message = "No se encontró a un usuario con el identificador provisto";
            type = "error";
            status = 404;
        }
    })
    .catch(error => {
        code = error.code;
        type = "error";
        status = 500;
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


controllers.getStudentGrades = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let userId = "";

    let { uid } = res.locals;
    let { idSubjectParam, userIdParam } = req.query;

    if (userIdParam != null)
    {
        if (userIdParam.startsWith("U2FsdGVkX") == false)
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

        userId = Decrypt(userIdParam);

        if (typeof(userId) != "string")
        {
            code = "BAD_TYPES_PARAM";
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
            code = "PARAMS_EMPTY";
            message = "Los valores enviados no pueden ser vacios";
            type = "error";
            status = 400;

            res.status(status).send({ code: code, message: message, data: data, type: type });
                
            message = null;
            status = null;
            code = null;  
            data = null;
            type = null;
            db = null;

            return;
        }
    }
    else
    {
        userId = uid;
    }

    if (idSubjectParam == null)
    {
        code = "PARAMS_NULL";
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

    if (idSubjectParam.startsWith("U2FsdGVkX") == false)
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

    let idSubject = Decrypt(idSubjectParam);

    if (typeof(idSubject) != "string")
    {
        code = "BAD_TYPES_PARAM";
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

    await db.collection("courses").doc(idSubject).collection("students").doc(userId).collection("grades").get()
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
        code = error.code;
        type = "error";
        status = 500;
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

module.exports = controllers;