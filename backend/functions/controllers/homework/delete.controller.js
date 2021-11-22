const { Decrypt, Encrypt } = require("../../helpers/cipher");
const admin = require("firebase-admin");

const controllers = {};


const batchDeleteFeedbacks = async (db, idSubject, idUnit, idFile, idStudent) => {
    const query = db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(idFile).collection("answers").doc(idStudent).collection("feedback");

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
};

const deleteQueryBatch = async (db, query, resolve) => {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) 
    {
        // When there are no documents left, we are done
        resolve();
        return;
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
};


controllers.deleteHomework = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { idSubjectParam, idUnitParam, idFileParam, idStudentParam } = req.query;

    if (idSubjectParam == null || idUnitParam == null || idFileParam == null || idStudentParam == null) {
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

    if (typeof (idSubject) != "string" || typeof (idUnit) != "string" || typeof (idFile) != "string" || typeof (idStudent) != "string") {
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

    await batchDeleteFeedbacks(admin.firestore(), idSubject, idUnit, idFile, idStudent);

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(idFile).collection("answers").doc(idStudent).delete()
    .then(() => {
        code = "PROCESS_OK";
        message = "Tarea eliminada correctamente";
        type = "success";            
        status = 200;
    })
    .catch(error => {
        code = error.code;
        message = "Ha ocurrido un error al momento de eliminar la tarea";
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

// borrar tarea
// crear feedback
// editar feedback
// borrar feedback

module.exports = controllers;