// Importaciones
const { Decrypt, Encrypt } = require("./../../helpers/cipher");
const admin = require("firebase-admin");


// Declaraciones
const controllers = {};


// Funciones
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
 * Función para verificar que el run este bien formateado
 * @param {string} run run del usuario
 * @returns booleano de si esta bien o no formateado el un
 */
const checkFormatRun = (run) => {
    // Despejar puntos y guión
    let valor = clean(run);

    // Divide el valor ingresado en dígito verificador y resto del RUN.
    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1).toUpperCase();

    // Separa con un Guión el cuerpo del dígito verificador.
    run = formatRun(run);

    // Si no cumple con el mínimo ej. (n.nnn.nnn)
    if (cuerpo.length < 7) 
    {
        return false;
    }

    // Calcular Dígito Verificador "Método del Módulo 11"
    let suma = 0;
    let multiplo = 2;

    // Para cada dígito del Cuerpo
    for (let i = 1; i <= cuerpo.length; i++)
    {
        // Obtener su Producto con el Múltiplo Correspondiente
        let index = multiplo * valor.charAt(cuerpo.length - i);

        // Sumar al Contador General
        suma = suma + index;

        // Consolidar Múltiplo dentro del rango [2,7]
        if (multiplo < 7) 
        {
            multiplo = multiplo + 1;
        } 
        else 
        {
            multiplo = 2;
        }
    }

    // Calcular Dígito Verificador en base al Módulo 11
    let dvEsperado = 11 - (suma % 11);

    // Casos Especiales (0 y K)
    dv = (dv == "K") ? 10 : dv;
    dv = (dv == 0) ? 11 : dv;

    if (dvEsperado != dv)
    {
        return false;
    } 
    else 
    {
        return true;
    }
};


/**
 * Función que formatea el run
 * @param {string} run run del usuario
 * @returns run formateado
 */
const formatRun = (run) => {
    run = clean(run);

    let result = run.slice(-4, -1) + '-' + run.substr(run.length - 1);

    for (let i = 4; i < run.length; i += 3) 
    {
        result = run.slice(-3 - i, -i) + '.' + result;
    }
  
    return result;
};


/**
 * Función para limpiar el run
 * @param {string} run run del usuario
 * @returns el run con formato limpio
 */
const clean = (run) => {
    return typeof run == "string" ? run.replace(/^0+|[^0-9kK]+/g, '').toUpperCase() : '';
};


// Metodos
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
        let checkRunFormat = checkFormatRun(run);

        if (checkRunFormat == false)
        {
            code = "RUN_BAD_FORMATING";
            message = "El run enviado tiene un mal formato"; 
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

            user.created_at = admin.firestore.FieldValue.serverTimestamp();
            user.created_by = uid;
            user.level = level;    
            user.deleted = false;
            user.uid = result.uid;

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
        let checkRunFormat = checkFormatRun(run);

        if (checkRunFormat == false)
        {
            code = "RUN_BAD_FORMATING";
            message = "El run enviado tiene un mal formato"; 
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
                user.uid = result.uid;
    
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
            user.uid = uid;

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


module.exports = controllers;