const { Decrypt, Encrypt } = require("../../helpers/cipher");
const admin = require("firebase-admin");

const controllers = {};

controllers.setHomeworkFileURL = async (req, res) => {
    let { uid } = res.locals;
    let { objectData } = req.body;
    let { idSubjectParam, idUnitParam } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (objectData == null || idSubjectParam == null || idUnitParam == null)
    {
        code = "COURSE_DATA_NULL";
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

    let homework = Decrypt(objectData);
    let idUnit = Decrypt(idUnitParam);
    let idSubject = Decrypt(idSubjectParam);

    if (typeof(idSubject) != "string" || typeof(idUnit) != "string")
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

    if (typeof(Decrypt(homework.url)) != "string" || typeof(Decrypt(homework.name)) != "string" || typeof(Decrypt(homework.description)) != "string" || typeof(homework.limitTime) != "boolean")
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

    if (homework.limitTime == true)
    {
        if (typeof(homework.limitDate) != "string")
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
    }

    homework.created_at = admin.firestore.FieldValue.serverTimestamp();
    homework.created_by = uid;
    homework.type = "HOMEWORK";

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").add(homework)
    .then(() => {
        code = "PROCESS_OK";
        message = "Archivo creado exitosamente";
        type = "success";
        status = 201;
    })
    .catch(error => { 
        code = error.code;
        message = "Ha ocurrido un error al añadir el archivo en la unidad"; 
        type = "error";
        status = 400;
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

controllers.postStudentHomework = async (req, res) => {
    let { uid } = res.locals;
    let { objectData } = req.body;
    let { idSubjectParam, idUnitParam, idFileParam } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (objectData == null || idSubjectParam == null || idUnitParam == null || idFileParam == null)
    {
        code = "DATA_SENT_NULL";
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

    let homework = Decrypt(objectData);
    let idUnit = Decrypt(idUnitParam);
    let idFile = Decrypt(idFileParam);
    let idSubject = Decrypt(idSubjectParam);

    if (typeof(idSubject) != "string" || typeof(idUnit) != "string" || typeof(idFile) != "string")
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

    if (typeof(homework.calificated) != "boolean" || typeof(homework.date) != "string" || typeof(homework.inTime) != "boolean" || typeof(homework.remainingTime) != "string" || typeof(Decrypt(homework.url)) != "string")
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

    if (homework.limitTime === false)
    {
        delete homework.limitDate;
    }

    homework.created_at = admin.firestore.FieldValue.serverTimestamp();
    homework.created_by = uid;
    homework.idSubject = idSubject;
    homework.idUnit = idUnit;
    homework.idFile = idFile;

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(idFile).collection("answers").doc(uid).set(homework)
    .catch(error => {
        code = error.code;
        message = "Ha ocurrido un error al añadir la tarea"; 
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

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(idFile).collection("answers").doc(uid).get()
    .then(result => {
        let array = [];

        array.push({
            id: result.id,
            data: result.data()
        });

        code = "PROCESS_OK";
        data = Encrypt(array);
        type = "success";
        status = 201;
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
        message = null;
        type = null;
        status = null;

        return;
    });
};

controllers.postFeedback = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { uid } = res.locals;
    let { objectData } = req.body;
    let { idSubjectParam, idUnitParam, idFileParam, idStudentParam } = req.query;

    if (idSubjectParam == null || idUnitParam == null || idFileParam == null || idStudentParam == null || objectData == null)
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
    let dataObject = Decrypt(objectData);


    if (typeof(idSubject) != "string" || typeof(idUnit) != "string" || typeof(idFile) != "string" || typeof(idStudent) != "string")
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

    if (typeof(Decrypt(dataObject.feedback)) != "string")
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

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(idFile).collection("answers").doc(idStudent).update({
        calificated: true
    })
    .catch(error => {
        code = error.code;
        message = "Ha ocurrido un error al editar el valor de feedback"; 
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

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(idFile).collection("answers").doc(idStudent).collection("feedback").add({
        feedback: dataObject.feedback,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        created_by: uid
    })
    .then(() => {
        code = "PROCESS_OK";
        message = "Feedback creado correctamente"
        type = "success";
        status = 201;
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
        message = null;
        type = null;
        status = null;

        return;
    });
};


/* controller.setFeedBack = async (res,req)=>{

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let feedbackObj = '';

    await db.collection('courses').doc(courseId).collection('units').doc(unitId).collection('files').doc(fileId)
    .collection('awnsers').doc(awnserId).add({feedback:feedbackObj})
    .then(
        code = "PROCESS_OK";
        data = Encrypt(array);
        type = "success";
        status = 201;
    )
    .catch(error=>{
        code = error.code;
        type = "error";
        status = 500;
    })
    .finnaly(()=>{
        res.status(status).send({ code: code, message: message, data: data, type: type });

        db = null;
        code = null;
        message = null;
        type = null;
        status = null;

        return;
    })

} */


module.exports = controllers;