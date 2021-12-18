// Importaciones
const { Decrypt, Encrypt } = require("./../../helpers/cipher");
const admin = require("firebase-admin");

// Declaraciones
const controllers = {};

// Metodos
/**
 * Función para obtener las preguntas del foro
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 * @returns retorna un mensaje erroneo o la colección de preguntas
 */
controllers.getQuestionsForum = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let data = null;
    let message = "";
    let type = "";
    let status = 0;

    let array = [];
    let arrayStudents = [];

    let { uid } = res.locals;

    if (uid == null)
    {
        code = "UID_NULL";
        message = "Asegurese de enviar los datos no nulos"; 
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

    if (typeof(uid) != "string")
    {
        code = "BAD_TYPE_UID_VALUE";
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

    await db.collection("users").where("level", "==", "student").where("deleted", "==", false).get()
    .then(result => {
        if (result.size > 0)
        {
            result.docs.forEach(doc => {
                arrayStudents.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
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

        return;
    });

    await db.collection("questions").get()
    .then(result => {
        if (result.size > 0)
        {
            if (arrayStudents.length > 0)
            {
                result.docs.forEach(doc => {
                    let filter = arrayStudents.filter(x => x.id === doc.data().created_by);

                    if (filter.length > 0)
                    {
                        array.push({
                            id: doc.id,
                            uid: uid,
                            data: {
                                idQuestion: doc.data().idQuestion,
                                question: doc.data().question,
                                description: doc.data().description,
                                theme: doc.data().theme,
                                created_at: doc.data().created_at,
                                created_by: doc.data().created_by,
                                name: filter[0].data.name,
                                surname: filter[0].data.surname
                            }
                        });
                    }
                });

                code = "PROCESS_OK";
                data = Encrypt(array);
                type = "success";
                status = 200;
            }
            else
            {
                result.docs.forEach(doc => {
                    array.push({
                        id: doc.id,
                        uid: uid,
                        data: doc.data()
                    });
                });

                code = "PROCESS_OK";
                data = Encrypt(array);
                type = "success";
                status = 200;
            } 
        }
        else
        {
            code = "NO_QUESTIONS_FORUM";
            message = "No existen preguntas en el foro";
            type = "error";
            status = 404;
        }
    })
    .catch(error => {
        code = error.code;
        message = "No existen preguntas en el foro";
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

controllers.getDetailedQuestion = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let type = "";
    let status = 0;
    let data = null;
    let message = "";

    let array = [];
    let arrayStudents = [];

    let { questionIdParam } = req.query;

    if (questionIdParam == null)
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

    if (questionIdParam.startsWith("U2FsdGVkX") == false)
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

    let questionId = Decrypt(questionIdParam);

    if (typeof(questionId) != "string")
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

    if (questionId == "")
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

    await db.collection("users").where("level", "==", "student").where("deleted", "==", false).get()
    .then(result => {
        if (result.size > 0)
        {
            result.docs.forEach(doc => {
                arrayStudents.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
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

        return;
    });

    await db.collection("questions").doc(questionId).get()
    .then(result => {
        let filter = arrayStudents.filter(x => x.id === result.data().created_by);

        if (filter.length > 0)
        {
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
                code = "QUESTION_NOT_FOUND";
                message = "La pregunta no ha sido encontrada, verifique el idenfificador e intetelo nuevamente";
                type = "error";
                status = 404;
            }
        }
        else
        {
            code = "QUESTION_NOT_FOUND";
            message = "La pregunta no ha sido encontrada, verifique el idenfificador e intetelo nuevamente";
            type = "error";
            status = 404;
        }
    })
    .catch(error => {
        code = error.code;
        type = "error";
        status = 404;
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

controllers.getRateQuestion = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let type = "";
    let status = 0;
    let data = null;
    let message = "";

    let array = [];

    let { questionIdParam, rateParam } = req.query;
    let { uid } = res.locals;

    if (questionIdParam == null || rateParam == null || uid == null)
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

    if (questionIdParam.startsWith("U2FsdGVkX") == false || rateParam.startsWith("U2FsdGVkX") == false)
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

    let questionId = Decrypt(questionIdParam);
    let rate = Decrypt(rateParam);

    if (typeof(questionId) != "string" || typeof(rate) != "string" || typeof(uid) != "string")
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

    if (questionId == "" || rate == "" || uid == "")
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

    await db.collection("questions").doc(questionId).collection("rate").get()
    .then(result => {
        if (result.size > 0)
        {
            let likedCount = result.docs.filter(x => x.data().liked == true);
            let dislikedCount = result.docs.filter(x => x.data().disliked == true);

            if (rate != "admin")
            {
                let userRate = result.docs.find(x => x.id == uid);

                array.push({
                    likedCount: likedCount.length,
                    dislikedCount: dislikedCount.length,
                    userRate: {
                        id: userRate.id,
                        data: userRate.data()
                    }
                });
            }
            else
            {
                array.push({
                    likedCount: likedCount.length,
                    dislikedCount: dislikedCount.length,
                });
            }         

            code = "PROCESS_OK";
            data = Encrypt(array);
            type = "success";
            status = 200;
        }
        else
        {
            code = "NO_RATES_QUESTION";
            type = "success";
            status = 200;
        }
    })
    .catch(error => {
        code = error.code;
        type = "error";
        status = 404;
    })
    .finally(() => {
        res.status(status).send({ code: code, message: message, data: data, type: type });

        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    });
};

controllers.getCommentsQuestion = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let type = "";
    let status = 0;
    let data = null;
    let message = "";

    let array = [];
    let arrayStudents = [];

    let { questionIdParam } = req.query;
    let { uid } = res.locals;

    if (questionIdParam == null || uid == null)
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

    if (questionIdParam.startsWith("U2FsdGVkX") == false)
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

    let questionId = Decrypt(questionIdParam);

    if (typeof(questionId) != "string" || typeof(uid) != "string")
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

    if (questionId == "" || questionId == " " || uid == "")
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

    await db.collection("users").where("level", "==", "student").where("deleted", "==", false).get()
    .then(result => {
        if (result.size > 0)
        {
            result.docs.forEach(doc => {
                arrayStudents.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
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

        return;
    });

    await db.collection("questions").doc(questionId).collection("comments").get()
    .then(result => {
        if (result.size > 0)
        {
            result.docs.forEach(doc => {
                let filter = arrayStudents.filter(x => x.id === doc.data().created_by);

                if (filter.length > 0)
                {
                    array.push({
                        id: doc.id,
                        uid: uid,
                        data: {
                            comment: doc.data().comment,
                            idComment: doc.data().idComment,
                            idQuestion: doc.data().idQuestion,
                            created_at: doc.data().created_at,
                            created_by: doc.data().created_by,
                            name: filter[0].data.name,
                            surname: filter[0].data.surname
                        }
                    });
                }
            });

            code = "PROCESS_OK";
            data = Encrypt(array);
            type = "success";
            status = 200;
        }
        else
        {
            code = "NO_COMMENTS_QUESTION";
            type = "error";
            status = 404;
        }
    })
    .catch(error => {
        code = error.code;
        type = "error";
        status = 404;
    })
    .finally(() => {
        res.status(status).send({ code: code, message: message, data: data, type: type });

        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    });
};



controllers.getAnswersQuestion = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let type = "";
    let status = 0;
    let data = null;
    let message = "";

    let array = [];
    let arrayStudents = [];

    let { questionIdParam } = req.query;
    let { uid } = res.locals;

    if (questionIdParam == null || uid == null)
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

    if (questionIdParam.startsWith("U2FsdGVkX") == false)
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

    let questionId = Decrypt(questionIdParam);

    if (typeof(questionId) != "string" || typeof(uid) != "string")
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

    if (questionId == "" || questionId == " " || uid == "")
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

    await db.collection("users").where("level", "==", "student").where("deleted", "==", false).get()
    .then(result => {
        if (result.size > 0)
        {
            result.docs.forEach(doc => {
                arrayStudents.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
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

        return;
    });

    await db.collection("questions").doc(questionId).collection("answers").get()
    .then(result => {
        if (result.size > 0)
        {
            result.docs.forEach(doc => {
                let filter = arrayStudents.filter(x => x.id === doc.data().created_by);

                if (filter.length > 0)
                {
                    array.push({
                        id: doc.id,
                        uid: uid,
                        data: {
                            answer: doc.data().answer,
                            idAnswer: doc.data().idAnswer,
                            idQuestion: doc.data().idQuestion,
                            created_at: doc.data().created_at,
                            created_by: doc.data().created_by,
                            name: filter[0].data.name,
                            surname: filter[0].data.surname
                        }
                    });
                }
            });

            code = "PROCESS_OK";
            data = Encrypt(array);
            type = "success";
            status = 200;
        }
        else
        {
            code = "NO_ANSWERS_QUESTION";
            type = "error";
            status = 404;
        }
    })
    .catch(error => {
        code = error.code;
        type = "error";
        status = 404;
    })
    .finally(() => {
        res.status(status).send({ code: code, message: message, data: data, type: type });

        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    });
};

controllers.getRateAnswer = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let type = "";
    let status = 0;
    let data = null;
    let message = "";

    let array = [];

    let { questionIdParam, answerIdParam, rateParam } = req.query;
    let { uid } = res.locals;

    if (questionIdParam == null || answerIdParam == null || rateParam == null || uid == null)
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

    if (questionIdParam.startsWith("U2FsdGVkX") == false || answerIdParam.startsWith("U2FsdGVkX") == false || rateParam.startsWith("U2FsdGVkX") == false)
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

    let questionId = Decrypt(questionIdParam);
    let answerId = Decrypt(answerIdParam);
    let rate = Decrypt(rateParam);

    if (typeof(questionId) != "string" || typeof(answerId) != "string" || typeof(rate) != "string" || typeof(uid) != "string")
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

    if (questionId == "" || answerId == ""  || rate == "" || uid == "")
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

    await db.collection("questions").doc(questionId).collection("answers").doc(answerId).collection("rate").get()
    .then(result => {
        if (result.size > 0)
        {
            let likedCount = result.docs.filter(x => x.data().liked == true);
            let dislikedCount = result.docs.filter(x => x.data().disliked == true);

            if (rate != "admin")
            {
                let userRate = result.docs.find(x => x.id == uid);

                array.push({
                    likedCount: likedCount.length,
                    dislikedCount: dislikedCount.length,
                    userRate: {
                        id: userRate.id,
                        data: userRate.data()
                    }
                });
            }
            else
            {
                array.push({
                    likedCount: likedCount.length,
                    dislikedCount: dislikedCount.length,
                });
            }         

            code = "PROCESS_OK";
            data = Encrypt(array);
            type = "success";
            status = 200;
        }
        else
        {
            code = "NO_RATES_ANSWER";
            type = "success";
            status = 200;
        }
    })
    .catch(error => {
        code = error.code;
        type = "error";
        status = 404;
    })
    .finally(() => {
        res.status(status).send({ code: code, message: message, data: data, type: type });

        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    });
};

controllers.getCommentsAnswer = async (req, res) => {
    let db = admin.firestore();

    let code = "";
    let type = "";
    let status = 0;
    let data = null;
    let message = "";

    let array = [];
    let arrayStudents = [];

    let { questionIdParam, answerIdParam } = req.query;
    let { uid } = res.locals;

    if (questionIdParam == null || answerIdParam == null || uid == null)
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

    if (questionIdParam.startsWith("U2FsdGVkX") == false || answerIdParam.startsWith("U2FsdGVkX") == false)
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

    let questionId = Decrypt(questionIdParam);
    let answerId = Decrypt(answerIdParam);

    if (typeof(questionId) != "string" || typeof(answerId) != "string" || typeof(uid) != "string")
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

    if (questionId == "" || answerId == "" || uid == "")
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

    await db.collection("users").where("level", "==", "student").where("deleted", "==", false).get()
    .then(result => {
        if (result.size > 0)
        {
            result.docs.forEach(doc => {
                arrayStudents.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
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

        return;
    });

    await db.collection("questions").doc(questionId).collection("answers").doc(answerId).collection("comments").get()
    .then(result => {
        if (result.size > 0)
        {
            result.docs.forEach(doc => {
                let filter = arrayStudents.filter(x => x.id === doc.data().created_by);

                if (filter.length > 0)
                {
                    array.push({
                        id: doc.id,
                        uid: uid,
                        data: {
                            comment: doc.data().comment,
                            idComment: doc.data().idComment,
                            idQuestion: doc.data().idQuestion,
                            created_at: doc.data().created_at,
                            created_by: doc.data().created_by,
                            name: filter[0].data.name,
                            surname: filter[0].data.surname
                        }
                    });
                }
            });

            code = "PROCESS_OK";
            data = Encrypt(array);
            type = "success";
            status = 200;
        }
        else
        {
            code = "NO_COMMENTS_ANSWER";
            type = "error";
            status = 404;
        }
    })
    .catch(error => {
        code = error.code;
        type = "error";
        status = 404;
    })
    .finally(() => {
        res.status(status).send({ code: code, message: message, data: data, type: type });

        code = null;
        data = null;
        message = null;
        type = null;
        status = null;

        return;
    });
};

module.exports = controllers;