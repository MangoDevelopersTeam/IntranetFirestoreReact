// Importación del metodo Decrypt y el admin sdk
const { Decrypt, Encrypt } = require("./../../helpers/cipher");
const admin = require("firebase-admin");


// Objeto controllers que contendra los metodos
const controllers = {};


/**
 * Función para obtener la información del usuario
 * @param {import("express").Request} req Objeto Request
 * @param {import("express").Response} res Objeto Response
 */
controllers.whoami = async (req, res) => {
    let { uid } = res.locals;

    let auth = admin.auth();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    await auth.getUser(uid)
    .then(result => {
        let object = {
            email: Encrypt(result.displayName),
            displayName: Encrypt(result.email),
        }

        code = "PROCESS_OK";
        data = Encrypt(object);
        type = "success";
        status = 200;
    })
    .catch(error => {
        code = error.code;
        type = "error";
        status = 404;
    })
    .finally(() => {
        res.status(status).send({ code: code, message: message, data: data, type: type });
        
        auth = null;
        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    });
};


/**
 * Función para verificar que el run no este duplicado en la base de datos
 * @param {string} run run del usuario
 * @returns booleano de si existe o no el run en la base de datos
 */
const checkExistRun = async (run) => {
    let db = admin.firestore();

    let data = {
        exist: false,
        error: false,
        message: "",
        code: ""
    };

    await db.collection("users").get()
    .then(result => {
        let lambda = result.docs.find(x => Decrypt(x.data().rut) === run);

        if (lambda.exists == true)
        {
            data.exist = true;
            data.code = "RUN_ALREADY_EXIST";
            data.message = "El run enviado ya está registrado";
        }
        else
        {
            data.code = "PROCESS_OK";
        }
    })
    .catch(error => {
        data.code = "FIREBASE_GET_USERS_ERROR";
        data.error = true;
        data.message = error.message;
    })
    .finally(() => {
        return data;
    });

    return data;
};


/**
 * Metodo que crea usuarios dentro del sistema (profesores, alumnos, apoderados)
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 * @returns Mensaje informativo al usuario
 */
controllers.createAndRegisterUser = async (req, res) => {
    let { uid } = res.locals;
    let { user, courses, grades, students } = req.body;

    let db = admin.firestore();
    let auth = admin.auth();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (user == null || courses == null || grades == null || students == null)
    {
        code = "DATA_SENT_NULL";
        message = "Asegurate de enviar los datos de forma correcta y completa";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        db = null;
        auth = null;
        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    }

    let run = Decrypt(user.rut);
    run = run.toUpperCase();

    let email = Decrypt(user.email);
    let level = Decrypt(user.level);
    let password = Decrypt(user.password);
    let passwordRepeat = Decrypt(user.passwordRepeat);
    let displayName = `${Decrypt(user.name)} ${Decrypt(user.surname)}`;

    if (typeof(run) != "string" || typeof(email) != "string" || typeof(level) != "string" || typeof(password) != "string" || typeof(passwordRepeat) != "string" || typeof(displayName) != "string")
    {
        code = "BAD_TYPE_PARAMS";
        message = "Los tipos de datos enviados deben ser validos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        db = null;
        auth = null;
        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    }

    if (/^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/.test(email) == false)
    {
        code = "EMAIL_BAD_FORMATED";
        message = "El email debe tener un formato válido";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        db = null;
        auth = null;
        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    }

    if (level == "teacher" || level == "student" || level == "proxie")
    {
        let checkRunExist = await checkExistRun(run);

        if (checkRunExist.exist == true)
        {
            code = checkRunExist.code;
            message = checkRunExist.message; 
            type = "error";
            status = 400;

            res.status(status).send({ code: code, message: message, data: data, type: type });

            db = null;
            auth = null;
            code = null;
            data = null;
            message = null;
            type = null;
            status = null;

            return;
        }

        if (level == "teacher")
        {
            let noNormalizedCourses = Decrypt(courses);
            let normalizedCourses = [];

            if (noNormalizedCourses.length <= 0)
            {
                code = "COURSES_ARRAY_VOID";
                message = "El conjunto de asignaturas del usuario debe tener datos";
                type = "error";
                status = 400;

                res.status(status).send({ code: code, message: message, data: data, type: type });
                    
                db = null;
                auth = null;
                code = null;
                data = null;
                message = null;
                type = null;
                status = null;

                return;
            }

            await noNormalizedCourses.forEach(doc => {
                normalizedCourses.push(doc.normalize('NFD').replace(/[\u0300-\u036f]/g, ""));
            });

            user.courses = normalizedCourses;
        }

        if (level == "student")
        {
            let dataUserGrades = Decrypt(grades);        

            let grade = dataUserGrades.grade.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
            let number = dataUserGrades.number;
            let letter = dataUserGrades.letter.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

            user.grade = grade;
            user.number = number;
            user.letter = letter;
            user.assignedToProxie = false;
        }

        if (level == "proxie")
        {
            let dataStudents = Decrypt(students);

            if (dataStudents.length <= 0)
            {
                code = "STUDENTS_ARRAY_VOID";
                message = "El conjunto de estudiantes debe tener datos";
                type = "error";
                status = 400;

                res.status(status).send({ code: code, message: message, data: data, type: type });
                    
                db = null;
                auth = null;
                code = null;
                data = null;
                message = null;
                type = null;
                status = null;

                return;
            }
            user.students = dataStudents;

            await dataStudents.forEach(async doc => {
                await db.collection("users").doc(doc).update({
                    assignedToProxie: true
                })
                .catch(error => {
                    code = error.code;
                    type = "error";
                    status = 500;
        
                    res.status(status).send({ code: code, message: message, data: data, type: type });
        
                    db = null;
                    auth = null;
                    code = null;
                    data = null;
                    message = null;
                    type = null;
                    status = null;
        
                    return;
                });
            });
        }

        if (password != passwordRepeat)
        {
            code = "PASSWORDS_DOESNT_MATCH";
            message = "Las contraseñas no coinciden"; 
            type = "error";
            status = 400;

            res.status(400).send({ code: code, message: message, data: data, type: type });

            db = null;
            auth = null;
            code = null;
            data = null;
            message = null;
            type = null;
            status = null;

            return;
        }

        await auth.createUser({
            displayName: displayName,
            email: email,
            password: password
        })
        .then(async result => {
            await auth.setCustomUserClaims(result.uid, { level: user.level })
            .catch(error => {
                code = error.code;
                type = "error";
                status = 500;
    
                res.status(status).send({ code: code, message: message, data: data, type: type });
    
                db = null;
                auth = null;
                code = null;
                data = null;
                message = null;
                type = null;
                status = null;
    
                return;
            });
        
            delete user.password;
            delete user.passwordRepeat;

            user.level = level;
            user.created_at = admin.firestore.FieldValue.serverTimestamp();
            user.created_by = uid;
            user.deleted = false;

            //TODO: PONER DESPUES DE CREAR USUARIO SI ES PROFESOR, CREAR UNA COLECCIÓN DE USUARIOS DENTRO DEL USUARIO

            await db.collection("users").doc(result.uid).set(user)
            .then(() => {
                code = "PROCESS_OK";
                message = "Usuario Agregado Safistactoriamente";
                type = "success";
                status = 201;
            })
            .catch(error => {
                code = error.code;
                type = "error";
                status = 400;
            })
            .finally(() => {
                res.status(status).send({ code: code, message: message, data: data, type: type });

                db = null;
                auth = null;
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
            auth = null;
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
        code = "LEVEL_SENT_INVALID";
        message = "El nivel enviado no es valido"; 
        type = "error";
        status = 400;
            
        res.status(status).send({ code: code, message: message, data: data, type: type });

        db = null;
        auth = null;
        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    }
};


/**
 * Metodo que crea administradores dentro del sistema
 * @param {import("express").Request} req Objeto Request
 * @param {import("express").Response} res Objeto Response
 * @returns Mensaje Informativo del Usuario
 */
controllers.createAndRegisterAdmin = async (req, res) => {
    let { uid } = res.locals;
    let { user, logged } = req.body;

    let db = admin.firestore();
    let auth = admin.auth();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (user == null || logged == null)
    {
        code = "DATA_SENT_NULL";
        message = "Asegurate de enviar los datos de forma correcta y completa";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        db = null;
        auth = null;
        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    }

    let run = Decrypt(user.rut);
    run = run.toUpperCase();

    let email = Decrypt(user.email);
    let name = Decrypt(user.name);
    let surname = Decrypt(user.surname);
    let encryptedLevel = user.level;
    let level = Decrypt(user.level);
    let password = Decrypt(user.password);
    let passwordRepeat = Decrypt(user.passwordRepeat);

    if (typeof(run) != "string" || typeof(name) != "string" || typeof(surname) != "string" || typeof(email) != "string" || typeof(level) != "string" || typeof(password) != "string" || typeof(passwordRepeat) != "string")
    {
        code = "BAD_TYPE_PARAMS";
        message = "Los tipos de datos enviados deben ser validos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        db = null;
        auth = null;
        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    }

    if (/^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/.test(email) == false)
    {
        code = "EMAIL_BAD_FORMATED";
        message = "El email debe tener un formato válido";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        db = null;
        auth = null;
        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    }

    if (level == "admin")
    {
        let checkRunExist = await checkExistRun(run);

        if (checkRunExist.exist == true)
        {
            code = checkRunExist.code;
            message = checkRunExist.message; 
            type = "error";
            status = 400;

            res.status(status).send({ code: code, message: message, data: data, type: type });

            db = null;
            auth = null;
            code = null;
            data = null;
            message = null;
            type = null;
            status = null;

            return;
        }

        if (password != passwordRepeat)
        {
            code = "PASSWORDS_DOESNT_MATCH";
            message = "Las contraseñas no coinciden"; 
            type = "error";
            status = 400;

            res.status(400).send({ code: code, message: message, data: data, type: type });

            db = null;
            auth = null;
            code = null;
            data = null;
            message = null;
            type = null;
            status = null;

            return;
        }

        if (logged == true)
        {
            await auth.createUser({
                displayName: `${name} ${surname}`,
                email: email,
                password: password
            })
            .then(async result => {
                await auth.setCustomUserClaims(result.uid, { level: user.level })
                .catch(error => {
                    code = error.code;
                    type = "error";
                    status = 500;
        
                    res.status(status).send({ code: code, message: message, data: data, type: type });
        
                    db = null;
                    auth = null;
                    code = null;
                    data = null;
                    message = null;
                    type = null;
                    status = null;
        
                    return;
                });
            
                delete user.password;
                delete user.passwordRepeat;
    
                user.level = level;
                user.created_at = admin.firestore.FieldValue.serverTimestamp();
                user.created_by = uid;
    
                await db.collection("users").doc(result.uid).set(user)
                .then(() => {
                    code = "PROCESS_OK";
                    message = "Usuario Agregado Safistactoriamente";
                    type = "success";
                    status = 201;
                })
                .catch(error => {
                    code = error.code;
                    type = "error";
                    status = 400;
                })
                .finally(() => {
                    res.status(status).send({ code: code, message: message, data: data, type: type });
    
                    db = null;
                    auth = null;
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
                auth = null;
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
            delete user.password;
            delete user.passwordRepeat;

            user.level = level;
            user.created_at = admin.firestore.FieldValue.serverTimestamp();
            user.created_by = uid;

            await db.collection("users").doc(uid).set(user)
            .then(async () => {
                await auth.setCustomUserClaims(uid, { level: encryptedLevel })
                .catch(error => {
                    code = error.code;
                    type = "error";
                    status = 500;
        
                    res.status(status).send({ code: code, message: message, data: data, type: type });
        
                    db = null;
                    auth = null;
                    code = null;
                    data = null;
                    message = null;
                    type = null;
                    status = null;
        
                    return;
                });

                await auth.updateUser(uid, {
                    displayName: `${name} ${surname}`
                });

                code = "PROCESS_OK";
                message = "Usuario Agregado Satisfactoriamente";
                type = "success";
                status = 201;
            })
            .catch(error => {
                code = error.code;
                type = "error";
                status = 400;
            })
            .finally(() => {
                res.status(status).send({ code: code, message: message, data: data, type: type });

                db = null;
                auth = null;
                code = null;
                data = null;
                message = null;
                type = null;
                status = null;

                return;
            });
        }
    }
    else
    {
        code = "LEVEL_SENT_INVALID";
        message = "El nivel enviado no es valido"; 
        type = "error";
        status = 400;
            
        res.status(status).send({ code: code, message: message, data: data, type: type });

        db = null;
        auth = null;
        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    }
};


/**
 * Metodo para obtener a todos los alumnos del sistema
 * @param {import("express").Request} req Objeto Request
 * @param {import("express").Response} res Objeto Response
 */
controllers.getSystemStudents = async (req, res) => {
    const { filter, filterData } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (filter == null)
    {
        code = "DATA_SENT_NULL";
        message = "Asegurate de enviar los datos de forma correcta y completa";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        db = null;
        auth = null;
        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    }

    if (typeof(filter) != "string")
    {
        code = "BAD_TYPE_PARAMS";
        message = "Los tipos de datos enviados deben ser validos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        db = null;
        auth = null;
        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    }

    if (filter == "true")
    {
        if (filterData == null)
        {
            code = "DATA_SENT_NULL";
            message = "Asegurate de enviar los datos de forma correcta y completa";
            type = "error";
            status = 400;

            res.status(status).send({ code: code, message: message, data: data, type: type });

            db = null;
            auth = null;
            code = null;
            data = null;
            message = null;
            type = null;
            status = null;
        }

        if (filterData.startsWith("U2FsdGVk") == false)
        {
            code = "DATA_SENT_INVALID";
            message = "Asegurate de enviar los datos de forma correcta y completa";
            type = "error";
            status = 400;

            res.status(status).send({ code: code, message: message, data: data, type: type });

            db = null;
            auth = null;
            code = null;
            data = null;
            message = null;
            type = null;
            status = null;
        }

        let dataFilter = Decrypt(filterData);

        if (dataFilter.number == null || dataFilter.grade == null || dataFilter.letter == null)
        {
            code = "DATA_SENT_NULL";
            message = "Asegurate de enviar los datos de forma correcta y completa";
            type = "error";
            status = 400;

            res.status(status).send({ code: code, message: message, data: data, type: type });

            db = null;
            auth = null;
            code = null;
            data = null;
            message = null;
            type = null;
            status = null;
        }

        if (dataFilter.number == "" || dataFilter.grade == "" || dataFilter.letter == "")
        {
            code = "DATA_SENT_INVALID";
            message = "Asegurate de enviar los datos de forma correcta y completa";
            type = "error";
            status = 400;

            res.status(status).send({ code: code, message: message, data: data, type: type });

            db = null;
            auth = null;
            code = null;
            data = null;
            message = null;
            type = null;
            status = null;
        }

        let letterParam = dataFilter.letter.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        let gradeParam = dataFilter.grade.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        let numberParam = dataFilter.number;

        await db.collection("users").where("level", "==", "student").where("assignedToProxie", "==", false).where("number", "==", numberParam).where("letter", "==", letterParam).where("grade", "==", gradeParam).get()
        .then(result => {
            let array = [];

            if (result.size > 0)
            {
                result.forEach(doc => {
                    array.push({
                        id: doc.id,
                        data: doc.data()
                    })
                });

                code = "PROCESS_OK";
                type = "success";
                data = Encrypt(array);
                status = 200;
            }
            else
            {
                code = "STUDENTS_NOT_FOUND";
                message = "No existen usuarios en la plataforma con los datos de filtro proporcionados";
                type = "error";
                status = 404;
            }
        })
        .catch(error => {
            code = error.code;
            type = "error";
            status = 400;
        })
        .finally(() => {
            res.status(status).send({ code: code, message: message, data: data, type: type });

            db = null;
            auth = null;
            code = null;
            data = null;
            message = null;
            type = null;
            status = null;
        });
    }
    else
    {
        await db.collection("users").where("level", "==", "student").where("assignedToProxie", "==", false).get()
        .then(result => {
            let array = [];

            if (result.size > 0)
            {
                result.forEach(doc => {
                    array.push({
                        id: doc.id,
                        data: doc.data()
                    })
                });

                code = "PROCESS_OK";
                type = "success";
                data = Encrypt(array);
                status = 200;
            }
            else
            {
                code = "STUDENTS_NOT_FOUND";
                message = "No existen usuarios en la plataforma";
                type = "error";
                status = 404;
            }
        })
        .catch(error => {
            code = error.code;
            type = "error";
            status = 400;
        })
        .finally(() => {
            res.status(status).send({ code: code, message: message, data: data, type: type });

            db = null;
            auth = null;
            code = null;
            data = null;
            message = null;
            type = null;
            status = null;
        });
    }
};


module.exports = controllers;