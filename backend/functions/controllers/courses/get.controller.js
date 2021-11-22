const { Decrypt, Encrypt } = require("./../../helpers/cipher");
const admin = require("firebase-admin");
const functions = require("firebase-functions");

const db = admin.firestore();
const auth = admin.auth();

const controllers = {};

/**
 * Función para obtener los cursos
 * @param {Request} req objeto request
 * @param {Response} res objeto response
 * @returns Objeto json de las regiones
 */
controllers.getCourses = async (req, res) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return res.send({ code: "TOKEN_MISSING", message: "Esta acción necesita de un token de autenticación", type: "error" });
    }

    try {
        const { page } = req.query;

        /* if (page <= 1)
        {
            await getCoursesNoPage(page);
        }
        else
        { */
        await db.collection("courses").orderBy("created_at").get()
            .then(async snapshot => {

                // Obtener paginas
                const staticSize = snapshot.size; // 7

                let size = staticSize; // 7
                let array = [];

                size = size / 5; //1,4
                size = Math.floor(size);

                if (staticSize % 5 !== 0) {
                    size++;
                }

                // size: 2

                let a = 0; // a = 0

                if (page) // page: 2
                {
                    a = page * 5; // -> 10
                }

                let b = 0; // -> 5

                if (staticSize > 5) {
                    b = a - 5; // -> 5
                }

                //return res.send({ code: "PROCESS_OK", a: a, b: b, paginas: size, type: "success" });

                /* if (page > 1)
                {   
                    await db.collection("courses").orderBy("created_at").startAfter(b).limit(a).get()
                    .then((coursesRecord) => {
                        if (coursesRecord?.docs?.length > 0)
                        {
                            coursesRecord?.docs?.forEach(course => {
                                array.push({
                                    id: course?.id,
                                    data: course?.data(),
                                });
                            });

                            return res.send({ code: "PROCESS_OK", data: array, paginas: size, type: "success" });
                        }

                        return res.send({ code: "NO_REGIONS", message: "No existen regiones aún", type: "error" });
                    })
                    .catch((error) => {
                        return res.send({ code: "FIREBASE_GET_ERROR", message: error.message, type: "error" });
                    });
                }
                else
                { */
                /* await db.collection("courses").orderBy("indice").startAt(b).limit(a).get() */
                await db.collection("courses").get()
                    .then((coursesRecord) => {
                        if (coursesRecord?.docs?.length > 0) {
                            coursesRecord?.docs?.forEach(course => {
                                array.push({
                                    id: course?.id,
                                    data: Encrypt(course?.data()),
                                });
                            });

                            return res.send({ code: "PROCESS_OK", data: Encrypt(array), paginas: size, type: "success" });
                        }

                        return res.send({ code: "NO_REGIONS", message: "No existen regiones aún", type: "error" });
                    })
                    .catch((error) => {
                        return res.send({ code: "FIREBASE_GET_ERROR", message: error.message, type: "error" });
                    });
                /* } */

            });


        /* } */
        /* let queryLength = query.docs.length; */




        /* let longitud = 11;
        let longitudd = longitud;

        longitud = longitud/5;
        longitud = Math.floor(longitud);
        if(longitudd%5!=0){
            longitud++
    } */


        //console.log(longitud);










        /* db.collection("courses").orderBy("created_at").startAt(0).limit(5).get()
        .then((coursesRecord) => {
            if (coursesRecord?.docs?.length > 0)
            {
                coursesRecord?.docs?.forEach(course => {
                    array.push({
                        id: course?.id,
                        data: course?.data(),
                    });
                });

                let longitud = array.length
                longitud = longitud/5;
                Math.floor(longitud);

                return res.send({ code: "PROCESS_OK", data: array, type: "success" });
            }

            return res.send({ code: "NO_REGIONS", message: "No existen regiones aún", type: "error" });
        })
        .catch((error) => {
            return res.send({ code: "FIREBASE_GET_ERROR", message: error.message, type: "error" });
        }); */
    }
    catch (error) {
        if (error.code == 'auth/id-token-revoked') {
            return res.send({ code: "TOKEN_REVOKED", message: "Re-autenticate o deslogueate de la aplicación para acceder nuevamente", type: "error" });
        }
        else {
            return res.send({ code: "TOKEN_INVALID", message: "El token provisto es invalido", type: "error" });
        }
    }
};



/**
 * Función para buscar el curso por la id
 * @param {Request} req objeto request
 * @param {Response} res objeto response
 * @returns Objeto con la información de la asignatura
 */
controllers.getCourseById = async (req, res) => {
    let { id } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";

    await db.collection('courses').doc(id).get()
        .then((result) => {
            if (result.exists === true) {
                code = "PROCESS_OK";
                data = Encrypt(result.data());
                type = "success";
            }
            else {
                code = "COURSE_NOT_FOUND";
                data = undefined;
                message = "No se encontro el curso con el id escrito";
                type = "error";
            }
        })
        .catch((error) => {
            code = "FIREBASE_GET_ERROR";
            message = error?.message;
            type = "error";
        })
        .finally(() => {
            res.send({ code: code, message: message, data: data, type: type });

            message = null;
            code = null;
            data = null;
            type = null;
            db = null;
            id = null;

            return;
        });
};


/**
 * Función para obtener los profesores que esten ligados a los cursos de la asignatura
 * @param {Request} req objeto request
 * @param {Response} res objeto response
 * @returns arreglo de usuarios de profesores ligados a la asignatura
 */
controllers.getTeachers = async (req, res) => {
    let { course } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";

    await db.collection("users").where("level", "==", "teacher").where("courses", "array-contains", course).get()
        .then((result) => {
            if (result.docs.length > 0) {
                let array = [];

                result.forEach(doc => {
                    array.push({
                        id: doc.id,
                        data: Encrypt(doc.data())
                    });
                });

                code = "PROCESS_OK";
                data = Encrypt(array);
                type = "success";
            }
            else {
                code = "NO_TEACHERS";
                message = "No existen profesores ligados a esta asignatura";
                type = "warning";
            }
        })
        .catch(error => {
            code = "FIREBASE_GET_ERROR";
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
            course = null;

            return;
        });
};


/**
 * Función para obtener los alumnos que esten ligados al curso de la asignatura
 * @param {Request} req objeto request
 * @param {Response} res objeto response
 * @returns arreglo de usuarios de alumnos ligados a la asignatura
 */
controllers.getStudents = async (req, res) => {
    let { number, letter, grade } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";

    await db.collection("users").where("level", "==", "student").get()
        .then(result => {
            if (result.docs.length > 0) {
                let students = result.docs.filter(x => x.data().number == number && x.data().letter == letter && x.data().grade == grade);
                if (students.length > 0) {
                    let array = [];

                    students.forEach(doc => {
                        array.push({
                            id: doc.id,
                            data: Encrypt(doc.data())
                        });
                    });

                    code = "PROCESS_OK";
                    data = Encrypt(array);
                    type = "success";
                }
                else {
                    code = "NO_STUDENTS";
                    message = "No existen alumnos ligados a esta asignatura";
                    type = "warning";
                }
            }
            else {
                code = "NO_STUDENTS";
                message = "No existen alumnos ligados a esta asignatura";
                type = "warning";
            }
        })
        .catch((error) => {
            code = "FIREBASE_GET_ERROR";
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
            course = null;

            return;
        });
};


/**
 * Función para obtener el arreglo de usuarios profesores dentro de la asignatura
 * @param {Request} req objeto request
 * @param {Response} res objeto response
 * @returns arreglo de usuarios de profesores ligados a la asignatura
 */
controllers.getTeachersCourse = async (req, res) => {
    let { id } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";

    await db.collection("courses").doc(id).collection("teachers").get()
        .then((result) => {
            if (result.docs.length > 0) {
                let array = [];

                result.forEach(doc => {
                    array.push({
                        id: doc.id,
                        data: Encrypt(doc.data())
                    });
                });

                code = "PROCESS_OK";
                data = Encrypt(array);
                type = "success";
            }
            else {
                code = "NO_TEACHERS_FOUNDED";
                message = "No hay profesores en esta asignatura aún";
                type = "warning";
            }
        })
        .catch((error) => {
            code = "FIREBASE_GET_ERROR";
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
            id = null;

            return;
        });
};


/**
 * Función para obtener el arreglo de usuarios alumnos dentro de la asignatura
 * @param {Request} req objeto request
 * @param {Response} res objeto response
 * @returns arreglo de usuarios de alumnos ligados a la asignatura
 */
controllers.getStudentsCourse = async (req, res) => {
    let { id } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (id == null) {
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

    await db.collection("courses").doc(id).collection("students").get()
        .then((result) => {
            if (result.docs.length > 0) {
                let array = [];

                result.forEach(doc => {
                    array.push({
                        id: doc.id,
                        data: Encrypt(doc.data())
                    });
                });

                code = "PROCESS_OK";
                data = Encrypt(array);
                type = "success";
            }
            else {
                code = "NO_STUDENTS_FOUNDED";
                message = "No hay estudiantes en esta asignatura aún";
                type = "warning";
            }
        })
        .catch((error) => {
            code = "FIREBASE_GET_ERROR";
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
            id = null;

            return;
        });
};



/**
 * Función para obtener las unidades en un curso especifico
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 * @returns arreglo de unidades del curso o un mensaje informativo
 */
controllers.getUnitsCourse = async (req, res) => {
    let { id } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    await db.collection("courses").doc(id).collection("units").orderBy("numberUnit", "asc").get()
        .then((result) => {
            let array = [];

            if (result.size > 0) {
                result.forEach(doc => {
                    array.push({
                        id: doc.id,
                        data: Encrypt(doc.data())
                    });
                });
            }

            code = "PROCESS_OK";
            data = Encrypt(array);
            type = "success";
            status = 200;
        })
        .catch((error) => {
            code = "FIREBASE_GET_UNITS_ERROR";
            message = error.message;
            type = "error";
            status = 400;
        })
        .finally(() => {
            res.status(status).send({ code: code, message: message, data: data, type: type });

            message = null;
            status = null;
            code = null;
            data = null;
            type = null;
            db = null;
            id = null;

            return;
        });
};



controllers.getUnitFiles = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { idSubjectParam, idUnitParam } = req.query;

    if (idSubjectParam == null || idUnitParam == null) {
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

    if (idSubjectParam.startsWith("U2FsdGVkX") == false || idUnitParam.startsWith("U2FsdGVkX") == false) {
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
    let idUnit = Decrypt(idUnitParam);

    if (typeof (idSubject) != "string" || typeof (idUnit) != "string") {
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

    let object = {
        idUnit: null,
        data: []
    };
    object.idUnit = idUnit;

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").get()
        .then(result => {
            let array = [];

            if (result.size > 0) {
                result.forEach(doc => {
                    array.push({
                        id: doc.id,
                        data: doc.data()
                    });
                });
            }

            object.data = array;

            code = "PROCESS_OK";
            type = "success";
            status = 200;
        })
        .catch(error => {
            if (error.response) {
                code = error.response.message;
                message = error.response.message;
            }
            else {
                code = "GET_FILES_UNIT_ERROR";
                message = "Ha ocurrido un error al obtener los archivos de la unidad";
            }

            type = "error";
            status = 400;
        })
        .finally(() => {
            res.status(status).send({ code: code, message: message, data: object, type: type });

            uid = null;
            db = null;
            code = null;
            message = null;
            type = null;
            status = null;

            return;
        });
};



controllers.deleteUnitFile = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { idSubjectParam, idUnitParam, idFileParam } = req.query;

    if (idSubjectParam == null || idUnitParam == null || idFileParam == null) {
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

    if (idSubjectParam.startsWith("U2FsdGVkX") == false || idUnitParam.startsWith("U2FsdGVkX") == false || idFileParam.startsWith("U2FsdGVkX") == false) {
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
    let idUnit = Decrypt(idUnitParam);
    let idFile = Decrypt(idFileParam);

    if (typeof (idSubject) != "string" || typeof (idUnit) != "string" || typeof (idFile) != "string") {
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

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(idFile).delete()
        .then(() => {
            code = "PROCESS_OK";
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



controllers.editUnitFile = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { uid } = res.locals;
    let { objectData, editFileData } = req.body;
    let { idSubjectParam, idUnitParam, idUnitFileParam } = req.query;

    if (objectData == null || objectData == null || idSubjectParam == null || idUnitParam == null || idUnitFileParam == null) {
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

    if (objectData.startsWith("U2FsdGVkX") == false || editFileData.startsWith("U2FsdGVkX") == false || idSubjectParam.startsWith("U2FsdGVkX") == false || idUnitParam.startsWith("U2FsdGVkX") == false || idUnitFileParam.startsWith("U2FsdGVkX") == false) {
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

    let dataObject = Decrypt(objectData);
    let editFile = Decrypt(editFileData);

    let idSubject = Decrypt(idSubjectParam);
    let idUnit = Decrypt(idUnitParam);
    let idFile = Decrypt(idUnitFileParam);

    if (typeof (idSubject) != "string" || typeof (idUnit) != "string" || typeof (idFile) != "string" || typeof (editFile) != "boolean") {
        code = "BAD_TYPES_PARAM";
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

    if (typeof (Decrypt(dataObject.name)) != "string" || typeof (Decrypt(dataObject.description)) != "string") {
        code = "BAD_UNIT_FILE_TYPES_PARAM";
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

    if (editFile == true) {
        if (typeof (Decrypt(dataObject.url)) != "string") {
            code = "BAD_UNIT_FILE_TYPES_PARAM";
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

    if (editFile == false) {
        delete dataObject.url;
    }

    dataObject.updated_at = admin.firestore.FieldValue.serverTimestamp();
    dataObject.updated_by = uid;

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(idFile).update(dataObject)
        .then(() => {
            code = "PROCESS_OK";
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



controllers.ObtenerTarea = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let array = [];

    let { idSubjectParam, idArchiveParam, idUnitParam } = req.query;

    if (idSubjectParam == null || idArchiveParam == null || idUnitParam == null)
    {
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

    if (idSubjectParam.startsWith("U2FsdGVkX") == false || idArchiveParam.startsWith("U2FsdGVkX") == false || idUnitParam.startsWith("U2FsdGVkX") == false)
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

    let idSubject = Decrypt(idSubjectParam);
    let idArchive = Decrypt(idArchiveParam);
    let idUnit = Decrypt(idUnitParam);

    if (typeof (idSubject) != "string" || typeof (idArchive) != "string" || typeof (idUnit) != "string")
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

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(idArchive).get()
    .then(result => {
        if (result.exists == true) 
        {
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
}



controllers.ObtenerEstudiantesEstadoTarea = async () => {
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
}


module.exports = controllers;