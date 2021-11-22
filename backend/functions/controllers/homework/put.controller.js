const { Decrypt, Encrypt } = require("../../helpers/cipher");
const admin = require("firebase-admin");

const controllers = {};


controllers.updateFeedback = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { idSubjectParam, idUnitParam, idFileParam, idStudentParam, idFeedbackParam } = req.query;
    let { objectData } = req.body;
    let { uid } = res.locals;

    if (idSubjectParam == null || idUnitParam == null || idFileParam == null || idStudentParam == null || idFeedbackParam == null || objectData == null) 
    {
        code = "PARAMS_NULL";
        message = "Asegurate de que hayas completado los campos del formulario";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        course = null;
        db = null;
        code = null;
        message = null;
        type = null;
        status = null;
    }

    let idSubject = Decrypt(idSubjectParam);
    let idUnit = Decrypt(idUnitParam);
    let idFile = Decrypt(idFileParam);
    let idStudent = Decrypt(idStudentParam);
    let idFeedback = Decrypt(idFeedbackParam);
    let dataFeedback = Decrypt(objectData);

    if (typeof (idSubject) != "string" || typeof (idUnit) != "string" || typeof (idFile) != "string" || typeof (idStudent) != "string" || typeof (idFeedback) != "string") 
    {
        code = "BAD_ID_TYPE_PARAM";
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

    if (typeof (Decrypt(dataFeedback.feedback)) != "string")
    {
        code = "BAD_BODY_FORMATING";
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

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(idFile).collection("answers").doc(idStudent).collection("feedback").doc(idFeedback).update({
        feedback: dataFeedback.feedback,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_by: uid
    })
    .then(() => {
        code = "PROCESS_OK";
        message = "Feedback editado correctamente";
        type = "success";            
        status = 201;
    })
    .catch(error => {
        code = error.code;
        message = "Ha ocurrido un error al momento de editar el feedback";
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


module.exports = controllers;