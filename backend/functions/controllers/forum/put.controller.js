// Importaciones
const { Decrypt, Encrypt } = require("./../../helpers/cipher");
const admin = require("firebase-admin");

// Declaraciones
const controllers = {};

// Metodos
controllers.putQuestionComment = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { uid } = res.locals;
    let { objectData } = req.body;
    let { questionIdParam, commentIdParam } = req.query;

    if (objectData == null || questionIdParam == null || commentIdParam == null || uid == null)
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

    if (objectData.startsWith("U2FsdGVkX1") == false || questionIdParam.startsWith("U2FsdGVkX1") == false || commentIdParam.startsWith("U2FsdGVkX1") == false)
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
    let commentId = Decrypt(commentIdParam);

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

    if (typeof(object.comment) != "string" || typeof(questionId) != "string" || typeof(commentId) != "string" || typeof(uid) != "string")
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

    if (object.comment == "" || object.comment == " " || questionId == "" || commentId == "" || uid == "")
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

    let objectPostData = {
        comment: object.comment,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_by: uid
    }

    await db.collection("questions").doc(questionId).collection("comments").doc(commentId).update(objectPostData)
    .then(() => {
        code = "PROCESS_OK";
        message = "Comentario editado exitosamente";
        type = "success";
        status = 201;
    })
    .catch(error => { 
        code = error.code;
        message = "Ha ocurrido un error al editar el comentario"; 
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

controllers.putAnswerComment = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { uid } = res.locals;
    let { objectData } = req.body;
    let { questionIdParam, commentIdParam, answerIdParam } = req.query;

    if (objectData == null || questionIdParam == null || commentIdParam == null || answerIdParam == null || uid == null)
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

    if (objectData.startsWith("U2FsdGVkX1") == false || questionIdParam.startsWith("U2FsdGVkX1") == false || answerIdParam.startsWith("U2FsdGVkX1") == false || commentIdParam.startsWith("U2FsdGVkX1") == false)
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
    let commentId = Decrypt(commentIdParam);
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

    if (typeof(object.comment) != "string" || typeof(questionId) != "string" || typeof(commentId) != "string" || typeof(answerId) != "string" || typeof(uid) != "string")
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

    if (object.comment == "" || object.comment == " " || questionId == "" || commentId == "" || answerId == "" || uid == "")
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

    let objectPostData = {
        comment: object.comment,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_by: uid
    }

    await db.collection("questions").doc(questionId).collection("answers").doc(answerId).collection("comments").doc(commentId).update(objectPostData)
    .then(() => {
        code = "PROCESS_OK";
        message = "Comentario editado exitosamente";
        type = "success";
        status = 201;
    })
    .catch(error => { 
        code = error.code;
        message = "Ha ocurrido un error al editar el comentario"; 
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