// Importaciones
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();

// Controladores
const userCreate = require("./../controllers/users/create.controller");
const userDelete = require("./../controllers/users/delete.controller");
const userAuth = require("./../controllers/users/auth.controller");
const userEdit = require("./../controllers/users/edit.controller");
const userGet = require("./../controllers/users/get.controllers");

const coursesGet = require("./../controllers/courses/get.controller");
const coursesCreate = require("./../controllers/courses/create.controller");
const coursesEdit = require("./../controllers/courses/edit.controller");
const coursesDelete = require("./../controllers/courses/delete.controller");

const authMiddlewares = require("./../middlewares/auth.middlewares");

const teachersGet = require("./../controllers/teachers/getCourses.controller");


// Controlador de Pruebas
const testingController = require("./../controllers/testing/testingController");
const { checkIsTeacher } = require("./../middlewares/auth.middlewares");


// Declaraciones
const app = express();

// Ajustes
app.use(express.json());
app.use(cors({ origin: true, methods: ["GET", "HEAD", "OPTIONS", "PUT", "PATCH", "POST", "DELETE"], allowedHeaders: ["Origin", "Content-Type", "X-Auth-Token", "authorization", "Access-Control-Allow-Origin"] }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// Rutas
// Rutas de Autenticación
app.get("/whoami", [authMiddlewares.checkToken], userCreate.whoami);
app.get("/get-access", [authMiddlewares.checkToken], userAuth.getAccess);


// Rutas de Registro
app.post("/register-user", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], userCreate.createAndRegisterUser);
app.post("/register-admin", [authMiddlewares.checkToken], userCreate.createAndRegisterAdmin);








// Rutas de usuario
app.get("/get-users", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], userGet.getUsers);
app.get("/get-numbers-admin", userGet.getNumbersOfAdmin);

app.get("/filter-region-commune", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], userGet.getUsersByRegionCommune)





// Rutas de curso
app.get("/testing-get-course", coursesGet.getCourses);

app.get("/get-course", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesGet.getCourseById);
app.get("/get-teachers-courses", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesGet.getTeachersCourse);
app.get("/get-students-courses", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherAdmin], coursesGet.getStudentsCourse);

app.get("/get-teachers", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesGet.getTeachers);
app.get("/get-students", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherAdmin], coursesGet.getStudents);

app.post("/create-course", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesCreate.createCourse);

app.post("/set-teachers-course", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesCreate.setTeachersCourse);
app.post("/set-students-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherAdmin], coursesCreate.setStudentsCourse);

app.put("/change-helper-state", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesEdit.editTeacherHelper);

app.delete("/remove-teacher-course", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesDelete.removeTeacherCourse);
app.delete("/remove-student-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherAdmin], coursesDelete.removeStudentCourse);

app.get("/get-units-course", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesGet.getUnitsCourse);
app.post("/post-units-course", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesCreate.createUnitsCourse);
app.put("/edit-unit-course", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesEdit.editUnitCourse);
app.delete("/delete-unit-course", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesDelete.deleteUnitCourse);

app.post("/post-file-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], coursesCreate.setFileURL);
app.get("/get-unit-files", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherStudent], coursesGet.getUnitFiles);


// Rutas del profesor y alumno en general
app.get("/get-user-courses", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherStudent], teachersGet.getUserCourses);
app.get("/get-detailed-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherStudent], teachersGet.getDetailedCourse);
app.get("/get-authorized-access", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherStudent], teachersGet.getAuthorizedAccess);

app.get("/get-teacher-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], teachersGet.getTeacherCourse);
app.get("/get-grades-student-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], teachersGet.getGradesStudentCourse);

app.post("/post-grade-student-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], teachersGet.postGradesStudentCourse);

app.post("/post-annotation-student-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], teachersGet.postAnnotationStudentCourse);
app.get("/get-annotations-student-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], teachersGet.getAnnotationStudentCourse);

// Ruta de prueba
app.get("/test-pagination", testingController.testPagination);


module.exports = app;