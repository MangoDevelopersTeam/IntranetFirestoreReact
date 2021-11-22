const { Decrypt, Encrypt } = require("./../../helpers/cipher");
const admin = require("firebase-admin");

const controllers = {};

controllers.getStudentAnswerInformation = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { uid } = res.locals;
    let { idSubjectParam, idFileParam, idUnitParam } = req.query;

    if (idSubjectParam == null || idUnitParam == null || idFileParam == null)
    {
        code = "DATA_SENT_NULL";
        message = "Asegurate de que hayas enviado los datos correctamente"; 
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

    if (idSubjectParam.startsWith("U2FsdGVkX") == false || idFileParam.startsWith("U2FsdGVkX") == false || idUnitParam.startsWith("U2FsdGVkX") == false) 
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

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(idFile).collection("answers").doc(uid).get()
    .then(result => {
        if (result.exists == true)
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
            code = "HOMEWORK_UNDEFINED";
            data = undefined;
            type = "warning";
            status = 200;
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
        message = null;
        type = null;
        status = null;

        return;
    });
};

controllers.getStudentsWithHomework = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { idSubjectParam, idFileParam, idUnitParam } = req.query;

    if (idSubjectParam == null || idUnitParam == null || idFileParam == null)
    {
        code = "DATA_SENT_NULL";
        message = "Asegurate de que hayas enviado los datos correctamente"; 
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

    if (idSubjectParam.startsWith("U2FsdGVkX") == false || idFileParam.startsWith("U2FsdGVkX") == false || idUnitParam.startsWith("U2FsdGVkX") == false) 
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

    await db.collection("courses").doc(idSubject).collection("students").get()
    .then(async result => {
        if (result.size <= 0)
        {
            code = "STUDENTS_DOESNT_EXIST";
            message = "No existen estudiante en esta asignatura";
            type = "info";
            status = 200;
        }
        else
        {
            let studentsArray = [];
            let studentsFilesArray = [];

            result.docs.forEach(doc => {
                studentsArray.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
            
            for (let i = 0; i < studentsArray.length; i++)
            {
                let object = {
                    student: null,
                    homework: null
                };

                await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(idFile).collection("answers").doc(studentsArray[i].id).get()
                .then(result => {
                    if (result.exists == false)
                    {
                        object.student = studentsArray[i];
                        object.homework = null;

                        studentsFilesArray.push(object);
                    }
                    else
                    {
                        object.student = studentsArray[i];
                        object.homework = {
                            id: result.id,
                            data: result.data()
                        };

                        studentsFilesArray.push(object);
                    }
                })
                .catch(error => {
                    code = error.code;
                    type = "error";
                    status = 500;

                    return;
                });
            }

            code = "PROCESS_OK";
            data = Encrypt(studentsFilesArray);
            type = "success";
            status = 200;
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
        message = null;
        type = null;
        status = null;

        return;
    });
};

controllers.getStudentFeedback = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;
    let idStudent = "";

    let { idSubjectParam, idFileParam, idUnitParam, idStudentParam } = req.query;
    let { uid } = res.locals;

    if (idStudentParam == null)
    {
        idStudent = uid;
    }
    else
    {
        if (idStudentParam == null)
        {
            code = "DATA_SENT_NULL";
            message = "Asegurate de que hayas enviado los datos correctamente"; 
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

        if (idStudentParam.startsWith("U2FsdGVkX") == false) 
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

        idStudent = Decrypt(idStudentParam);
    }

    if (idSubjectParam == null || idUnitParam == null || idFileParam == null)
    {
        code = "DATA_SENT_NULL";
        message = "Asegurate de que hayas enviado los datos correctamente"; 
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

    if (idSubjectParam.startsWith("U2FsdGVkX") == false || idFileParam.startsWith("U2FsdGVkX") == false || idUnitParam.startsWith("U2FsdGVkX") == false) 
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

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(idFile).collection("answers").doc(idStudent).collection("feedback").get()
    .then(result => {
        if (result.size > 0)
        {
            let array = [];

            result.docs.forEach(doc => {
                array.push({
                    id: doc.id,
                    data: doc.data()
                });
            });

            code = "PROCESS_OK";
            data = Encrypt(array);
            type = "success";
            status = 200;
        }
        else
        {
            code = "FEEDBACK_UNDEFINED";
            data = undefined;
            type = "warning";
            status = 200;
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
        message = null;
        type = null;
        status = null;

        return;
    });
};


// esos lo comente porque me habia confundido para que funcionaban, se veian casi igual xdd

/* controllers.getSubjectStudentsHomeworks = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let studentAnswer = null;

    let { idSubjectParam, idArchiveParam, idUnitParam } = req.query;
    let { uid } = res.locals;

    if (idSubjectParam == null || idArchiveParam == null || idUnitParam == null) {
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

    if (idSubjectParam.startsWith("U2FsdGVkX") == false || idArchiveParam.startsWith("U2FsdGVkX") == false || idUnitParam.startsWith("U2FsdGVkX") == false) {
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
    let idArchive = Decrypt(idArchiveParam);
    let idUnit = Decrypt(idUnitParam);

    if (typeof (idSubject) != "string" || typeof (idArchive) != "string" || typeof (idUnit) != "string") {
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

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(idArchive).collection("answers").get()
        .then(result => {
            if (result.size > 0) {
                studentAnswer = result.docs.filter(x => x.id == uid);
            }
            else {
                studentAnswer = [];
            }

            code = "PROCESS_OK";
            data = Encrypt(studentAnswer);
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
            message = null;
            type = null;
            status = null;

            return;
        });
};
 */



/* controllers.getStudentHomework = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let array = [];

    let { idSubjectParam, idArchiveParam, idUnitParam } = req.query;

    if (idSubjectParam == null || idArchiveParam == null || idUnitParam == null) {
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

    if (idSubjectParam.startsWith("U2FsdGVkX") == false || idArchiveParam.startsWith("U2FsdGVkX") == false || idUnitParam.startsWith("U2FsdGVkX") == false) {
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
    let idArchive = Decrypt(idArchiveParam);
    let idUnit = Decrypt(idUnitParam);

    if (typeof (idSubject) != "string" || typeof (idArchive) != "string" || typeof (idUnit) != "string") {
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

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(idArchive).collection("answers").get()
        .then(result => {
            if (result.size > 0) {
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
            message = null;
            type = null;
            status = null;

            return;
        });
};
 */




/* controllers.ObtenerTarea = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let array = [];

    let { idSubjectParam, idArchiveParam, idUnitParam } = req.query;

    if (idSubjectParam == null || idArchiveParam == null || idUnitParam == null) {
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

    if (idSubjectParam.startsWith("U2FsdGVkX") == false || idArchiveParam.startsWith("U2FsdGVkX") == false || idUnitParam.startsWith("U2FsdGVkX") == false) {
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
    let idArchive = Decrypt(idArchiveParam);
    let idUnit = Decrypt(idUnitParam);

    if (typeof (idSubject) != "string" || typeof (idArchive) != "string" || typeof (idUnit) != "string") {
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

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(idArchive).get()
        .then(result => {
            if (result.exists == true) {
                array.push({
                    id: result.id,
                    data: result.data()
                });

                code = "PROCESS_OK";
                data = Encrypt(array);
                type = "success";
                status = 200;
            }
            else {
                code = "HOMEWORK_NOT_FOUND";
                data = undefined;
                message = "La tarea que busca no existe";
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
            message = null;
            type = null;
            status = null;

            return;
        });
} */



/* controllers.ObtenerEstudiantesEstadoTarea = async () => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;
    let array = []
    let { uid } = res.locals;
    let { idSubject, idArchiveParam, idUnit } = req.query;
    await db.collection('courses').doc(idSubject).collection('units').doc(idUnit).file('files').get()
        .then(tareas => {

            if (tareas.size > 0) {

                tareas.forEach(element => {
                    if (element.data().type == 'HOMEWORK') {
                        if (element.data().file.size > 0) {
                            array.push({
                                id: element.id,
                                data: element.data()
                            })
                        }
                    }

                })

                code = "PROCESS_OK";
                type = "success";
                status = 200;
            } else {
                code = "HOMEWORK_NOT_FOUND";
                data = undefined;
                message = "La tarea que busca no existe";
                type = "error";
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
            message = null;
            type = null;
            status = null;

            return array;
        })
} */








/* controllers.getDetailedCourse = async (req, res) => {
    let { courseID } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (courseID == null)
    {
        code = "COURSE_ID_NULL";
        message = "El id no puede ser nulo";
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

    if (courseID.startsWith("U2FsdGVkX") == false)
    {
        code = "COURSE_ID_BAD_FORMATING";
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

    let idCourse = Decrypt(courseID);

    if (typeof(idCourse) != "string")
    {
        code = "COURSE_ID_BAD_TYPE";
        message = "El tipo de dato del Id enviado es incorrecto";
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

    let object = {
        subject: null,
        units: null
    }

    await db.collection('courses').doc(idCourse).get()
    .then(async response => {
        if (response.exists == true)
        {
            let arraySub = [];

            arraySub.push({
                id: response.id,
                data: response.data()
            });
            object.subject = Encrypt(arraySub);

            await db.collection('courses').doc(idCourse).collection('units').orderBy("numberUnit", "asc").get()
            .then(response => {
                let arrayUni = [];

                if (response.size > 0)
                {
                    response.forEach(doc => {
                        arrayUni.push({
                            id: doc.id,
                            data: doc.data()
                        });
                    });
                }

                object.units = Encrypt(arrayUni);
            })

            code = "PROCESS_OK";
            data = Encrypt(object);
            type = "success";
            status = 200;
        }
        else
        {
            code = "SUBJECT_NOT_FOUND";
            message = "La asignatura no ha sido encontrada, asegurese que de la id sea correcta e intente nuevamente";
            type = "error";
            status = 404;

            res.status(status).send({ code: code, message: message, data: data, type: type });
            
            message = null;
            status = null;
            code = null;  
            data = null;
            type = null;
            db = null;

            return;
        }
    

    })
    .catch(error =>{
        code = "FIREBASE_GET_COURSES_ERROR";
        message = error.message;
        type = "error";
        status = 400;
    })
    .finally(()=>{
        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    });
}; */



module.exports = controllers;