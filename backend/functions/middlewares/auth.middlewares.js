// Importaciones
const admin = require("firebase-admin");
const { Decrypt } = require("../helpers/cipher");

// Declaraciones
const middlewares = {};

// Metodos
/**
 * Función para verificar si existe token
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 * @param {import("express").NextFunction} next objeto next
 * @returns mensaje de error o sigue con el programa
 */
middlewares.checkToken = async (req, res, next) => {
    let auth = admin.auth();

    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer '))
    {
        return res.status(401).send({ code: "TOKEN_MISSING", message: "Esta acción necesita de un token de autenticación", type: "error" });
    }

    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer '))
    {
        idToken = req.headers.authorization.split('Bearer ')[1];
    }

    await auth.verifyIdToken(idToken, true)
    .then(token => {
        res.locals.uid = token.uid;
        
        next();
    })
    .catch(error => {
        res.send({ code: "FIREBASE_VERIFY_TOKEN_ERROR", message: error.message, type: "error" });     
    });
};

/**
 * Función para verificar si el usuario es un administrador
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 * @param {import("express").NextFunction} next objeto next
 * @returns mensaje de error o sigue con el programa
 */
middlewares.checkIsAdmin = async (req, res, next) => {
    let auth = admin.auth();
    
    let { uid } = res.locals;

    await auth.getUser(uid)
    .then(user => {
        let level = Decrypt(user.customClaims.level);
        res.locals.level = user.customClaims.level;

        if (level == "admin")
        {
            return next();
        }
                
        return res.send({ code: "ACCESS_DENIED", message: "No tienes privilegios de administrador para esta operación", type: "error" });
    })
    .catch((error) => {
        return res.send({ code: "FIREBASE_GET_USER_ERROR", message: error.message, type: "error" }); 
    });
};

/**
 * Función para verificar si el usuario es un profesor
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 * @param {import("express").NextFunction} next objeto next
 * @returns mensaje de error o sigue con el programa
 */
middlewares.checkIsTeacher = async (req, res, next) => {
    let auth = admin.auth();
    
    let { uid } = res.locals;

    await auth.getUser(uid)
    .then(user => {
        let level = Decrypt(user.customClaims.level);
        res.locals.level = user.customClaims.level;

        if (level == "teacher")
        {
            return next();
        }
                
        return res.send({ code: "ACCESS_DENIED", message: "No tienes privilegios de profesor para esta operación", type: "error" });
    })
    .catch((error) => {
        return res.send({ code: "FIREBASE_GET_USER_ERROR", message: error.message, type: "error" }); 
    });
};

/**
 * Función para verificar si el usuario es un estudiante
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 * @param {import("express").NextFunction} next objeto next
 * @returns mensaje de error o sigue con el programa
 */
middlewares.checkIsStudent = async (req, res, next) => {
    let auth = admin.auth();
    
    let { uid } = res.locals;

    await auth.getUser(uid)
    .then(user => {
        let level = Decrypt(user.customClaims.level);
        res.locals.level = user.customClaims.level;

        if (level == "student")
        {
            return next();
        }
                
        return res.send({ code: "ACCESS_DENIED", message: "No tienes privilegios de estudiante para esta operación", type: "error" });
    })
    .catch((error) => {
        return res.send({ code: "FIREBASE_GET_USER_ERROR", message: error.message, type: "error" }); 
    });
};

/**
 * Función para verificar si el usuario es un apoderado
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 * @param {import("express").NextFunction} next objeto next
 * @returns mensaje de error o sigue con el programa
 */
middlewares.checkIsProxie = async (req, res, next) => {
    let auth = admin.auth();
    
    let { uid } = res.locals;

    await auth.getUser(uid)
    .then(user => {
        let level = Decrypt(user.customClaims.level);
        res.locals.level = user.customClaims.level;

        if (level == "proxie")
        {
            return next();
        }
                
        return res.send({ code: "ACCESS_DENIED", message: "No tienes privilegios de apoderado para esta operación", type: "error" });
    })
    .catch((error) => {
        return res.send({ code: "FIREBASE_GET_USER_ERROR", message: error.message, type: "error" }); 
    });
};


/**
 * Función para verificar si el usuario es un profesor o un estudiante
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 * @param {import("express").NextFunction} next objeto next
 * @returns mensaje de error o sigue con el programa
 */
middlewares.checkIsTeacherStudent = async (req, res, next) => {
    let auth = admin.auth();
    
    let { uid } = res.locals;

    await auth.getUser(uid)
    .then(user => {
        let level = Decrypt(user.customClaims.level);
        res.locals.level = user.customClaims.level;

        if (level == "teacher" || level == "student")
        {
            return next();
        }
                
        return res.send({ code: "ACCESS_DENIED", message: "No tienes los suficientes privilegios para esta operación", type: "error" });
    })
    .catch((error) => {
        return res.send({ code: "FIREBASE_GET_USER_ERROR", message: error.message, type: "error" }); 
    });
};

/**
 * Función para verificar si el usuario es un administrador o un estudiante
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 * @param {import("express").NextFunction} next objeto next
 * @returns mensaje de error o sigue con el programa
 */
 middlewares.checkIsAdminStudent = async (req, res, next) => {
    let auth = admin.auth();
    
    let { uid } = res.locals;

    await auth.getUser(uid)
    .then(user => {
        let level = Decrypt(user.customClaims.level);
        res.locals.level = user.customClaims.level;

        if (level == "admin" || level == "student")
        {
            return next();
        }
                
        return res.send({ code: "ACCESS_DENIED", message: "No tienes los suficientes privilegios para esta operación", type: "error" });
    })
    .catch((error) => {
        return res.send({ code: "FIREBASE_GET_USER_ERROR", message: error.message, type: "error" }); 
    });
};


/**
 * Función para verificar si el usuario es un estudiante o apoderado
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 * @param {import("express").NextFunction} next objeto next
 * @returns mensaje de error o sigue con el programa
 */
middlewares.checkIsStudentProxie = async (req, res, next) => {
    let auth = admin.auth();
    
    let { uid } = res.locals;

    await auth.getUser(uid)
    .then(user => {
        let level = Decrypt(user.customClaims.level);
        res.locals.level = user.customClaims.level;

        if (level == "proxie" || level == "student")
        {
            return next();
        }
                
        return res.send({ code: "ACCESS_DENIED", message: "No tienes los suficientes privilegios para esta operación", type: "error" });
    })
    .catch((error) => {
        return res.send({ code: "FIREBASE_GET_USER_ERROR", message: error.message, type: "error" }); 
    });
};

/**
 * Función para verificar si el usuario es un profesor o un administrador
 * @param {import("express").Request} req objeto request
 * @param {import("express").Response} res objeto response
 * @param {import("express").NextFunction} next objeto next
 * @returns mensaje de error o sigue con el programa
 */
middlewares.checkIsTeacherAdmin = async (req, res, next) => {
    let auth = admin.auth();
    
    let { uid } = res.locals;

    await auth.getUser(uid)
    .then(user => {
        let level = Decrypt(user.customClaims.level);
        res.locals.level = user.customClaims.level;

        if (level == "teacher" || level == "admin")
        {
            return next();
        }
                
        return res.send({ code: "ACCESS_DENIED", message: "No tienes los suficientes privilegios para esta operación", type: "error" });
    })
    .catch((error) => {
        return res.send({ code: "FIREBASE_GET_USER_ERROR", message: error.message, type: "error" }); 
    });
};


module.exports = middlewares;