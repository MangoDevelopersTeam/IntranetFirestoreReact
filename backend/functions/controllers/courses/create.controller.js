// Importación del metodo Decrypt y el admin sdk
const { Decrypt, Encrypt } = require("./../../helpers/cipher");
const admin = require("firebase-admin");
const funcions = require("firebase-functions");

// Objeto controllers que contendra los metodos
const controllers = {};

/**
 * Función para generar un codigo con parametros del curso
 * @param {String} subjectName nombre de la asignatura
 * @param {String} courseGrade grado del curso
 * @param {Number} courseNumber numero del curso
 * @param {String} courseLetter letra del curso
 * @returns codigo generado
 */
const generateCode = (subjectName, courseGrade, courseNumber, courseLetter) => {
    if (courseGrade === "Básica")
    {
        courseGrade = "Basica";
    }

    let gradeIdentifier = `${courseNumber}` + courseLetter + courseGrade;

    let splitSubject = subjectName.split(" ");
                        
    let code = "";

    for (let i = 0; i < splitSubject.length; i++)
    {
        let sliced = "";
        
        if (splitSubject[i].length >= 4)
        {
            sliced = splitSubject[i].slice(0, 4).toLocaleUpperCase();
        }
        else
        {
            sliced = splitSubject[i].toLocaleUpperCase();
        }

        code += sliced;
    }
    
    code = code.concat(gradeIdentifier).toUpperCase();

    return code;
};


/**
 * Función para verificar si existe el curso o no
 * @param {String} subjectName nombre de la asignatura
 * @param {String} courseGrade grado del curso
 * @param {Number} courseNumber numero del curso
 * @param {String} courseLetter letra del curso
 * @returns objeto que contiene paramentros como si existe el curso, si existe errores
 */
const verifyExistCourse = async (subjectName, courseGrade, courseNumber, courseLetter) => {
    let code = generateCode(subjectName, courseGrade, courseNumber, courseLetter);
    let db = admin.firestore();

    let data = {
        exist: false,
        error: false,
        message: "",
        code: ""
    };

    await db.collection("courses").where("code", "==", code).get()
    .then(result => {
        if (result.docs.length <= 0)
        {
            data.code = "PROCESS_OK";
        }
        else
        {
            data.exist = true;
            data.code = "EXISTING_COURSE";
            data.message = `La asignatura ${code} ya existe`;
        }
    })
    .catch((error) => {
        data.code = "FIREBASE_CHECK_CODE_ERROR";
        data.error = true;
        data.message = error.message;
    })
    .finally(() => {
        return data;
    });

    return data;
};


/**
 * Función para crear y registrar una asignatura
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto reponse
 * @returns mensaje informativo al usuario o el data del usuario
 */
controllers.createCourse = async (req, res) => {
    let { course } = req.body;
    let { uid } = res.locals;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (course === null)
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

    let nameSubject = Decrypt(course.courseName);
    let typeSubject = Decrypt(course.type);
    let descriptionSubject = Decrypt(course.description);

    let gradeCourse = Decrypt(course.grade);
    let numberCourse = Decrypt(course.number);
    let letterCourse = Decrypt(course.letter);

    if (typeof(nameSubject) !== "string" || typeof(typeSubject) !== "string" || typeof(descriptionSubject) !== "string" || typeof(gradeCourse) !== "string" || typeof(numberCourse) !== "number" || typeof(letterCourse) !== "string")
    {
        code = "COURSE_PARAMS_INVALID";
        message = "Asegurate de que los datos sean correctos"; 
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

    nameSubject = nameSubject.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    typeSubject = typeSubject.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    gradeCourse = gradeCourse.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

    let verifyCode = await verifyExistCourse(nameSubject, gradeCourse, numberCourse, letterCourse);

    if (verifyCode.exist === true)
    {
        code = verifyCode.code;
        message = verifyCode.message; 
        type = "error";
        status = 200;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        course = null;
        db = null;
        code = null;
        message = null;
        type = null;
        status = null;
    }

    if (verifyCode.error === true)
    {
        code = verifyCode.code;
        message = verifyCode.message; 
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

    let codeCourse = generateCode(nameSubject, gradeCourse, numberCourse, letterCourse);
    
    course.code = codeCourse;
    course.created_at = admin.firestore.FieldValue.serverTimestamp();
    course.created_by = uid;

    course.grade = gradeCourse;
    course.number = numberCourse;
    course.letter = letterCourse; 
    course.type = typeSubject; 

    await db.collection("courses").add(course)
    .catch(() => {
        code = "FIREBASE_CREATE_COURSE_ERROR";
        message = "La asignatura no se ha podido crear";
        type = "error";
        status = 400;
                
        res.status(status).send({ code: code, message: message, data: data, type: type });

        message = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    });

    await db.collection("courses").get()
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
        message = "Asignatura creada exitosamente";
        type = "success";
        data = Encrypt(array);
        status = 201;
    })
    .catch(error => {
        code = "FIREBASE_GET_COURSES_ERROR";
        message = error.message;
        type = "error";
        code = 400;
    })
    .finally(() => {
        res.status(status).jsonp({ code: code, message: message, data: data, type: type });
            
        return;
    });
};


/**
 * Función para establecer a uno o dos docentes dentro de una asignatura
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response 
 */
controllers.setTeachersCourse = async (req, res) => {
    let { uid } = res.locals;
    let { teacher } = req.body;
    let { courseId } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let dataTeacher = Decrypt(teacher);
    let idCourse = Decrypt(courseId);

    let idTeacher = dataTeacher.id;
    let codeCourse = dataTeacher.courseCode;
    let nameCourse = dataTeacher.courseName;
    let typeCourse = dataTeacher.courseType;

    delete dataTeacher.id;
    delete dataTeacher.courseCode;
    delete dataTeacher.courseName;
    delete dataTeacher.courseType;

    dataTeacher.created_at = admin.firestore.FieldValue.serverTimestamp();
    dataTeacher.created_by = uid;

    await db.collection("courses").doc(idCourse).collection("teachers").get()
    .then(async result => {
        if (result.size == 0)
        {
            await db.collection("courses").doc(idCourse).collection("teachers").doc(idTeacher).set(dataTeacher)
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

            await db.collection("users").doc(idTeacher).collection("courses").doc(idCourse).set({
                code: codeCourse,
                name: nameCourse,
                subject: typeCourse,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                created_by: uid
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
        }
        else
        {
            dataTeacher.helper = true;

            await db.collection("courses").doc(idCourse).collection("teachers").doc(idTeacher).set(dataTeacher)
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

            await db.collection("users").doc(idTeacher).collection("courses").doc(idCourse).set({
                code: codeCourse,
                name: nameCourse,
                subject: typeCourse,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                created_by: uid
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
        }

        await db.collection("courses").doc(idCourse).collection("teachers").get()
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
            message = "Profesor asignado correctamente";
            data = Encrypt(array);
            status = 201;
            type = "success";
        })
        .catch(error => {
            code = error.code;
            status = 500;
            type = "error";
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
        return res.status(404).send({ data: error.code });
    });
};


/**
 * Función para establecer a estudiantes dentro de una asignatura
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response 
 */
controllers.setStudentsCourse = async (req, res) => {
    let { uid } = res.locals;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";

    let { student } = req.body;
    let { courseId } = req.query;

    let dataStudent = Decrypt(student);
    let idCourse = Decrypt(courseId);

    let idStudent = dataStudent.id;
    let codeCourse = dataStudent.courseCode;
    let nameCourse = dataStudent.courseName;
    let typeCourse = dataStudent.courseType;

    delete dataStudent.id;
    delete dataStudent.courseCode;
    delete dataStudent.courseName;
    delete dataStudent.courseType;

    dataStudent.created_at = admin.firestore.FieldValue.serverTimestamp();
    dataStudent.created_by = uid;

    await db.collection("courses").doc(idCourse).collection("students").doc(idStudent).set(dataStudent)
    .catch(error => {
        code = "FIREBASE_SET_STUDENT_COURSE_ERROR";
        message = error.message;
        type = "error";

        res.send({ code: code, message: message, data: data, type: type });

        message = null;
        code = null;  
        data = null;
        type = null;
        db = null;
        student = null;
        courseId = null;
        uid = null;

        return;
    });

    await db.collection("users").doc(idStudent).collection("courses").doc(idCourse).set({
        code: codeCourse,
        name: nameCourse,            
        subject: typeCourse,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        created_by: uid
    })
    .catch(error => {
        code = "FIREBASE_SET_USER_COURSE_ERROR";
        message = error.message;
        type = "error";
        
        res.send({ code: code, message: message, data: data, type: type });

        message = null;
        code = null;  
        data = null;
        type = null;
        db = null;
        student = null;
        courseId = null;
        uid = null;

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
        message = "Alumno asignado correctamente"; 
        data = Encrypt(array);
        type = "success";
    })
    .catch(error => {
        code = "FIREBASE_SET_USER_COURSE_ERROR";
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
        student = null;
        courseId = null;
        uid = null;
        
        return;
    });
};


/**
 * Función para agregar unidades al curso en intranet
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response 
 */
controllers.createUnitsCourse = async (req, res) => {
    let { uid } = res.locals;
    let { units } = req.body;
    let { id } = req.query;

    let db = admin.firestore();
    let subjectId = Decrypt(id);
    let unitsArray = Decrypt(units);

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (unitsArray === null)
    {
        code = "UNITS_NULL";
        message = "Asegurese de enviar las unidades correctamente"; 
        type = "info";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        uid = null;
        units = null;
        db = null;
        code = null;
        message = null;
        type = null;
        status = null;
        
        return;
    }

    if (unitsArray.length <= 0)
    {
        code = "UNITS_LENGTH_NULL";
        message = "Asegurese de enviar unidades"; 
        type = "info";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });

        uid = null;
        units = null;
        db = null;
        code = null;
        message = null;
        type = null;
        status = null;
        
        return;
    }

    for (let i = 0; i < unitsArray.length; i++)
    {
        await db.collection("courses").doc(subjectId).collection("units").add({
            numberUnit: unitsArray[i].numberUnit,
            unit: unitsArray[i].unit,
            created_by: uid,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            deleted: false
        });
    }

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
        units = null;
        db = null;
        code = null;            
        message = null;
        type = null;
        status = null;
            
        return;
    });
};


controllers.setFileURL = async (req, res) => {
    let { uid } = res.locals;

    let { objectData } = req.body;
    let { idSubjectParam, idUnitParam } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let object = Decrypt(objectData);
    let idSubject = Decrypt(idSubjectParam);
    let idUnit = Decrypt(idUnitParam);

    if (typeof(idSubject) !== "string" || typeof(idUnit) !== "string")
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

    if (typeof(Decrypt(object.url)) !== "string" || typeof(Decrypt(object.name)) !== "string" || typeof(Decrypt(object.description)) !== "string")
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

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").add({
        url: object.url,
        name: object.name, 
        description: object.description,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        created_by: uid,
    })
    .catch(error => {
        if (error.response)
        {
            code = error.response.message;
            message = error.response.message; 
        }
        else
        {
            code = "ADD_FILE_ERROR";
            message = "Ha ocurrido un error al añadir el archivo en el la unidad"; 
        }

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


    let unitObject = {
        idUnit: null,
        data: []
    };
    unitObject.idUnit = idUnit;

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").get()
    .then(result => {
        let array = [];

        if (result.size > 0)
        {
            result.forEach(doc => {
                array.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
        }

        unitObject.data = array;
        
        code = "PROCESS_OK"; 
        type = "success";
        status = 201;
    })
    .catch(error => {
        if (error.response)
        {
            code = error.response.message;
            message = error.response.message; 
        }
        else
        {
            code = "GET_FILES_UNIT_ERROR";
            message = "Ha ocurrido un error al obtener los archivos de la unidad"; 
        }

        type = "error";
        status = 400;
    })
    .finally(() => {
        res.status(status).send({ code: code, message: message, data: unitObject, type: type });

        uid = null;
        db = null;
        code = null;
        message = null;
        type = null;
        status = null;

        return;
    });
};


controllers.uploadHomeworkFileURL = async (req, res) => {
    let { uid } = res.locals;

    let { objectData } = req.body;
    let { idSubjectParam, idUnitParam } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let object = Decrypt(objectData);
    let idSubject = Decrypt(idSubjectParam);
    let idUnit = Decrypt(idUnitParam);

    if (typeof(idSubject) !== "string" || typeof(idUnit) !== "string")
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

    if (typeof(Decrypt(object.url)) !== "string" || typeof(Decrypt(object.name)) !== "string" || typeof(Decrypt(object.description)) !== "string")
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
    //el object.delayState deberia ser un boolean para identificar si se atraso con la entrega
    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").doc(file).collection('answers').add({
        url: object.url,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        created_by: uid,
        delay:object.delayState
    })
    .catch(error => {
        if (error.response)
        {
            code = error.response.message;
            message = error.response.message; 
        }
        else
        {
            code = "ADD_FILE_ERROR";
            message = "Ha ocurrido un error al añadir el archivo en el la unidad"; 
        }

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


    let unitObject = {
        idUnit: null,
        data: []
    };
    unitObject.idUnit = idUnit;

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").get()
    .then(result => {
        let array = [];

        if (result.size > 0)
        {
            result.forEach(doc => {
                array.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
        }

        unitObject.data = array;
        
        code = "PROCESS_OK"; 
        type = "success";
        status = 201;
    })
    .catch(error => {
        if (error.response)
        {
            code = error.response.message;
            message = error.response.message; 
        }
        else
        {
            code = "GET_FILES_UNIT_ERROR";
            message = "Ha ocurrido un error al obtener los archivos de la unidad"; 
        }

        type = "error";
        status = 400;
    })
    .finally(() => {
        res.status(status).send({ code: code, message: message, data: unitObject, type: type });

        uid = null;
        db = null;
        code = null;
        message = null;
        type = null;
        status = null;

        return;
    });
};


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

    let object = Decrypt(objectData);
    let idSubject = Decrypt(idSubjectParam);
    let idUnit = Decrypt(idUnitParam);

    if (typeof(idSubject) !== "string" || typeof(idUnit) !== "string")
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

    if (typeof(Decrypt(object.url)) !== "string" || typeof(Decrypt(object.name)) !== "string" || typeof(Decrypt(object.description)) !== "string")
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

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").add({
        url: object.url,
        name: object.name, 
        description: object.description,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        created_by: uid,
        type:'homework',
    })
    .catch(error => {
        if (error.response)
        {
            code = error.response.message;
            message = error.response.message; 
        }
        else
        {
            code = "ADD_FILE_ERROR";
            message = "Ha ocurrido un error al añadir el archivo en el la unidad"; 
        }

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


    let unitObject = {
        idUnit: null,
        data: []
    };
    unitObject.idUnit = idUnit;

    await db.collection("courses").doc(idSubject).collection("units").doc(idUnit).collection("files").get()
    .then(result => {
        let array = [];

        if (result.size > 0)
        {
            result.forEach(doc => {
                array.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
        }

        unitObject.data = array;
        
        code = "PROCESS_OK"; 
        type = "success";
        status = 201;
    })
    .catch(error => {
        if (error.response)
        {
            code = error.response.message;
            message = error.response.message; 
        }
        else
        {
            code = "GET_FILES_UNIT_ERROR";
            message = "Ha ocurrido un error al obtener los archivos de la unidad"; 
        }

        type = "error";
        status = 400;
    })
    .finally(() => {
        res.status(status).send({ code: code, message: message, data: unitObject, type: type });

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