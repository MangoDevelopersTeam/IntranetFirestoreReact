// Importaciones
const { Decrypt, Encrypt } = require("./../../helpers/cipher");
const admin = require("firebase-admin");

// Declaraciones
const db = admin.firestore();
const auth = admin.auth();

// Objeto controllers que contendra los metodos
const controllers = {};

/**
 * Función para actualizar datos de una asignatura
 * @param {Request} req objeto request
 * @param {Response} res objeto reponse
 * @returns mensaje informativo al usuario o el data del usuario
 */
/* controllers.editCourse = async(req, res) => {
    const { id, code, type, grade, courseName, description } = req.body;

    // Se verifica si hay una token de autorización
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer '))
    {
        return res.status(401).send({ code: "TOKEN_MISSING", message: "Esta acción necesita de un token de autenticación", type: "error" });
    }

    // Si existe un token, se guarda en una variable llamada idToken
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) 
    {
        idToken = req.headers.authorization.split('Bearer ')[1];
    }

    const decodedToken = await AUTH.verifyIdToken(idToken, true);
    const userRecord = await AUTH.getUser(decodedToken.uid);

    const userLevel = Decrypt(userRecord.customClaims.level);

    if (userLevel === "admin") {

        await DB.collection("courses").doc(id).update({
            code: code,
            type: type,
            grade: grade,
            couseName: courseName,
            description: description
        }).then(() => {
            return res.send({ code: "PROCESS_OK", message: "Asignatura actualizada existosamente", type: "success" });
        }).catch(() => {
            return res.send({ code: "ERROR", message: "La asignatura no se pudo actualizar", type: "error" })
        })
    }
    return res.send({ code: "ACCESS_DENIED", message: "No tienes privilegios de administrador para esta operación", type: "error" });

}; */



/**
 * Función que actualiza si un profesor es ayudante o no
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto reponse
 * @returns mensaje informativo al usuario o el data del usuario
 */
controllers.editTeacherHelper = async (req, res) => {
    let { courseId, teacherId } = req.query;
    let { helperState } = req.body;

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
        if (result.size > 1)
        {
            let findHelpers = result.docs.filter(x => x.data().helper == true)

            if (findHelpers.length > 0)
            {
                if (dataHelper == true)
                {
                    message = "No pueden existir 2 profesores dentro de la asignatura";
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
                    let userHelperId = result.docs.find(x => x.data().helper == true).id;

                    await db.collection("courses").doc(idCourse).collection("teachers").doc(userHelperId).update({
                        helper: false
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

                    await db.collection("courses").doc(idCourse).collection("teachers").doc(idTeacher).update({
                        helper: true
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
                        type = "success";
                        message = "Datos modificados";
                        data = Encrypt(array);
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
                }
            }
        }
        else
        {
            code = "POST_HELPER_ERROR";
            message = "No puede haber ayudantes en el curso si no hay un profesor principal asignado"; 
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
 * Función para editar una unidad en intranet
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response 
 */
controllers.editUnitCourse = async (req, res) => {
    let { uid } = res.locals;
    let { unitData } = req.body;
    let { paramIdSubject, paramIdUnit } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (unitData === null || paramIdSubject === null || paramIdUnit === null)
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
    let unit = Decrypt(unitData);

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

    if (typeof(unit.name) !== "string")
    {
        code = "BAD_UNIT_PARAM_FORMAT";
        message = "Asegurese de enviar la unidad correctamente"; 
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
        unit: unit.name,
        updated: true,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_by: uid
    })
    .catch(error => {
        code = "FIREBASE_UPDATE_UNIT_ERROR";
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