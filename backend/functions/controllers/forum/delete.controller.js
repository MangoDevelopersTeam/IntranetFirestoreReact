// Importaciones
const { Decrypt, Encrypt } = require("./../../helpers/cipher");
const admin = require("firebase-admin");

// Declaraciones
const controllers = {};

// Metodos
controllers.deleteQuestionComment = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { questionIdParam, commentIdParam } = req.query;

    if (questionIdParam == null || commentIdParam == null)
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

    if (questionIdParam.startsWith("U2FsdGVkX1") == false || commentIdParam.startsWith("U2FsdGVkX1") == false)
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
    let commentId = Decrypt(commentIdParam);

    if (typeof(questionId) != "string" || typeof(commentId) != "string")
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

    if (questionId == "" || commentId == "")
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

    await db.collection("questions").doc(questionId).collection("comments").doc(commentId).delete()
    .then(() => {
        code = "PROCESS_OK";
        message = "Comentario eliminado exitosamente";
        type = "success";
        status = 200;
    })
    .catch(error => { 
        code = error.code;
        message = "Ha ocurrido un error al eliminar el comentario"; 
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

controllers.deleteAnswerComment = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { questionIdParam, commentIdParam, answerIdParam } = req.query;

    if (questionIdParam == null || commentIdParam == null || answerIdParam == null)
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

    if (questionIdParam.startsWith("U2FsdGVkX1") == false || commentIdParam.startsWith("U2FsdGVkX1") == false || answerIdParam.startsWith("U2FsdGVkX1") == false)
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
    let commentId = Decrypt(commentIdParam);
    let answerId = Decrypt(answerIdParam);

    if (typeof(questionId) != "string" || typeof(commentId) != "string" || typeof(answerId) != "string")
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

    if (questionId == "" || commentId == "" || answerId == "")
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

    await db.collection("questions").doc(questionId).collection("answers").doc(answerId).collection("comments").doc(commentId).delete()
    .then(() => {
        code = "PROCESS_OK";
        message = "Comentario eliminado exitosamente";
        type = "success";
        status = 200;
    })
    .catch(error => { 
        code = error.code;
        message = "Ha ocurrido un error al eliminar el comentario"; 
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
///////////////////////////////////////////////////////////////////////


controllers.deleteQuestion = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { questionIdParam } = req.query;
    let { uid } = res.locals;

    if (questionIdParam == null)
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

    if (typeof(questionId) != "string")
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

    if (questionId == "")
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

    await db.collection("questions").doc(questionId).update({
        deleted: true,
        deleted_by: uid,
        deleted_at: admin.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        code = "PROCESS_OK";
        message = "Pregunta eliminada exitosamente";
        type = "success";
        status = 200;
    })
    .catch(error => { 
        code = error.code;
        message = "Ha ocurrido un error al eliminar la pregunta"; 
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
////////////////////////////////////////////


//////////////////////////////////////////////////////////

controllers.deleteQuestionAwnser = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { questionIdParam, answerIdParam } = req.query;
    let { uid } = res.locals;

    if (questionIdParam == null || answerIdParam === null)
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

    if (typeof(questionId) != "string" || typeof(answerId) != "string" )
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

    if (questionId == "" || answerId == "")
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

    await db.collection("questions").doc(questionId).collection("answers").doc(answerId).update({
        deleted: true,
        deleted_by: uid,
        deleted_at: admin.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        code = "PROCESS_OK";
        message = "Respuesta eliminada exitosamente";
        type = "success";
        status = 200;
    })
    .catch(error => { 
        code = error.code;
        message = "Ha ocurrido un error al eliminar la respuesta"; 
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