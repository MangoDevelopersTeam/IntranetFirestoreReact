// Importación de los metodos encrypt y decrypt
const { Decrypt, Encrypt } = require("./../../helpers/cipher");

// Importación admin sdk
const admin = require("firebase-admin");

// Declaración de constantes para acortar la escritura
const db = admin.firestore();
const auth = admin.auth();

const controllers = {};

/**
 * Función para eliminar una asignatura
 * @param {Request} req objeto request
 * @param {Response} res objeto reponse
 * @returns mensaje informativo al usuario o el data del usuario
 */
controllers.deleteCourse = async(req, res) => {
    const { id } = req.body;

    // Se verifica si hay una token de autorización
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return res.status(401).send({ code: "TOKEN_MISSING", message: "Esta acción necesita de un token de autenticación", type: "error" });
    }

    // Si existe un token, se guarda en una variable llamada idToken
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    }

    const decodedToken = await auth.verifyIdToken(idToken, true);
    const userRecord = await auth.getUser(decodedToken.uid);

    const userLevel = Decrypt(userRecord.customClaims.level);



    if (userLevel === "admin") {
        await db.collection("courses").doc(id).delete()
            .then(() => {
                return res.send({ code: "PROCESS_OK", message: "Asignatura eliminada existosamente", type: "success" });
            }).catch(() => {
                return res.send({ code: "ERROR", message: "La asignatura no se pudo eliminar", type: "error" })
            })
    }
    return res.send({ code: "ACCESS_DENIED", message: "No tienes privilegios de administrador para esta operación", type: "error" });
};


/**
 * Función para remover a un profesor de un curso
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 * @returns mensaje informativo al usuario o el arreglo de usuario en el curso
 */
controllers.removeTeacherCourse = async (req, res) => {
    let { courseId, teacherId } = req.query;
    let { helperState } = req.body;

    //return res.status(200).send({ courseId: courseId, teacherId: teacherId, helper: helperState })

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (courseId == null || teacherId == null || helperState == null)
    {
        code = "NO_DATA_SEND";
        message = "Asegurate de que hayas completado los campos del formulario"; 
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        db = null;
        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    }

    let idCourse = Decrypt(courseId);
    let idTeacher = Decrypt(teacherId);
    let dataHelper = helperState;

    await db.collection("courses").doc(idCourse).collection("teachers").get()
    .then(async result => {
        let helpersLength = result.docs.filter(x => x.data().helper == true).length;

        if (dataHelper == true)
        {
            await db.collection("courses").doc(idCourse).collection("teachers").doc(idTeacher).delete()
            .catch(error => {
                code = error.code;
                type = "error";
                status = 400;

                res.status(status).send({ code: code, message: message, data: data, type: type });

                db = null;
                code = null;
                data = null;
                message = null;
                type = null;
                status = null;

                return;
            });

            await db.collection("users").doc(idTeacher).collection("courses").doc(idCourse).delete()
            .catch(error => {
                code = error.code;
                type = "error";
                status = 400;

                res.status(status).send({ code: code, message: message, data: data, type: type });

                db = null;
                code = null;
                data = null;
                message = null;
                type = null;
                status = null;

                return;
            });
        }
        else
        {
            if (helpersLength > 0)
            {
                message = "No puede eliminar al docente mientras exista el ayudante, no puede dejar un ayudante sin un docente principal";
                code = error.code;
                type = "error";
                status = 400;

                res.status(status).send({ code: code, message: message, data: data, type: type });

                db = null;
                code = null;
                data = null;
                message = null;
                type = null;
                status = null;

                return;
            }
            else
            {
                await db.collection("courses").doc(idCourse).collection("teachers").doc(idTeacher).delete()
                .catch(error => {
                    code = error.code;
                    type = "error";
                    status = 400;

                    res.status(status).send({ code: code, message: message, data: data, type: type });

                    db = null;
                    code = null;
                    data = null;
                    message = null;
                    type = null;
                    status = null;

                    return;
                });

                await db.collection("users").doc(idTeacher).collection("courses").doc(idCourse).delete()
                .catch(error => {
                    code = error.code;
                    type = "error";
                    status = 400;

                    res.status(status).send({ code: code, message: message, data: data, type: type });

                    db = null;
                    code = null;
                    data = null;
                    message = null;
                    type = null;
                    status = null;

                    return;
                });
            }
        }

        await db.collection("courses").doc(idCourse).collection("teachers").get()
        .then(result => {
            let array = [];

            if (result.docs.length > 0)
            {
                result.forEach(doc => {
                    array.push({
                        id: doc.id,
                        data: Encrypt(doc.data())
                    });
                });
            }

            code = "PROCESS_OK";
            message = "Profesor removido correctamente";
            data = Encrypt(array);
            type = "success";
            status = 200;
        })
        .catch(error => {
            code = error.code;
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
    });
};


/**
 * Función para remover a un estudiante del curso
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 * @returns mensaje informativo al usuario o el arreglo de usuario en el curso
 */
controllers.removeStudentCourse = async (req, res) => {
    let { courseId, studentId } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";

    let idCourse = Decrypt(courseId);
    let idStudent = Decrypt(studentId);

    await db.collection("courses").doc(idCourse).collection("students").doc(idStudent).delete()
    .catch(error => {
        code = "FIREBASE_DELETE_STUDENT_COURSE_ERROR";
        message = error.message;
        type = "error";

        res.send({ code: code, message: message, data: data, type: type });
                
        message = null;
        code = null;  
        data = null;
        type = null;
        db = null;
        courseId = null;
        studentId = null;
        idCourse = null;
        idStudent = null;

        return;
    });

    await db.collection("users").doc(idStudent).collection("courses").doc(idCourse).delete()
    .catch(error => {
        code = "FIREBASE_DELETE_USER_COURSE_ERROR";
        message = error.message;
        type = "error";

        res.send({ code: code, message: message, data: data, type: type });
                
        message = null;
        code = null;  
        data = null;
        type = null;
        db = null;
        courseId = null;
        studentId = null;
        idCourse = null;
        idStudent = null;

        return;
    });

    await db.collection("courses").doc(idCourse).collection("students").get()
    .then(result => {
        let array = [];

        if (result.docs.length > 0)
        {
            result.forEach(doc => {
                array.push({
                    id: doc.id,
                    data: Encrypt(doc.data())
                });
            });
        }

        code = "PROCESS_OK";
        message = "Alumno removido correctamente";
        data = Encrypt(array);
        type = "success";
    })
    .catch(error => {
        code = "FIREBASE_GET_STUDENT_COURSES_ERROR";
        message = error.message;
        type = "error";
    })
    .finally(() => {
        res.send({ code: code, message: message, data: data, type: type });
                
        message = null;
        code = null;  
        data = null;
        type = null;
        db = null;
        courseId = null;
        studentId = null;
        idCourse = null;
        idStudent = null;

        return;
    });
};









/**
 * Función para eliminar una unidad en intranet
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response 
 */
 controllers.deleteUnitCourse = async (req, res) => {
    let { uid } = res.locals;
    let { paramIdSubject, paramIdUnit } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (paramIdSubject === null || paramIdUnit === null)
    {
        code = "DATA_NULL";
        message = "Asegurese de enviar los datos correctamente"; 
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        uid = null;
        unit = null;
        paramIdSubject = null;
        paramIdUnit = null;
        unit = null;
        
        return;
    }
    
    let subjectId = Decrypt(paramIdSubject);
    let unitId = Decrypt(paramIdUnit);

    if (typeof(subjectId) !== "string" || typeof(unitId) !== "string")
    {
        code = "BAD_ID_PARAM_FORMAT";
        message = "Asegurese de enviar los id de forma correcta"; 
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        uid = null;
        unit = null;
        paramIdSubject = null;
        paramIdUnit = null;
        unit = null;
        
        return;
    }

    await db.collection("courses").doc(subjectId).collection("units").doc(unitId).update({
        deleted: true,
        deleted_at: admin.firestore.FieldValue.serverTimestamp(),
        deleted_by: uid
    })
    .catch(error => {
        code = "FIREBASE_DELETE_UNIT_ERROR";
        message = error.message;
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
    });

    await db.collection("courses").doc(subjectId).collection("units").orderBy("numberUnit", "asc").get()
    .then(result => {
        let array = [];
    
        if (result.size > 0)
        {
            result.forEach(doc => {
                array.push({
                    id: doc.id,
                    data: Encrypt(doc.data())
                });
            });
        }

        code = "PROCESS_OK";
        message = "Proceso realizado correctamente";
        type = "success";
        data = Encrypt(array);
        status = 201;
    })
    .catch(error => {
        code = "FIREBASE_GET_UNITS_ERROR";
        message = error.message;
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






module.exports = controllers;