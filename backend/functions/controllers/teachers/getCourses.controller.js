const { Decrypt, Encrypt } = require("../../helpers/cipher");
const admin = require("firebase-admin");

const controllers = {};

/**
 * Función para obtener los cursos del profesor que este logueado
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 */
controllers.getUserCourses = async (req, res) => {
    let { uid, level } = res.locals;

    let db = admin.firestore();
    
    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    if (level === null)
    {
        code = "LEVEL_NULL";
        message = "El nivel no debe ser nulo";
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

    if (Decrypt(level) === "student" || Decrypt(level) === "teacher")
    {
        await db.collection("users").doc(uid).collection("courses").get()
        .then(result => {
            if (result.docs.length > 0)
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
                status = 200;
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



controllers.getDetailedCourse = async (req,res)=>{
    let { courseID } = req.query;
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let course = {
        course: null,
        units: null
    }

    await db.collection('courses').doc(courseID).get()
    .then(async (res)=>{
        let courseData = [];

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
        status = 200;

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
    })
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
            
        message = null;
        status = null;
        code = null;  
        data = null;
        type = null;
        db = null;

        return;
    });
};


module.exports = controllers;