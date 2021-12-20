// Importaciones
const { Decrypt, Encrypt } = require("./../../helpers/cipher");
const admin = require("firebase-admin");

// Declaraciones
const controllers = {};

// Metodos
/**
 * Función para crear una pregunta en el foro de ayuda
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 * @returns retorna un mensaje erroneo o un mensaje informativo al usuario
 */
controllers.postQuestionForum = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { uid } = res.locals;
    let { objectData } = req.body;

    if (objectData == null)
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

    if (objectData.startsWith("U2FsdGVkX1") == false)
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

    if (object.question == null || object.description == null || object.theme == null)
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

    if (typeof(object.question) != "string" || typeof(object.description) != "string" || typeof(object.theme) != "string")
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

    if (object.question == "" || object.description == "" || object.theme == "")
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

    let questionRef = db.collection("questions").doc();

    let objectPostData = {
        question: object.question,
        description: object.description, 
        theme: object.theme.normalize('NFD').replace(/[\u0300-\u036f]/g, ""),
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        created_by: uid,
        idQuestion: questionRef.id,
        deleted: false
    }

    await questionRef.set(objectPostData)
    .then(() => {
        code = "PROCESS_OK";
        message = "Pregunta creada exitosamente";
        type = "success";
        status = 201;
    })
    .catch(error => { 
        code = error.code;
        message = "Ha ocurrido un error al crear la pregunta en el foro"; 
        type = "error";
        status = 500;
    })
    .finally(() => {
        res.status(status).send({ code: code, message: message, data: data, type: type });

        uid = null;
        db = null;
        code = null;
        message = null;
        type = null;
        status = null;

        return;
    });
};

controllers.postLikeQuestion = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let arrayRate = [];

    let { uid } = res.locals;
    let { questionIdParam } = req.body;

    if (questionIdParam == null || uid == null)
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

    if (questionIdParam.startsWith("U2FsdGVkX1") == false)
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

    let questionId = Decrypt(questionIdParam);

    if (typeof(questionId) != "string" || typeof(uid) != "string")
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

    if (questionId == "" || uid == "")
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

    await db.collection("questions").doc(questionId).collection("rate").get()
    .then(result => {
        if (result.size > 0)
        {
            result.docs.forEach(doc => {
                arrayRate.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
        }
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

    if (arrayRate.length > 0)
    {
        let filter = arrayRate.filter(x => x.id === uid);

        if (filter.length > 0)
        {
            if (filter[0].data.liked == true)
            {
                await db.collection("questions").doc(questionId).collection("rate").doc(uid).update({
                    liked: false
                })
                .then(() => {
                    code = "PROCESS_OK";
                    message = "Esta pregunta ya no te gusta";
                    type = "info";
                    status = 201;
                })
                .catch(error => {
                    code = error.code;
                    message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
                    type = "error";
                    status = 500;
                })
                .finally(() => {
                    res.status(status).send({ code: code, message: message, data: data, type: type });
        
                    db = null;
                    code = null;
                    message = null;
                    type = null;
                    status = null;
        
                    return;
                });
            }
            else
            {
                if (filter[0].data.disliked == true)
                {
                    await db.collection("questions").doc(questionId).collection("rate").doc(uid).update({
                        disliked: false
                    })
                    .catch(error => {
                        code = error.code;
                        message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
                        type = "error";
                        status = 500;

                        res.status(status).send({ code: code, message: message, data: data, type: type });
            
                        db = null;
                        code = null;
                        message = null;
                        type = null;
                        status = null;
            
                        return;
                    });
                }

                await db.collection("questions").doc(questionId).collection("rate").doc(uid).update({
                    liked: true
                })
                .then(() => {
                    code = "PROCESS_OK";
                    message = "Esta pregunta te gusta";
                    type = "success";
                    status = 201;
                })
                .catch(error => {
                    code = error.code;
                    message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
                    type = "error";
                    status = 500;
                })
                .finally(() => {
                    res.status(status).send({ code: code, message: message, data: data, type: type });
        
                    db = null;
                    code = null;
                    message = null;
                    type = null;
                    status = null;
        
                    return;
                });
            }
        }
        else
        {
            await db.collection("questions").doc(questionId).collection("rate").doc(uid).set({
                idQuestion: questionId,
                idUser: uid,
                liked: true,
                disliked: false
            })
            .then(() => {
                code = "PROCESS_OK";
                message = "Esta pregunta te gusta";
                type = "success";
                status = 201;
            })
            .catch(error => {
                code = error.code;
                message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
                type = "error";
                status = 500;
            })
            .finally(() => {
                res.status(status).send({ code: code, message: message, data: data, type: type });
    
                db = null;
                code = null;
                message = null;
                type = null;
                status = null;
    
                return;
            });
        }
    }
    else
    {
        await db.collection("questions").doc(questionId).collection("rate").doc(uid).set({
            idQuestion: questionId,
            idUser: uid,
            liked: true,
            disliked: false
        })
        .then(() => {
            code = "PROCESS_OK";
            message = "Esta pregunta te gusta";
            type = "success";
            status = 201;
        })
        .catch(error => {
            code = error.code;
            message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
            type = "error";
            status = 500;
        })
        .finally(() => {
            res.status(status).send({ code: code, message: message, data: data, type: type });

            db = null;
            code = null;
            message = null;
            type = null;
            status = null;

            return;
        });
    }
};

controllers.postDislikeQuestion = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let arrayRate = [];

    let { uid } = res.locals;
    let { questionIdParam } = req.body;

    if (questionIdParam == null || uid == null)
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

    if (questionIdParam.startsWith("U2FsdGVkX1") == false)
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

    let questionId = Decrypt(questionIdParam);

    if (typeof(questionId) != "string" || typeof(uid) != "string")
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

    if (questionId == "" || uid == "")
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

    await db.collection("questions").doc(questionId).collection("rate").get()
    .then(result => {
        if (result.size > 0)
        {
            result.docs.forEach(doc => {
                arrayRate.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
        }
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

    if (arrayRate.length > 0)
    {
        let filter = arrayRate.filter(x => x.id === uid);

        if (filter.length > 0)
        {
            if (filter[0].data.disliked == true)
            {
                await db.collection("questions").doc(questionId).collection("rate").doc(uid).update({
                    disliked: false
                })
                .then(() => {
                    code = "PROCESS_OK";
                    message = "Se quitó el no me gusta";
                    type = "info";
                    status = 201;
                })
                .catch(error => {
                    code = error.code;
                    message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
                    type = "error";
                    status = 500;
                })
                .finally(() => {
                    res.status(status).send({ code: code, message: message, data: data, type: type });
        
                    db = null;
                    code = null;
                    message = null;
                    type = null;
                    status = null;
        
                    return;
                });
            }
            else
            {
                if (filter[0].data.liked == true)
                {
                    await db.collection("questions").doc(questionId).collection("rate").doc(uid).update({
                        liked: false
                    })
                    .catch(error => {
                        code = error.code;
                        message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
                        type = "error";
                        status = 500;

                        res.status(status).send({ code: code, message: message, data: data, type: type });
            
                        db = null;
                        code = null;
                        message = null;
                        type = null;
                        status = null;
            
                        return;
                    });
                }

                await db.collection("questions").doc(questionId).collection("rate").doc(uid).update({
                    disliked: true
                })
                .then(() => {
                    code = "PROCESS_OK";
                    message = "Esta pregunta no me gusta";
                    type = "info";
                    status = 201;
                })
                .catch(error => {
                    code = error.code;
                    message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
                    type = "error";
                    status = 500;
                })
                .finally(() => {
                    res.status(status).send({ code: code, message: message, data: data, type: type });
        
                    db = null;
                    code = null;
                    message = null;
                    type = null;
                    status = null;
        
                    return;
                });
            }
        }
        else
        {
            await db.collection("questions").doc(questionId).collection("rate").doc(uid).set({
                idQuestion: questionId,
                idUser: uid,
                liked: false,
                disliked: true
            })
            .then(() => {
                code = "PROCESS_OK";
                message = "Esta pregunta no te gusta";
                type = "info";
                status = 201;
            })
            .catch(error => {
                code = error.code;
                message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
                type = "error";
                status = 500;
            })
            .finally(() => {
                res.status(status).send({ code: code, message: message, data: data, type: type });
    
                db = null;
                code = null;
                message = null;
                type = null;
                status = null;
    
                return;
            });
        }
    }
    else
    {
        await db.collection("questions").doc(questionId).collection("rate").doc(uid).set({
            idQuestion: questionId,
            idUser: uid,
            liked: false,
            disliked: true
        })
        .then(() => {
            code = "PROCESS_OK";
            message = "Esta pregunta no te gusta";
            type = "info";
            status = 201;
        })
        .catch(error => {
            code = error.code;
            message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
            type = "error";
            status = 500;
        })
        .finally(() => {
            res.status(status).send({ code: code, message: message, data: data, type: type });

            db = null;
            code = null;
            message = null;
            type = null;
            status = null;

            return;
        });
    }
};

controllers.postQuestionComment = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { uid } = res.locals;
    let { objectData } = req.body;
    let { questionIdParam } = req.query;

    if (objectData == null || questionIdParam == null || uid == null)
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

    if (objectData.startsWith("U2FsdGVkX1") == false || questionIdParam.startsWith("U2FsdGVkX1") == false)
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
    let questionId = Decrypt(questionIdParam);

    if (object.comment == null)
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

    if (typeof(object.comment) != "string" || typeof(questionId) != "string" || typeof(uid) != "string")
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

    if (object.comment == "" || object.comment == " " || questionId == "" || uid == "")
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

    let commentRef = db.collection("questions").doc(questionId).collection("comments").doc();

    let objectPostData = {
        comment: object.comment,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        created_by: uid,
        idComment: commentRef.id,
        idQuestion: questionId,
        deleted: false
    }

    await commentRef.set(objectPostData)
    .then(() => {
        code = "PROCESS_OK";
        message = "Comentario creado exitosamente";
        type = "success";
        status = 201;
    })
    .catch(error => { 
        code = error.code;
        message = "Ha ocurrido un error al crear el comentario"; 
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



controllers.postQuestionAnswer = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { uid } = res.locals;
    let { objectData } = req.body;
    let { questionIdParam } = req.query;

    if (objectData == null || questionIdParam == null || uid == null)
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

    if (objectData.startsWith("U2FsdGVkX1") == false || questionIdParam.startsWith("U2FsdGVkX1") == false)
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
    let questionId = Decrypt(questionIdParam);

    if (object.answer == null)
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

    if (typeof(object.answer) != "string" || typeof(questionId) != "string" || typeof(uid) != "string")
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

    if (object.answer == "" || object.answer == " " || questionId == "" || uid == "")
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

    let answerRef = db.collection("questions").doc(questionId).collection("answers").doc();

    let objectPostData = {
        answer: object.answer,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        created_by: uid,
        idAnswer: answerRef.id,
        idQuestion: questionId,
        deleted: false
    }

    await answerRef.set(objectPostData)
    .then(() => {
        code = "PROCESS_OK";
        message = "Respuesta creada exitosamente";
        type = "success";
        status = 201;
    })
    .catch(error => { 
        code = error.code;
        message = "Ha ocurrido un error al crear la respuesta"; 
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

controllers.postLikeAnswer = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let arrayRate = [];

    let { uid } = res.locals;
    let { questionIdParam, answerIdParam } = req.body;

    if (questionIdParam == null || answerIdParam == null || uid == null)
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

    if (questionIdParam.startsWith("U2FsdGVkX1") == false || answerIdParam.startsWith("U2FsdGVkX1") == false)
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

    let questionId = Decrypt(questionIdParam);
    let answerId = Decrypt(answerIdParam);

    if (typeof(questionId) != "string" || typeof(answerId) != "string" || typeof(uid) != "string")
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

    if (questionId == "" || answerId == "" || uid == "")
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

    await db.collection("questions").doc(questionId).collection("answers").doc(answerId).collection("rate").get()
    .then(result => {
        if (result.size > 0)
        {
            result.docs.forEach(doc => {
                arrayRate.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
        }
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

    if (arrayRate.length > 0)
    {
        let filter = arrayRate.filter(x => x.id === uid);

        if (filter.length > 0)
        {
            if (filter[0].data.liked == true)
            {
                await db.collection("questions").doc(questionId).collection("answers").doc(answerId).collection("rate").doc(uid).update({
                    liked: false
                })
                .then(() => {
                    code = "PROCESS_OK";
                    message = "Esta respuesta ya no te gusta";
                    type = "info";
                    status = 201;
                })
                .catch(error => {
                    code = error.code;
                    message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
                    type = "error";
                    status = 500;
                })
                .finally(() => {
                    res.status(status).send({ code: code, message: message, data: data, type: type });
        
                    db = null;
                    code = null;
                    message = null;
                    type = null;
                    status = null;
        
                    return;
                });
            }
            else
            {
                if (filter[0].data.disliked == true)
                {
                    await db.collection("questions").doc(questionId).collection("answers").doc(answerId).collection("rate").doc(uid).update({
                        disliked: false
                    })
                    .catch(error => {
                        code = error.code;
                        message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
                        type = "error";
                        status = 500;

                        res.status(status).send({ code: code, message: message, data: data, type: type });
            
                        db = null;
                        code = null;
                        message = null;
                        type = null;
                        status = null;
            
                        return;
                    });
                }

                await db.collection("questions").doc(questionId).collection("answers").doc(answerId).collection("rate").doc(uid).update({
                    liked: true
                })
                .then(() => {
                    code = "PROCESS_OK";
                    message = "Esta respuesta te gusta";
                    type = "success";
                    status = 201;
                })
                .catch(error => {
                    code = error.code;
                    message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
                    type = "error";
                    status = 500;
                })
                .finally(() => {
                    res.status(status).send({ code: code, message: message, data: data, type: type });
        
                    db = null;
                    code = null;
                    message = null;
                    type = null;
                    status = null;
        
                    return;
                });
            }
        }
        else
        {
            await db.collection("questions").doc(questionId).collection("answers").doc(answerId).collection("rate").doc(uid).set({
                idQuestion: questionId,
                idAnswer: answerId,
                idUser: uid,
                liked: true,
                disliked: false
            })
            .then(() => {
                code = "PROCESS_OK";
                message = "Esta respuesta te gusta";
                type = "success";
                status = 201;
            })
            .catch(error => {
                code = error.code;
                message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
                type = "error";
                status = 500;
            })
            .finally(() => {
                res.status(status).send({ code: code, message: message, data: data, type: type });
    
                db = null;
                code = null;
                message = null;
                type = null;
                status = null;
    
                return;
            });
        }
    }
    else
    {
        await db.collection("questions").doc(questionId).collection("answers").doc(answerId).collection("rate").doc(uid).set({
            idQuestion: questionId,
            idAnswer: answerId,
            idUser: uid,
            liked: true,
            disliked: false
        })
        .then(() => {
            code = "PROCESS_OK";
            message = "Esta respuesta te gusta";
            type = "success";
            status = 201;
        })
        .catch(error => {
            code = error.code;
            message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
            type = "error";
            status = 500;
        })
        .finally(() => {
            res.status(status).send({ code: code, message: message, data: data, type: type });

            db = null;
            code = null;
            message = null;
            type = null;
            status = null;

            return;
        });
    }
};

controllers.postDislikeAnswer = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let arrayRate = [];

    let { uid } = res.locals;
    let { questionIdParam, answerIdParam } = req.body;

    if (questionIdParam == null || answerIdParam == null || uid == null)
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

    if (questionIdParam.startsWith("U2FsdGVkX1") == false || answerIdParam.startsWith("U2FsdGVkX1") == false)
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

    let questionId = Decrypt(questionIdParam);
    let answerId = Decrypt(answerIdParam);

    if (typeof(questionId) != "string" || typeof(answerId) != "string" || typeof(uid) != "string")
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

    if (questionId == "" || answerId == "" || uid == "")
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

    await db.collection("questions").doc(questionId).collection("answers").doc(answerId).collection("rate").get()
    .then(result => {
        if (result.size > 0)
        {
            result.docs.forEach(doc => {
                arrayRate.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
        }
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

    if (arrayRate.length > 0)
    {
        let filter = arrayRate.filter(x => x.id === uid);

        if (filter.length > 0)
        {
            if (filter[0].data.disliked == true)
            {
                await db.collection("questions").doc(questionId).collection("answers").doc(answerId).collection("rate").doc(uid).update({
                    disliked: false
                })
                .then(() => {
                    code = "PROCESS_OK";
                    message = "Se quitó el no me gusta";
                    type = "info";
                    status = 201;
                })
                .catch(error => {
                    code = error.code;
                    message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
                    type = "error";
                    status = 500;
                })
                .finally(() => {
                    res.status(status).send({ code: code, message: message, data: data, type: type });
        
                    db = null;
                    code = null;
                    message = null;
                    type = null;
                    status = null;
        
                    return;
                });
            }
            else
            {
                if (filter[0].data.liked == true)
                {
                    await db.collection("questions").doc(questionId).collection("answers").doc(answerId).collection("rate").doc(uid).update({
                        liked: false
                    })
                    .catch(error => {
                        code = error.code;
                        message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
                        type = "error";
                        status = 500;

                        res.status(status).send({ code: code, message: message, data: data, type: type });
            
                        db = null;
                        code = null;
                        message = null;
                        type = null;
                        status = null;
            
                        return;
                    });
                }

                await db.collection("questions").doc(questionId).collection("answers").doc(answerId).collection("rate").doc(uid).update({
                    disliked: true
                })
                .then(() => {
                    code = "PROCESS_OK";
                    message = "Esta respuesta no me gusta";
                    type = "info";
                    status = 201;
                })
                .catch(error => {
                    code = error.code;
                    message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
                    type = "error";
                    status = 500;
                })
                .finally(() => {
                    res.status(status).send({ code: code, message: message, data: data, type: type });
        
                    db = null;
                    code = null;
                    message = null;
                    type = null;
                    status = null;
        
                    return;
                });
            }
        }
        else
        {
            await db.collection("questions").doc(questionId).collection("answers").doc(answerId).collection("rate").doc(uid).set({
                idQuestion: questionId,
                idAnswer: answerId,
                idUser: uid,
                liked: false,
                disliked: true
            })
            .then(() => {
                code = "PROCESS_OK";
                message = "Esta respuesta no te gusta";
                type = "info";
                status = 201;
            })
            .catch(error => {
                code = error.code;
                message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
                type = "error";
                status = 500;
            })
            .finally(() => {
                res.status(status).send({ code: code, message: message, data: data, type: type });
    
                db = null;
                code = null;
                message = null;
                type = null;
                status = null;
    
                return;
            });
        }
    }
    else
    {
        await db.collection("questions").doc(questionId).collection("answers").doc(answerId).collection("rate").doc(uid).set({
            idQuestion: questionId,
            idAnswer: answerId,
            idUser: uid,
            liked: false,
            disliked: true
        })
        .then(() => {
            code = "PROCESS_OK";
            message = "Esta respuesta no te gusta";
            type = "info";
            status = 201;
        })
        .catch(error => {
            code = error.code;
            message = "Ha ocurrido un error al realizar la petición, intentalo nuevamente";
            type = "error";
            status = 500;
        })
        .finally(() => {
            res.status(status).send({ code: code, message: message, data: data, type: type });

            db = null;
            code = null;
            message = null;
            type = null;
            status = null;

            return;
        });
    }
};

controllers.postAnswerComment = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { uid } = res.locals;
    let { objectData } = req.body;
    let { questionIdParam, answerIdParam } = req.query;

    if (objectData == null || questionIdParam == null || answerIdParam == null || uid == null)
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

    if (objectData.startsWith("U2FsdGVkX1") == false || questionIdParam.startsWith("U2FsdGVkX1") == false || answerIdParam.startsWith("U2FsdGVkX1") == false)
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
    let questionId = Decrypt(questionIdParam);
    let answerId = Decrypt(answerIdParam);

    if (object.comment == null)
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

    if (typeof(object.comment) != "string" || typeof(questionId) != "string" || typeof(answerId) != "string" || typeof(uid) != "string")
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

    if (object.comment == "" || object.comment == " " || questionId == "" || answerId == "" || uid == "")
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

    let commentRef = db.collection("questions").doc(questionId).collection("answers").doc(answerId).collection("comments").doc();

    let objectPostData = {
        comment: object.comment,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        created_by: uid,
        idComment: commentRef.id,
        idQuestion: questionId,
        idAnswer: answerId,
        deleted: false
    }

    await commentRef.set(objectPostData)
    .then(() => {
        code = "PROCESS_OK";
        message = "Comentario creado exitosamente";
        type = "success";
        status = 201;
    })
    .catch(error => { 
        code = error.code;
        message = "Ha ocurrido un error al crear el comentario"; 
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