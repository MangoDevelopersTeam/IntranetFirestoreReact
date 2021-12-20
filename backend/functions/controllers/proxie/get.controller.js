const { Decrypt, Encrypt } = require("../../helpers/cipher");
const admin = require("firebase-admin");

const controllers = {};

controllers.getStudentsProxie = async (req, res) => {
    let db = admin.firestore();
    
    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let errorExec = false;
    let studentsUID = [];
    let students = [];

    let { uid } = res.locals;

    if (uid == null)
    {
        code = "USER_UID_NULL";
        message = "Asegurese de enviar los parametros correctamente"; 
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

    await db.collection("users").doc(uid).get()
    .then(async result => {
        studentsUID = result.data().students;
        
        if (studentsUID.length < 0)
        {
            code = "NO_STUDENTS_ASSIGNED";
            message = "No tienes estudiantes asignados a ti aún";
            type = "error";
            status = 404;

            return;
        }

        for (let x = 0; x < studentsUID.length; x++)
        {
            await db.collection("users").doc(studentsUID[x]).get()
            .then(result => {
                students.push({
                    id: result.id,
                    data: result.data()
                });

                errorExec = false;
            })
            .catch(error => {
                code = error.code;
                errorExec = true;

                return;
            });
        }

        if (errorExec == true)
        {
            type = "error";
            status = 400;
        }
        else
        {
            code = "PROCESS_OK";
            data = Encrypt(students);
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

        uid = null;
        db = null;
        code = null;
        message = null;
        type = null;
        status = null;

        return;
    });
};

controllers.getCheckStudentAssignation = async (req, res) => {
    let db = admin.firestore();
    
    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { studentIdParam } = req.query;
    let { uid } = res.locals;

    if (studentIdParam == null || uid == null)
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

    if (studentIdParam.startsWith("U2FsdGVkX") == false)
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

    let studentId = Decrypt(studentIdParam);

    if (typeof(studentId) != "string" || typeof(uid) != "string")
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

    if (studentId == "" || uid == "")
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

    await db.collection("users").doc(uid).get()
    .then(result => {
        if (result.data().students == null)
        {
            code = "NOT_HAVE_STUDENTS";
            message = "Usted no tiene estudiantes asignados";
            type = "error";
            status = 404;
        }

        if (result.data().students.length <= 0)
        {
            code = "NOT_HAVE_STUDENTS";
            message = "Usted no tiene estudiantes asignados";
            type = "error";
            status = 404;
        }

        if (result.data().students.includes(studentId) == true)
        {
            code = "PROCESS_OK";
            data = true;
            type = "success";
            status = 200;
        }
        else
        {
            code = "STUDENT_NOT_FOUND";
            data = false;
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

        uid = null;
        db = null;
        code = null;
        message = null;
        type = null;
        status = null;

        return;
    });
};

controllers.getStudentSubjects = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let type = "";
    let status = 0;
    let data = null;
    let message = "";

    let arraySubjects = [];
    let arraySubjectsStudent = [];

    let { studentIdParam } = req.query;

    if (studentIdParam == null)
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

    if (studentIdParam.startsWith("U2FsdGVkX") == false)
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

    let studentId = Decrypt(studentIdParam);

    if (typeof(studentId) != "string")
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

    if (studentId == "")
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

    await db.collection("courses").get()
    .then(async resultSubject => {
        resultSubject.docs.forEach(doc => {
            arraySubjects.push({
                id: doc.id,
                data: doc.data()
            });
        });

        await db.collection("users").doc(studentId).collection("courses").get()
        .then(resultSubjectStudent => {
            if (resultSubjectStudent.size > 0)
            {
                resultSubjectStudent.docs.forEach(doc => {
                    let filter = arraySubjects.filter(x => x.id === doc.id);

                    if (filter.length > 0)
                    {
                        if (filter[0].data.deleted == false)
                        {
                            arraySubjectsStudent.push({
                                id: doc.id,
                                data: {
                                    id: doc.id,
                                    idCourse: doc.id,
                                    uid: studentId,
                                    code: filter[0].data.code,
                                    name: filter[0].data.courseName,
                                    subject: filter[0].data.type,
                                    created_at: doc.data().created_at,
                                }
                            });
                        }
                    }
                });

                code = "PROCESS_OK";
                data = Encrypt(arraySubjectsStudent);
                type = "success";
                status = 200;
            }
            else
            {
                code = "NO_COURSES_EXIST";
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

/* controllers.setHomeworkFileURL = async (req, res) => {
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

    // await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").add(homework)

    let homeworkRef = db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc();

    homework.created_at = admin.firestore.FieldValue.serverTimestamp();
    homework.created_by = uid;
    homework.type = "HOMEWORK";

    homework.idSubject = idSubject;
    homework.idUnit = idUnit;
    homework.idFile = homeworkRef.id;

    await homeworkRef.set(homework)
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

    let answerRef = db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(idFile).collection("answers").doc(uid);

    homework.created_at = admin.firestore.FieldValue.serverTimestamp();
    homework.created_by = uid;
    homework.idSubject = idSubject;
    homework.idUnit = idUnit;
    homework.idFile = idFile;
    homework.idAnswer = uid;
    homework.id = answerRef.id;

    await answerRef.set(homework)
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

    let feedbackRef = db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(idFile).collection("answers").doc(idStudent).collection("feedback").doc();

    let object = {
        feedback: dataObject.feedback,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        created_by: uid,
        idStudent: idStudent,
        idSubject: idSubject,
        idUnit: idUnit,
        idFile: idFile,
        idAnswer: idStudent,
        idFeedback: feedbackRef.id
    }

    await feedbackRef.set(object)
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
}; */

module.exports = controllers;