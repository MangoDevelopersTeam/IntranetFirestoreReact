const admin = require("firebase-admin");

const { Decrypt, Encrypt } = require("../../helpers/cipher");
const controllers = {};


controllers.getUserCourses = async (req, res) => {
    let { uid, level } = res.locals;

    let db = admin.firestore();
    
    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (level == null)
    {
        code = "LEVEL_NULL";
        message = "El nivel no debe ser nulo";
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

    if (Decrypt(level) == "student" || Decrypt(level) == "teacher")
    {
        await db.collection("users").doc(uid).collection("courses").get()
        .then(result => {
            if (result.size > 0)
            {
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
                status = 200;
            }
            else
            {
                code = "NO_COURSES";
                message = "No existen cursos asignados";
                type = "error";
                status = 404;
            }
        })
        .catch(error => {
            code = "FIREBASE_GET_COURSES_ERROR";
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

            return;
        });
    }
    else
    {
        code = "LEVEL_INVALID";
        message = "El nivel que ha enviado no es el correcto";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }
};


controllers.getDetailedCourse = async (req, res) => {
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
    

       /*  let courseData = [];

        courseData.push({
            id: res.id,
            data: res.data()
        })

        course.course = courseData;
    
        await db.collection('courses').doc(courseID).collection('units').orderBy("numberUnit", "asc").get()
        .then((units)=>{
            let arrai = []

            units.forEach(elem =>{
                arrai.push({
                    id:elem.id,
                    unit:elem.data()
                })
            })

            course.units = arrai;
        })

        //resultado
        code = "PROCESS_OK";
        data = course;
        type = "success";
        status = 200; */

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
};


controllers.getAuthorizedAccess = async (req, res) => {
    let { idCourse } = req.query;
    let { uid } = res.locals;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (idCourse == null || uid == null)
    {
        code = "DATA_SENT_NULL";
        message = "No puede enviar parametros nulos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    let courseId = Decrypt(idCourse);

    if (typeof(courseId) != "string")
    {
        code = "BAD_TYPE_PARAM";
        message = "El parametro del id de la asignatura debe ser valida";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    await db.collection("users").doc(uid).collection("courses").doc(courseId).get()
    .then(result => {
        if (result.exists)
        {
            code = "PROCESS_OK";
            data = true;
            type = "success";
            status = 200;
        }
        else
        {
            code = "NO_ADDED";
            data = false;
            message = "No estas asignado a este curso";
            type = "info";
            status = 200;
        }
    })
    .catch(() => {
        code = "CHECK_ADDED_IN_SUBJECT_ERROR";
        message = "Ha ocurrido un error mientras se verificaba el acceso";
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
};


controllers.getTeacherCourse = async (req, res) => {
    let { idCourse } = req.query;
    let { uid } = res.locals;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (idCourse === null || uid === null)
    {
        code = "DATA_SENT_NULL";
        message = "No puede enviar parametros nulos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    let courseId = Decrypt(idCourse);

    if (typeof(courseId) !== "string")
    {
        code = "BAD_TYPE_PARAM";
        message = "El parametro del id de la asignatura debe ser valida";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    await db.collection("courses").doc(courseId).collection("teachers").doc(uid).get()
    .then(result => {
        let array = [];

        if (result.exists)
        {
            array.push({
                id: result.id,
                data: Encrypt(result.data())
            });
        }
        
        code = "PROCESS_OK";
        data = Encrypt(array);
        type = "success";
        status = 200;    
    })
    .catch(() => {
        code = "GET_TEACHER_ERROR";
        message = "Ha ocurrido un error mientras se obtenia al docente";
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

        return;
    });
};


controllers.getGradesStudentCourse = async (req, res) => {
    let { idCourse, idUser } = req.query;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (idCourse === null || idUser === null)
    {
        code = "DATA_SENT_NULL";
        message = "No puede enviar parametros nulos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    let courseId = Decrypt(idCourse);
    let userId = Decrypt(idUser);

    if (typeof(courseId) !== "string" || typeof(userId) !== "string")
    {
        code = "BAD_TYPE_PARAM";
        message = "El parametro del id de la asignatura debe ser valida";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    await db.collection("courses").doc(courseId).collection("students").doc(userId).collection("grades").get()
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
        
        code = "PROCESS_OK";
        data = Encrypt(array);
        type = "success";
        status = 200;    
    })
    .catch(() => {
        code = "GET_GRADES_ERROR";
        message = "Ha ocurrido un error mientras se obtenia las notas del alumno";
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

        return;
    });
};


controllers.postGradesStudentCourse = async (req, res) => {
    let { idCourse, idUser, idUnit } = req.query;
    let { gradeObject } = req.body;
    let { uid } = res.locals;

    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (idCourse === null || idUser === null || idUnit === null || gradeObject === null)
    {
        code = "DATA_SENT_NULL";
        message = "No puede enviar parametros nulos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    if (idCourse.startsWith("U2FsdGVkX") == false || idUser.startsWith("U2FsdGVkX") == false || idUnit.startsWith("U2FsdGVkX") == false || gradeObject.startsWith("U2FsdGVkX") == false)
    {
        code = "INCORRECT_DATA_SENT";
        message = "Los datos enviados no son correctos, intentelo nuevamente";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    let courseId = Decrypt(idCourse);
    let userId = Decrypt(idUser);
    let unitId = Decrypt(idUnit);
    let objectGrade = Decrypt(gradeObject);

    if (typeof(courseId) != "string" || typeof(userId) != "string" || typeof(unitId) != "string")
    {
        code = "BAD_TYPE_PARAM";
        message = "Los parametros identificadores deben ser validos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    if (typeof(objectGrade.numberUnit) != "number" || typeof(objectGrade.nameUnit) != "string" || typeof(objectGrade.valueGrade) != "number")
    {
        code = "BAD_TYPE_PARAM";
        message = "Los parametros identificadores deben ser validos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }


    if (objectGrade.numberUnit == "" || objectGrade.nameUnit == "")
    {
        code = "PARAMS_EMPTY";
        message = "Los valores enviados no pueden ser vacios";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    if (objectGrade.valueGrade < 10 || objectGrade.valueGrade > 70)
    {
        code = "GRADE_BAD_FORMATING";
        message = "La calificación tiene un mal formato";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    let gradeRef = db.collection("courses").doc(courseId).collection("students").doc(userId).collection("grades").doc(unitId);

    objectGrade.created_at = admin.firestore.FieldValue.serverTimestamp();
    objectGrade.created_by = uid;
    objectGrade.idSubject = courseId;
    objectGrade.idStudent = userId;
    objectGrade.idUnit = unitId;
    objectGrade.idGrade = gradeRef.id;

    await gradeRef.set(objectGrade)
    .catch(error => {
        code = error.code;
        type = "error";
        status = 500;
    });

    await db.collection("courses").doc(courseId).collection("students").doc(userId).collection("grades").get()
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
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    });
};


controllers.postAnnotationStudentCourse = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { annotationData } = req.body;
    let { idUserParam, idSubjectParam } = req.query;
    let { uid } = res.locals;

    if (idUserParam == null || annotationData == null || idSubjectParam == null)
    {
        code = "DATA_SENT_NULL";
        message = "No puede enviar parametros nulos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    if (idUserParam.startsWith("U2FsdGVkX") == false || annotationData.startsWith("U2FsdGVkX") == false || idSubjectParam.startsWith("U2FsdGVkX") == false)
    {
        code = "INCORRECT_DATA_SENT";
        message = "Los datos enviados no son correctos, intentelo nuevamente";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    let userId = Decrypt(idUserParam);
    let subjectId = Decrypt(idSubjectParam);
    let annotationObject = Decrypt(annotationData);

    if (annotationObject.idSubject == null || annotationObject.type == null || annotationObject.description == null)
    {
        code = "ANNOTATION_DATA_SENT_NULL";
        message = "No puede enviar parametros nulos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    if (annotationObject.description.startsWith("U2FsdGVkX") == false)
    {
        code = "INCORRECT_DATA_SENT";
        message = "Los datos enviados no son correctos, intentelo nuevamente";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    if (typeof(userId) != "string" || typeof(subjectId) != "string" || typeof(annotationObject.idSubject) != "string" || typeof(annotationObject.type) != "string" || typeof(Decrypt(annotationObject.description)) != "string")
    {
        code = "BAD_TYPE_PARAM";
        message = "Los parametros identificadores deben ser validos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    if (annotationObject.type == "" || Decrypt(annotationObject.description) == "" || annotationObject.idSubject == "")
    {
        code = "PARAMS_EMPTY";
        message = "Los valores enviados no pueden ser vacios";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    let annotationRef = db.collection("users").doc(userId).collection("annotations").doc();

    annotationObject.created_at = admin.firestore.FieldValue.serverTimestamp();
    annotationObject.created_by = uid;
    annotationObject.idUser = userId;
    annotationObject.idSubject = subjectId;
    annotationObject.id = annotationRef.id;

    await annotationRef.set(annotationObject)
    .catch(error => {
        code = error.code;
        type = "error";
        status = 500;
    });

    await db.collection("users").doc(userId).collection("annotations").where("idSubject", "==", subjectId).get()
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
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    });
};


controllers.getAnnotationStudentCourse = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { idUserParam, idSubjectParam } = req.query;

    if (idUserParam == null || idSubjectParam == null)
    {
        code = "DATA_SENT_NULL";
        message = "No puede enviar parametros nulos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    if (idUserParam.startsWith("U2FsdGVkX") == false || idSubjectParam.startsWith("U2FsdGVkX") == false)
    {
        code = "INCORRECT_DATA_SENT";
        message = "Los datos enviados no son correctos, intentelo nuevamente";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    let userId = Decrypt(idUserParam);
    let subjectId = Decrypt(idSubjectParam);

    if (typeof(userId) != "string" || typeof(subjectId) != "string")
    {
        code = "BAD_TYPE_PARAM";
        message = "Los parametros identificadores deben ser validos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    if (userId == "" || subjectId == "")
    {
        code = "PARAMS_EMPTY";
        message = "Los valores enviados no pueden ser vacios";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    await db.collection("users").doc(userId).collection("annotations").where("idSubject", "==", subjectId).get()
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
        
        code = "PROCESS_OK";
        data = Encrypt(array);
        type = "success";
        status = 200;    
    })
    .catch(() => {
        code = "GET_ANNOTATIONS_ERROR";
        message = "Ha ocurrido un error mientras se obtenia las anotaciones del alumno";
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

        return;
    });
};


controllers.putAnnotationStudentCourse = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { annotationData } = req.body;
    let { idUserParam, idAnnotationParam, idSubjectParam } = req.query;
    let { uid } = res.locals;

    if (idUserParam == null || idAnnotationParam == null || annotationData == null || idSubjectParam == null)
    {
        code = "DATA_SENT_NULL";
        message = "No puede enviar parametros nulos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    if (idUserParam.startsWith("U2FsdGVkX") == false || idAnnotationParam.startsWith("U2FsdGVkX") == false || annotationData.startsWith("U2FsdGVkX") == false || idSubjectParam.startsWith("U2FsdGVkX") == false)
    {
        code = "INCORRECT_DATA_SENT";
        message = "Los datos enviados no son correctos, intentelo nuevamente";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    let userId = Decrypt(idUserParam);
    let subjectId = Decrypt(idSubjectParam);
    let annotationId = Decrypt(idAnnotationParam);
    let annotationObject = Decrypt(annotationData);

    if (annotationObject.idSubject == null || annotationObject.type == null || annotationObject.description == null)
    {
        code = "ANNOTATION_DATA_SENT_NULL";
        message = "No puede enviar parametros nulos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    if (annotationObject.description.startsWith("U2FsdGVkX") == false)
    {
        code = "INCORRECT_DATA_SENT";
        message = "Los datos enviados no son correctos, intentelo nuevamente";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    if (typeof(userId) != "string" || typeof(subjectId) != "string" || typeof(annotationId) != "string" || typeof(annotationObject.idSubject) != "string" || typeof(annotationObject.type) != "string" || typeof(Decrypt(annotationObject.description)) != "string")
    {
        code = "BAD_TYPE_PARAM";
        message = "Los parametros identificadores deben ser validos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    if (annotationObject.type == "" || Decrypt(annotationObject.description) == "" || annotationObject.idSubject == "" || userId == "" || annotationId == "")
    {
        code = "PARAMS_EMPTY";
        message = "Los valores enviados no pueden ser vacios";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    annotationObject.updated_at = admin.firestore.FieldValue.serverTimestamp();
    annotationObject.updated_by = uid;


    await db.collection("users").doc(userId).collection("annotations").doc(annotationId).update(annotationObject)
    .catch(error => {
        code = error.code;
        type = "error";
        status = 500;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    });

    await db.collection("users").doc(userId).collection("annotations").where("idSubject", "==", subjectId).get()
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
        
        code = "PROCESS_OK";
        data = Encrypt(array);
        type = "success";
        status = 200;    
    })
    .catch(error => {
        code = error.code
        type = "error";
        status = 500;
    })
    .finally(() => {
        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    });
};


controllers.deleteAnnotationStudentCourse = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { idUserParam, idAnnotationParam, idSubjectParam } = req.query;


    if (idUserParam == null || idAnnotationParam == null || idSubjectParam == null)
    {
        code = "DATA_SENT_NULL";
        message = "No puede enviar parametros nulos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    if (idUserParam.startsWith("U2FsdGVkX") == false || idAnnotationParam.startsWith("U2FsdGVkX") == false || idSubjectParam.startsWith("U2FsdGVkX") == false)
    {
        code = "INCORRECT_DATA_SENT";
        message = "Los datos enviados no son correctos, intentelo nuevamente";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    let userId = Decrypt(idUserParam);
    let subjectId = Decrypt(idSubjectParam);
    let annotationId = Decrypt(idAnnotationParam);

    if (typeof(userId) != "string" || typeof(subjectId) != "string" || typeof(annotationId) != "string")
    {
        code = "BAD_TYPE_PARAM";
        message = "Los parametros identificadores deben ser validos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    if (userId == "" || annotationId == "" || subjectId == "")
    {
        code = "PARAMS_EMPTY";
        message = "Los valores enviados no pueden ser vacios";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    await db.collection("users").doc(userId).collection("annotations").doc(annotationId).delete()
    .catch(error => {
        code = error.code;
        type = "error";
        status = 500;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    });

    await db.collection("users").doc(userId).collection("annotations").where("idSubject", "==", subjectId).get()
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
        
        code = "PROCESS_OK";
        data = Encrypt(array);
        type = "success";
        status = 200;    
    })
    .catch(error => {
        code = error.code
        type = "error";
        status = 500;
    })
    .finally(() => {
        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    });
};


controllers.getAnnotationsByTypeStudentCourse = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let { idUserParam, typeAnnotationParam } = req.query;

    if (idUserParam == null || typeAnnotationParam == null)
    {
        code = "DATA_SENT_NULL";
        message = "No puede enviar parametros nulos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    if (idUserParam.startsWith("U2FsdGVkX") == false || typeAnnotationParam.startsWith("U2FsdGVkX") == false)
    {
        code = "INCORRECT_DATA_SENT";
        message = "Los datos enviados no son correctos, intentelo nuevamente";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    let userId = Decrypt(idUserParam);
    let annotationType = Decrypt(typeAnnotationParam);

    if (typeof(userId) != "string" || typeof(annotationType) != "string")
    {
        code = "BAD_TYPE_PARAM";
        message = "Los parametros identificadores deben ser validos";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    if (userId == "" || annotationType == "")
    {
        code = "PARAMS_EMPTY";
        message = "Los valores enviados no pueden ser vacios";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }

    if (annotationType == "positive" || annotationType == "negative" || annotationType == "observation")
    {
        await db.collection("users").doc(userId).collection("annotations").where("type", "==", annotationType).get()
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
                
            message = null;
            status = null;
            code = null;  
            data = null;
            type = null;
            db = null;

            return;
        });
    }
    else
    {
        code = "BAD_TYPE_ANNOTATION";
        message = "El parametro de tipo de anotación debe ser valido";
        type = "error";
        status = 400;

        res.status(status).send({ code: code, message: message, data: data, type: type });
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    }
};


module.exports = controllers;