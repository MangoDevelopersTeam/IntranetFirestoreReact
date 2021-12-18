// Importaciones
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// Inicializaciones
admin.initializeApp();

// Metodos
const userGet = require("./../controllers/users/get.controllers");
const userPost = require("./../controllers/users/post.controller");
const userPut = require("./../controllers/users/put.controller");
const userDelete = require("./../controllers/users/delete.controller");

const coursesGet = require("./../controllers/courses/get.controller");
const coursesPost = require("./../controllers/courses/create.controller");
const coursesPut = require("./../controllers/courses/edit.controller");
const coursesDelete = require("./../controllers/courses/delete.controller");

const homeworkGet = require("./../controllers/homework/get.controller");
const homeworkPost = require("./../controllers/homework/post.controller");
const homeworkPut = require("./../controllers/homework/put.controller");
const homeworkDelete = require("./../controllers/homework/delete.controller");

const forumGet = require("./../controllers/forum/get.controller");
const forumPost = require("./../controllers/forum/post.controller");
const forumPut = require("./../controllers/forum/put.controller");
const forumDelete = require("./../controllers/forum/delete.controller");

const proxieGet = require("./../controllers/proxie/get.controller");
const proxiePost = require("./../controllers/proxie/post.controller");
const proxiePut = require("./../controllers/proxie/put.controller");
const proxieDelete = require("./../controllers/proxie/delete.controller");

const teachersGet = require("./../controllers/teachers/getCourses.controller");
const studentsGet = require("./../controllers/students/getStudentDataController");


// Metodos de prueba
const testingController = require("./../controllers/testing/testingController");


// Middlewares
const authMiddlewares = require("./../middlewares/auth.middlewares");


// Declaraciones
const app = express();



// Ajustes
app.use(express.json());
app.use(cors({ origin: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
});



// Rutas
// Rutas de Autenticación
app.get("/whoami", authMiddlewares.checkToken, userGet.whoami);
app.get("/get-access", authMiddlewares.checkToken, userGet.getAccess);



// Rutas de Registro de usuarios
app.post("/register-user", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], userPost.createAndRegisterUser);
app.post("/register-admin", [authMiddlewares.checkToken], userPost.createAndRegisterAdmin);



// Rutas de usuario
app.get("/get-users", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], userGet.getUsers);
app.get("/get-numbers-admin", userGet.getNumbersOfAdmin);
app.get("/get-system-students", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], userGet.getSystemStudents);
app.get("/filter-region-commune", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], userGet.getUsersByRegionCommune)



// Rutas de curso
app.get("/get-course", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesGet.getCourseById);
app.get("/testing-get-course", [authMiddlewares.checkToken], coursesGet.getCourses);
app.get("/get-teachers-courses", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesGet.getTeachersCourse);
app.get("/get-students-courses", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherAdmin], coursesGet.getStudentsCourse);

app.get("/get-teachers", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesGet.getTeachers);
app.get("/get-students", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherAdmin], coursesGet.getStudents);

app.post("/create-course", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesPost.createCourse);
app.post("/set-teachers-course", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesPost.setTeachersCourse);
app.post("/set-students-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherAdmin], coursesPost.setStudentsCourse);

app.put("/change-helper-state", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesPut.editTeacherHelper);

app.delete("/remove-teacher-course", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesDelete.removeTeacherCourse);
app.delete("/remove-student-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherAdmin], coursesDelete.removeStudentCourse);



// Rutas de unidades de curso
app.get("/get-units-course", [authMiddlewares.checkToken], coursesGet.getUnitsCourse);
app.post("/post-units-course", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesPost.createUnitsCourse);
app.put("/edit-unit-course", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesPut.editUnitCourse);
app.delete("/delete-unit-course", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], coursesDelete.deleteUnitCourse);



// Rutas de archivos en unidades de curso
app.post("/post-file-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], coursesPost.setFileURL);
app.get("/get-unit-files", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherStudent], coursesGet.getUnitFiles);
app.delete("/delete-unit-file", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], coursesGet.deleteUnitFile);
app.put("/edit-unit-file", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], coursesGet.editUnitFile);



// Rutas del profesor y alumno en general
app.get("/get-user-courses", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherStudent], teachersGet.getUserCourses);
app.get("/get-detailed-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherStudent], teachersGet.getDetailedCourse);
app.get("/get-authorized-access", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherStudent], teachersGet.getAuthorizedAccess);

app.get("/get-annotations-student-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherStudent], teachersGet.getAnnotationStudentCourse);
app.get("/get-annotations-by-type-student-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherStudent], teachersGet.getAnnotationsByTypeStudentCourse);

app.get("/get-teacher-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], teachersGet.getTeacherCourse);
app.get("/get-grades-student-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], teachersGet.getGradesStudentCourse);

app.post("/post-grade-student-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], teachersGet.postGradesStudentCourse);
app.post("/post-annotation-student-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], teachersGet.postAnnotationStudentCourse);

app.put("/put-annotation-student-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], teachersGet.putAnnotationStudentCourse);

app.delete("/delete-annotation-student-course", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], teachersGet.deleteAnnotationStudentCourse);



// Ruta de alumnos y apoderados
app.get("/get-my-grades-student", [authMiddlewares.checkToken, authMiddlewares.checkIsStudentProxie], studentsGet.getStudentGrades);
app.get("/get-my-annotations-student", [authMiddlewares.checkToken, authMiddlewares.checkIsStudentProxie], studentsGet.getStudentAnnotations);
app.get("/get-user-info", authMiddlewares.checkToken, studentsGet.getUserInfo);
app.get("/get-homework-info", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherStudent], coursesGet.ObtenerTarea);
app.get("/get-students-homework", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], homeworkGet.getStudentsWithHomework);
app.get("/get-student-feedback", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherStudent], homeworkGet.getStudentFeedback);
app.get("/get-student-answer-information", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacherStudent], homeworkGet.getStudentAnswerInformation);

app.post("/post-teacher-homework", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], homeworkPost.setHomeworkFileURL);
app.post("/post-student-homework", [authMiddlewares.checkToken, authMiddlewares.checkIsStudent], homeworkPost.postStudentHomework);
app.post("/post-teacher-feedback", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], homeworkPost.postFeedback);

app.put("/update-student-feedback", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], homeworkPut.updateFeedback);

app.delete("/delete-student-homework", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], homeworkDelete.deleteHomework);
app.delete("/delete-student-feedback", [authMiddlewares.checkToken, authMiddlewares.checkIsTeacher], homeworkDelete.deleteFeedback);



// Ruta de foro
// Ruta de foro => Pregunta
app.get("/get-questions-forum", [authMiddlewares.checkToken, authMiddlewares.checkIsAdminStudent], forumGet.getQuestionsForum);
app.get("/get-detailed-question", [authMiddlewares.checkToken, authMiddlewares.checkIsAdminStudent], forumGet.getDetailedQuestion);
app.get("/get-question-rate", [authMiddlewares.checkToken, authMiddlewares.checkIsAdminStudent], forumGet.getRateQuestion);
app.get("/get-question-comments", [authMiddlewares.checkToken, authMiddlewares.checkIsAdminStudent], forumGet.getCommentsQuestion);

app.post("/post-question-forum", [authMiddlewares.checkToken, authMiddlewares.checkIsStudent], forumPost.postQuestionForum);
app.post("/post-like-question", [authMiddlewares.checkToken, authMiddlewares.checkIsStudent], forumPost.postLikeQuestion);
app.post("/post-dislike-question", [authMiddlewares.checkToken, authMiddlewares.checkIsStudent], forumPost.postDislikeQuestion);
app.post("/post-question-comment", [authMiddlewares.checkToken, authMiddlewares.checkIsStudent], forumPost.postQuestionComment);

app.put("/put-question-comment", [authMiddlewares.checkToken, authMiddlewares.checkIsStudent], forumPut.putQuestionComment);
app.delete("/delete-question-comment", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], forumDelete.deleteQuestionComment);


// Ruta de foro => Respuesta
app.get("/get-question-answers", [authMiddlewares.checkToken, authMiddlewares.checkIsAdminStudent], forumGet.getAnswersQuestion);
app.get("/get-answer-rate", [authMiddlewares.checkToken, authMiddlewares.checkIsAdminStudent], forumGet.getRateAnswer);
app.get("/get-answer-comments", [authMiddlewares.checkToken, authMiddlewares.checkIsAdminStudent], forumGet.getCommentsAnswer);

app.post("/post-question-answer", [authMiddlewares.checkToken, authMiddlewares.checkIsStudent], forumPost.postQuestionAnswer);
app.post("/post-like-answer", [authMiddlewares.checkToken, authMiddlewares.checkIsStudent], forumPost.postLikeAnswer);
app.post("/post-dislike-answer", [authMiddlewares.checkToken, authMiddlewares.checkIsStudent], forumPost.postDislikeAnswer);
app.post("/post-answer-comment", [authMiddlewares.checkToken, authMiddlewares.checkIsStudent], forumPost.postAnswerComment);

app.put("/put-answer-comment", [authMiddlewares.checkToken, authMiddlewares.checkIsStudent], forumPut.putAnswerComment);
app.delete("/delete-answer-comment", [authMiddlewares.checkToken, authMiddlewares.checkIsAdmin], forumDelete.deleteAnswerComment);



// Ruta de apoderado
app.get("/get-my-students-proxie", [authMiddlewares.checkToken, authMiddlewares.checkIsProxie], proxieGet.getStudentsProxie);
app.get("/get-student-assignation", [authMiddlewares.checkToken, authMiddlewares.checkIsProxie], proxieGet.getCheckStudentAssignation);
app.get("/get-my-students-subjects", [authMiddlewares.checkToken, authMiddlewares.checkIsProxie], proxieGet.getStudentSubjects);



// Ruta de prueba
app.get("/test-pagination", testingController.testPagination);
app.get("/testing-route-service", (req, res) => {
    cors()(req, res, async () => {
        await admin.firestore().collection("courses").get()
        .then(response => {
            let array = [];

            if (response.size > 0)
            {
                response.forEach(doc => {
                    array.push({
                        id: doc.id,
                        data: doc.data()
                    });
                });
            }

            return res.status(200).send({ data: array });
        })
        .catch(error => {
            return res.status(200).send({ data: null, error: error.code });
        })
    });
});

module.exports = app;