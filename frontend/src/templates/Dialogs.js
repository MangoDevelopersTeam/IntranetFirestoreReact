import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

import { ExpandMore } from '@material-ui/icons';
import { Accordion, AccordionDetails, AccordionSummary, Button, Checkbox, createTheme, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, List, ListItem, ListItemSecondaryAction, ListItemText, MenuItem, Select, TextField, Typography, useMediaQuery, useTheme, ThemeProvider, Grid, Card, CardContent, FormControlLabel, Divider, CircularProgress, Tooltip } from '@material-ui/core';

import { Decrypt, Encrypt } from './../helpers/cipher/cipher';
import { setUserRedux } from '../helpers/auth/handleAuth';
import { setToken } from './../helpers/token/handleToken';
import { checkRun } from './../helpers/format/handleFormat';
import { showMessage } from './../helpers/message/handleMessage';
import { hideNewAdminDialog, hideNewUserDialog } from './../helpers/dialogs/handleDialogs';

import { myArrayCourses, myArrayRegions } from '../utils/allCourses';
import { myGrades, myLetterGrades, myNumberGrades } from '../utils/allGrades';

import { SELECT_NEW_ADMIN, SELECT_NEW_USER } from './../redux/dialogsSlice';
import { SELECT_USER } from '../redux/userSlice';

import { user } from './../classes/user';

import axios from 'axios';


const InputTheme = createTheme({
    palette: {
        primary: {
            main: "#2074d4"
        }
    },
});


const Dialogs = () => {
    // uses
    const actualUser = useSelector(SELECT_USER);
    const newUser = useSelector(SELECT_NEW_USER);
    const newAdmin = useSelector(SELECT_NEW_ADMIN);
    const themeApp = useTheme();
    const fullScreen = useMediaQuery(themeApp.breakpoints.down('sm'));



    // useStates
    const [run, setRun] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [level, setLevel] = useState("");
    const [courses, setCourses] = useState([]);

    const [region, setRegion] = useState("");
    const [commune, setCommune] = useState("");
    const [communes, setCommunes] = useState(null);
    
    const [password, setPassword] = useState("");
    const [securityCode, setSecurityCode] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");

    const [grade, setGrade] = useState("");
    const [number, setNumber] = useState(1);
    const [letter, setLetter] = useState("");

    const [disabled, setDisabled] = useState(true);
    const [addStudents, setAddStudents] = useState(false);
    const [addLearnSubjects, setAddLearnSubjects] = useState(false);
    const [mutableGrades, setMutableGrades] = useState(myNumberGrades);

    const [filteredStudents, setFilteredStudents] = useState(null);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [errorStudents, setErrorStudents] = useState(false);
    const [students, setStudents] = useState([]);
    const [errorCode, setErrorCode] = useState("");

    const [useFilters, setUseFilters] = useState(false);
    const [disabledFilter, setDisabledFilter] = useState(true);
    const [gradeFilter, setGradeFilter] = useState("");
    const [numberFilter, setNumberFilter] = useState(1);
    const [letterFilter, setLetterFilter] = useState("");
    const [mutableGradesFilter, setMutableGradesFilter] = useState(myNumberGrades);



    // useCallbacks
    /* ------ DIALOGS CALLBACKS ------ */
    /**
     * useCallback para limpiar los campos de texto
     */
    const handleClearFields = useCallback(
        () => {
            setRun("");
            setName("");
            setSurname("");
            setEmail("");
            setRegion("");
            setCommune("");
            
            setPassword("");
            setPasswordRepeat("");
            setSecurityCode("");
            setCourses([]);
            
            if (students !== null)
            {
                students.forEach(doc => {
                    if (document.getElementById(doc) != null)
                    {
                        document.getElementById(doc).checked = false;
                    } 
                });
            }
            
            setStudents(null);
            setErrorCode("");
            setUseFilters(false);
            setGradeFilter("");
            setNumberFilter(1);
            setLetterFilter("");

            setGrade("");
            setNumber(1);
            setLetter("");
            setLevel("");

            if (myArrayCourses !== null)
            {
                myArrayCourses.forEach(doc => {
                    if (document.getElementById(doc) != null)
                    {
                        document.getElementById(doc).checked = false;
                    }
                });
            }
        },
        [students, setRun, setName, setSurname, setEmail, setRegion, setCommune, setPassword, setPasswordRepeat, setSecurityCode, setCourses, setGrade, setNumber, setLetter, setLevel, setStudents, setErrorCode, setUseFilters, setGradeFilter, setNumberFilter, setLetterFilter],
    );

    /**
     * useCallback para manejar el cierre del dialogo de crear nuevo administrador
     */
    const handleCloseAdmin = useCallback(
        /**
         * Función para manejar el cierre del dialogo de cerrar el dialogo de administrador 
         * @param {Event} event tipo de evento
         * @param {string} reason tipo de razón de acción 
         * @returns no retorna accion o datos
         */
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            handleClearFields();
            hideNewAdminDialog();
        },
        [handleClearFields],
    );

    /**
     * useCallback para manejar el cierre del dialogo de crear nuevo usuario 
     */
    const handleCloseUser = useCallback(
        /**
         * Función para manejar el cierre del dialogo de cerrar el dialogo de usuario
         * @param {Event} event tipo de evento
         * @param {string} reason tipo de razón de acción 
         * @returns no retorna accion o datos
         */
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            handleClearFields();
            hideNewUserDialog();
        },
        [handleClearFields],
    );
    /* ------ DIALOGS CALLBACKS ------ */


    /* ------ COURSE CALLBACKS ------ */
    /**
     * useCallback para manejar el cambio de región
     */
    const handleChangeRegionCommune = useCallback(
        (region) => {
            setCommune("");
            setCommunes([]);
            setRegion(region); 

            let finded = myArrayRegions.find(x => x.id === region);
            return setCommunes(finded.communes);
        },
        [setCommune, setCommunes, setRegion],
    );

    /**
     * useCallback para setear los numeros del curso dependiendo del grado
     */
    const handleNumberCourseGrade = useCallback(
        (grade) => {
            setGrade(grade);
            setDisabled(false);
            setNumber(1);

            if (myGrades.find(x => x === grade) === "Media")
            {
                return setMutableGrades(myNumberGrades.slice(0, 4));
            }
            
            return setMutableGrades(myNumberGrades);
        },
        [setGrade, setDisabled, setNumber, setMutableGrades],
    );

    /**
     * useCallback para manejar el cambio de numero de grado para el filtro
     */
    const handleNumberCourseGradeFilter = useCallback(
        (grade) => {
            setGradeFilter(grade);
            setDisabledFilter(false);
            setNumberFilter(1);

            if (myGrades.find(x => x === grade) === "Media")
            {
                return setMutableGradesFilter(myNumberGrades.slice(0, 4));
            }
            
            return setMutableGradesFilter(myNumberGrades);
        },
        [setGradeFilter, setDisabledFilter, setNumberFilter, setMutableGradesFilter],
    );

    /**
     * useCallback para añadir cursos al arreglo de cursos
     */
    const handleAddCourse = useCallback(
        async (course) => {
            if (await courses.find(x => x === course))
            {
                let index = courses.indexOf(course);

                if (index > -1) {
                    courses.splice(index, 1);
                    return document.getElementById(`${course}`).checked = false;
                }
            }
            else
            {
                courses.push(course);
                return document.getElementById(`${course}`).checked = true;
            }
        },
        [courses],
    );

    /**
     * useCallback para manejar el cambio de tipo de grado administrativo
     */
    const handleChangeLevelGrade = useCallback(
        (level) => {
            setLevel(level);
            setAddStudents(false);
            setAddLearnSubjects(false);
        },
        [setLevel, setAddStudents, setAddLearnSubjects],
    );
    /* ------ COURSE CALLBACKS ------ */


    /* ------ CREATE USER CALLBACKS ------ */
    const handleGetStudents = useCallback(
        async () => {
            let object = {
                number: null,
                grade: null,
                letter: null
            };

            if (useFilters === true)
            {
                if (gradeFilter === "" || letterFilter === "")
                {
                    return showMessage("Complete los valores del filtro", "info");
                }

                object.grade = gradeFilter;
                object.letter = letterFilter;
                object.number = numberFilter;
            }

            setLoadingStudents(true);
            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-system-students", {
                params: {
                    filter: useFilters,
                    filterData: Encrypt(object)
                },
            })
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setLoadingStudents(false);
                    setErrorStudents(false);
                    setFilteredStudents(Decrypt(result.data.data));
                }
                else
                {
                    // FIREBASE_VERIFY_TOKEN_ERROR
                    setLoadingStudents(false);
                    setErrorStudents(true);
                    setFilteredStudents(null);
                    setErrorCode(result.data.code);
                }
            })
            .catch(error => {
                if (error.response)
                {           
                    setErrorCode(error.response.data.code);
                }
                else
                {
                    setErrorCode("DEFAULT_ERROR_CODE");
                }

                setLoadingStudents(false);
                setErrorStudents(true);
                setFilteredStudents(null);
            });
        },
        [useFilters, gradeFilter, letterFilter, numberFilter, setLoadingStudents, setErrorStudents, setFilteredStudents, setErrorCode],
    );

    /**
     * useCallback para añadir los alumnos seleccionados dentro de un arreglo
     */
    const handleAddStudent = useCallback(
        async (userId) => {
            if (await students.find(x => x === userId))
            {
                let index = students.indexOf(userId);

                if (index > -1) {
                    students.splice(index, 1);
                    return document.getElementById(userId).checked = false;
                }
            }
            else
            {
                students.push(userId);
                return document.getElementById(userId).checked = true;
            }
        },
        [students],
    );

    /**
     * useCallback para crear un usuario
     */
    const handleCreateUser = useCallback(
        async () => {
            if (run === "" || name === "" || surname === "" || region === "" || commune === "" || email === "" || password === "")
            {
                return showMessage("Complete todos los campos", "info");
            }
            
            if (/^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/.test(email) === false)
            {
                return showMessage("Ingresa un formato valido de correo", "info");
            }

            if (level === "student" || level === "proxie" || level === "teacher")
            {
                if (level === "student")
                {
                    if (grade === "" || letter === "")
                    {
                        return showMessage("Complete todos los campos", "info");
                    }
                }

                if (level === "teacher")
                {
                    if (courses.length <= 0)
                    {
                        return showMessage("Debe seleccionar al menos una asignatura", "info");
                    }
                }

                if (level === "proxie")
                {
                    if (students.length <= 0)
                    {
                        return showMessage("Debe seleccionar al menos un alumno para asignarlo al apoderado", "info");
                    }
                }

                if (checkRun(run) === false)
                {
                    return showMessage("Verifique el run ingresado", "warning");
                }

                if (password !== passwordRepeat)
                {
                    return showMessage("Las contraseñas no coinciden", "info");
                }

                let gradeObject = {
                    grade: grade,
                    number: number,
                    letter: letter
                };

                let userCourses = Encrypt(courses);
                let userGrades = Encrypt(gradeObject);
                let userStudents = Encrypt(students);
                let userIntranet = new user(Encrypt(run), Encrypt(name), Encrypt(surname), Encrypt(region), Encrypt(commune), Encrypt(email), Encrypt(level), Encrypt(password), Encrypt(passwordRepeat));

                await axios.post("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/register-user/", {
                    user: userIntranet, 
                    courses: userCourses,
                    grades: userGrades,
                    students: userStudents
                })
                .then(result => {
                    if (result.status === 201 && result.data.code === "PROCESS_OK")
                    {
                        handleClearFields();
                        hideNewUserDialog();

                        return showMessage(result.data.message, result.data.type);
                    }
                    else
                    {
                        return showMessage(result.data.message, result.data.type);
                    }
                })
                .catch(error => {
                    if (error.response)
                    {
                        if (error.response.data.code === "auth/email-already-exists")
                        {
                            return showMessage("El correo ingresado ya existe en el sistema", error.response.data.type);
                        }
                        else
                        {
                            return showMessage(error.response.data.message, error.response.data.type);
                        }
                    }
                });
            }   
            else
            {
                return showMessage("El nivel que has seleccionado no existe", "warning"); 
            }
        },
        [run, name, surname, region, commune, email, password, passwordRepeat, level, grade, letter, courses, students, number, handleClearFields],
    );

    /**
     * useCallback para crear a un administrador
     */
    const handleCreateAdmin = useCallback(
        async () => {
            if (run === "" || name === "" || surname === "" || region === "" || commune === "" || email === "" || password === "" || passwordRepeat === "" || securityCode === "")
            {
                return showMessage("Complete todos los campos", "info");
            }

            if (/^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/.test(email) === false)
            {
                return showMessage("Ingresa un formato valido de correo", "info");
            }

            if (checkRun(run) === false)
            {
                return showMessage("Verifique el run ingresado", "warning");
            }

            if (password !== passwordRepeat)
            {
                return showMessage("Las contraseñas no coinciden", "info");
            }

            if (securityCode !== process.env.REACT_APP_GRANT_KEY)
            {
                return showMessage("La clave de securidad no es correcta", "info");
            }

            let adminIntranet = new user(Encrypt(run), Encrypt(name), Encrypt(surname), Encrypt(region), Encrypt(commune), Encrypt(email), Encrypt("admin"), Encrypt(password), Encrypt(passwordRepeat));

            if (actualUser === null)
            {
                await axios.post("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCxtlob-iIvGtuz6Syc0kexsKW8Es_NIT8", {
                    email: email,
                    password: password,
                    returnSecureToken: true
                })
                .then(async result => {
                    setToken(result.data.idToken);
                    
                    await axios.post("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/register-admin/", {
                        user: adminIntranet,
                        logged: actualUser === null ? false : true
                    })
                    .then(result => {
                        if (result.status === 201 && result.data.code === "PROCESS_OK")
                        {
                            let object = {
                                email: Encrypt(email),
                                displayName: Encrypt(`${name} ${surname}`)
                            }
                            
                            setUserRedux(Encrypt(object));
                            
                            handleClearFields();
                            hideNewAdminDialog();

                            return showMessage(result.data.message, result.data.type);
                        }
                    })
                    .catch(error => {
                        if (error.response)
                        {
                            console.log(error.response);
                        }
                        // return showMessage(error.response.data.error.message, "error");
                    });
                })
                .catch(error => {
                    if (error.response)
                    {
                        console.log(error.response);
                    }
                    /* return showMessage(error.response.data.error.message, "error"); */
                });
            }
            else
            {
                await axios.post("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/register-admin/", {
                    user: adminIntranet,
                    logged: actualUser === null ? false : true
                })
                .then(result => {
                    console.log(result);
                    if (result.status === 201 && result.data.code === "PROCESS_OK")
                    {                            
                        handleClearFields();
                        hideNewAdminDialog();

                        return showMessage(result.data.message, result.data.type);
                    }
                })
                .catch(error => {
                    if (error.response)
                    {
                        console.log(error.response);
                    }
                    // return showMessage(error.response.data.error.message, "error");
                });
            }
        },
        [run, name, surname, region, commune, email, password, passwordRepeat, securityCode, actualUser, handleClearFields],
    );
    /* ------ CREATE USER CALLBACKS ------ */


    return (
        <>
            {/* Dialogo para crear administrador */}
            <Dialog open={newAdmin} onClose={handleCloseAdmin} fullScreen={fullScreen} scroll="paper">
                <DialogTitle>Crear un Administrador</DialogTitle>
                <DialogContent>
                    <DialogContentText>Completa los campos de texto y selecciones para crear a un nuevo administrador en la Plataforma</DialogContentText>
                    <React.Fragment>
                        <ThemeProvider theme={InputTheme}>
                            <TextField style={{ marginBottom: 15 }} type="text" label="Run" variant="outlined" security="true" placeholder="e.g. XXXXXXXX-X" onChange={(e) => setRun(e.target.value)} value={run} fullWidth />
                            <TextField style={{ marginBottom: 15 }} type="text" label="Nombre" variant="outlined" security="true" onChange={(e) => setName(e.target.value)} value={name} fullWidth />
                            <TextField style={{ marginBottom: 15 }} type="text" label="Apellido" variant="outlined" security="true" onChange={(e) => setSurname(e.target.value)} value={surname} fullWidth />
                        
                            <div>
                            {
                                myArrayRegions !== null && (
                                    <FormControl style={{ marginBottom: 15 }} variant="outlined" fullWidth>
                                        <InputLabel>Región</InputLabel>
                                        <Select value={region} label="Región" security="true" onChange={(e) => handleChangeRegionCommune(e.target.value)}>
                                        {
                                            myArrayRegions.length > 0 ? (
                                                myArrayRegions.map(doc => (
                                                <MenuItem key={doc.id} value={doc.data.numero}>{doc.data.region}</MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem disabled={true}>No hay Regiones acá aún</MenuItem>
                                            )
                                        }            
                                        </Select>
                                    </FormControl>
                                )
                            }
                            </div>

                            <div>
                            {
                                communes !== null && (
                                    <FormControl style={{ marginBottom: 15 }} variant="outlined" fullWidth>
                                        <InputLabel>Comuna</InputLabel>
                                        <Select value={commune} label="Comuna" security="true" onChange={(e) => setCommune(e.target.value)}>                    
                                        {
                                            communes.length > 0 ? (
                                                communes.map(commune => (
                                                    <MenuItem key={commune.name} value={commune.name}>{commune.name}</MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem disabled={true}>No hay comunas aquí aún</MenuItem>
                                            )
                                        }
                                        </Select>
                                    </FormControl>
                                )
                            }    
                            </div>
                            
                            <TextField style={{ marginBottom: 15 }} type="text" label="Correo" variant="outlined" security="true" onChange={(e) => setEmail(e.target.value)} value={email} fullWidth />
                            <TextField style={{ marginBottom: 15 }} type="text" label="Contraseña" variant="outlined" security="true" onChange={(e) => setPassword(e.target.value)} value={password} fullWidth />
                            <TextField style={{ marginBottom: 15 }} type="text" label="Confirmar Contraseña" variant="outlined" security="true" onChange={(e) => setPasswordRepeat(e.target.value)} value={passwordRepeat} fullWidth />
                            <TextField style={{ marginBottom: 15 }} type="text" label="Codigo de Seguridad" variant="outlined" security="true" onChange={(e) => setSecurityCode(e.target.value)} value={securityCode} fullWidth />
                        </ThemeProvider>
                    </React.Fragment>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={() => handleCloseAdmin()}>
                        Cerrar Ventana
                    </Button>
                    <Button style={{ color: "#2074d4" }} onClick={async () => await handleCreateAdmin()}>
                        Registrar Administrador
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Dialogo para crear administrador */}

            {/* Dialogo para crear un usuario */}
            <Dialog open={newUser} onClose={handleCloseUser} fullWidth={addStudents} maxWidth="md" fullScreen={fullScreen} scroll="paper">
                <DialogTitle>Crear un Nuevo Usuario</DialogTitle>
                <DialogContent>
                    <DialogContentText>Completa los campos de texto y selecciones para crear a un nuevo usuario en la Plataforma</DialogContentText>

                    <React.Fragment>
                        <Grid container direction="row" alignItems="flex-start">
                            <React.Fragment>
                            {
                                addStudents === true && (
                                    <Grid item container md={5} alignItems="center" justifyContent="center">
                                        <Card elevation={0} style={{ width: "100%", marginRight: 15 }}>
                                            <CardContent>
                                                <FormControlLabel
                                                    control={<Tooltip title={useFilters === true ? "Si deseas obtener alumnos sin filtros, quita esta opción" : "Si desea filtrar los datos, selecciona esta opción"}>
                                                                <Checkbox style={{ color: "#2074d4" }} security="true" checked={useFilters} onChange={(e) => setUseFilters(e.target.checked)} />
                                                            </Tooltip>}
                                                    label="Filtrar Datos"
                                                />

                                                <Divider style={{ marginTop: 5, marginBottom: 15 }} />

                                                <React.Fragment>
                                                {
                                                    useFilters === true && (
                                                        <ThemeProvider theme={InputTheme}>
                                                            <Accordion style={{ marginBottom: 15 }} variant="outlined" >
                                                                <AccordionSummary expandIcon={<ExpandMore />}>
                                                                    <Typography>Filtros</Typography>
                                                                </AccordionSummary>
                                                                <AccordionDetails>
                                                                    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                                                        <FormControl variant="outlined" fullWidth style={{ marginBottom: 15 }}>
                                                                            <InputLabel>Grado del Curso</InputLabel>
                                                                            <Select value={gradeFilter} label="Grado del curso" security="true" onChange={(e) => handleNumberCourseGradeFilter(e.target.value)}>
                                                                            {
                                                                                myGrades.map(elem => (
                                                                                    <MenuItem key={elem} value={elem}>{elem}</MenuItem>
                                                                                ))
                                                                            }
                                                                            </Select>
                                                                        </FormControl>

                                                                        <FormControl variant="outlined" fullWidth style={{ marginBottom: 15 }}>
                                                                            <InputLabel>Numero del Curso</InputLabel>
                                                                            <Select disabled={disabledFilter} value={numberFilter} label="Numero del curso" security="true" onChange={(e) => setNumberFilter(e.target.value)}>
                                                                            {
                                                                                mutableGradesFilter.map(elem => (
                                                                                    <MenuItem key={elem} value={elem}>{elem}</MenuItem>
                                                                                ))
                                                                            }
                                                                            </Select>
                                                                        </FormControl>

                                                                        <FormControl variant="outlined" fullWidth>
                                                                            <InputLabel>Letra del Curso</InputLabel>
                                                                            <Select value={letterFilter} label="Letra del curso" security="true" onChange={(e) => setLetterFilter(e.target.value)}>
                                                                            {
                                                                                myLetterGrades.map(elem => (
                                                                                    <MenuItem key={elem} value={elem}>{elem}</MenuItem>
                                                                                ))
                                                                            }
                                                                            </Select>
                                                                        </FormControl>
                                                                    </div>    
                                                                </AccordionDetails>
                                                            </Accordion>
                                                        </ThemeProvider>
                                                    )
                                                }    
                                                </React.Fragment>

                                                <div>
                                                {
                                                    loadingStudents === true ? (
                                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                            <CircularProgress style={{ color: "#2074d4" }} />
                                                        </div>
                                                    ) : (
                                                        errorStudents === true ? (
                                                            <React.Fragment>
                                                                <Typography style={{ textAlign: "center" }}>
                                                                {
                                                                    errorCode !== null && (
                                                                        errorCode === "DATA_SENT_NULL" ? (
                                                                            "Asegurese de enviar los datos correctamente"
                                                                        ) : errorCode === "BAD_TYPE_PARAMS" ? (
                                                                            "Asegurese de enviar los tipos de datos correctamente"
                                                                        ) : errorCode === "DATA_SENT_INVALID" ? (
                                                                            "Asegurese de enviar los datos correctamenta y completa"
                                                                        ) : errorCode === "STUDENTS_NOT_FOUND" ? (
                                                                            "No existen alumnos en el sistema"
                                                                        ) : (
                                                                            "Ha ocurrido un error mientras se procesaba la solicitud"
                                                                        )
                                                                    )
                                                                }
                                                                </Typography>
                                                                
                                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                    <Button style={{ color: "#2074d4" }} onClick={async () => await handleGetStudents()}>Obtener Estudiantes</Button>
                                                                </div>
                                                            </React.Fragment>
                                                        ) : (
                                                            filteredStudents === null ? (
                                                                <React.Fragment>
                                                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                        <Typography>Presione <b>Obtener Estudiantes</b> para obtener a los estudiantes, si desea filtrarlos, seleccione la opción llamada "Filtrar Datos"</Typography>
                                                                    </div>

                                                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                        <Button style={{ color: "#2074d4" }} onClick={async () => await handleGetStudents()}>Obtener Estudiantes</Button>
                                                                    </div>
                                                                </React.Fragment>
                                                            ) : (
                                                                <React.Fragment>
                                                                    <List style={{ width: "100%" }}>
                                                                    {
                                                                        filteredStudents.map(doc => (
                                                                            <div key={doc.id}>
                                                                                <Divider />
                                                                                <ListItem>
                                                                                    <ListItemText primary={<Typography>{`${Decrypt(doc.data.name)} ${Decrypt(doc.data.surname)}`}</Typography>} secondary={<Typography variant="subtitle2">{Decrypt(doc.data.rut)}</Typography>} />
                                                                                    <ListItemSecondaryAction>
                                                                                        <Tooltip title="Seleccione o Quite la seleeción si quiere establecer a este alumno o no al apoderado">
                                                                                            <Checkbox id={doc.id} edge="end" style={{ color: "#2074d4" }} onChange={async () => await handleAddStudent(doc.id)} />
                                                                                        </Tooltip>
                                                                                    </ListItemSecondaryAction>
                                                                                </ListItem>
                                                                            </div>
                                                                        ))
                                                                    }
                                                                    </List>

                                                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                        <Button style={{ color: "#2074d4" }} onClick={async () => await handleGetStudents()}>Obtener Estudiantes</Button>
                                                                    </div>
                                                                </React.Fragment>
                                                            )
                                                        )
                                                    )
                                                }
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                )
                            }

                            {
                                addLearnSubjects === true && (
                                    <Grid item container md={5} alignItems="center" justifyContent="center">
                                        <Card elevation={0} style={{ width: "100%", marginRight: 15, marginTop: 15 }}>
                                            <ThemeProvider theme={InputTheme}>
                                                <Accordion style={{ marginBottom: 15 }} variant="outlined" >
                                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                                        <Typography>Asignaturas que enseña</Typography>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <List style={{ width: "100%" }}>
                                                        {
                                                            myArrayCourses.map(myCourse => (
                                                                <ListItem key={myCourse}>
                                                                    <ListItemText primary={myCourse} />
                                                                    <ListItemSecondaryAction>
                                                                        <Checkbox id={`${myCourse}`} edge="end" color="primary" onChange={() => handleAddCourse(myCourse)} />
                                                                    </ListItemSecondaryAction>
                                                                </ListItem>
                                                            ))
                                                        }
                                                        </List>
                                                    </AccordionDetails>
                                                </Accordion>
                                            </ThemeProvider>    
                                        </Card>
                                    </Grid>
                                )
                            }
                            </React.Fragment>
    
                            <Grid item container md={addStudents || addLearnSubjects === true ? 7 : 12} alignItems="center" justifyContent="center">
                                <Card elevation={0} style={{ width: "100%", marginTop: 15 }}>
                                    <ThemeProvider theme={InputTheme}>
                                        <TextField style={{ marginBottom: 15 }} type="text" label="Run" variant="outlined" security="true" placeholder="e.g. XXXXXXXX-X" onChange={(e) => setRun(e.target.value)} value={run} fullWidth />
                                        <TextField style={{ marginBottom: 15 }} type="text" label="Nombre" variant="outlined" security="true" onChange={(e) => setName(e.target.value)} value={name} fullWidth />
                                        <TextField style={{ marginBottom: 15 }} type="text" label="Apellido" variant="outlined" security="true" onChange={(e) => setSurname(e.target.value)} value={surname} fullWidth />
                                    
                                        <div>
                                        {
                                            myArrayRegions !== null && (
                                                <FormControl style={{ marginBottom: 15 }} variant="outlined" fullWidth>
                                                    <InputLabel>Región</InputLabel>
                                                    <Select value={region} label="Región" security="true" onChange={(e) => handleChangeRegionCommune(e.target.value)}>
                                                    {
                                                        myArrayRegions.length > 0 ? (
                                                            myArrayRegions.map(doc => (
                                                            <MenuItem key={doc.id} value={doc.data.numero}>{doc.data.region}</MenuItem>
                                                            ))
                                                        ) : (
                                                            <MenuItem disabled={true}>No hay Regiones acá aún</MenuItem>
                                                        )
                                                    }            
                                                    </Select>
                                                </FormControl>
                                            )
                                        }
                                        </div>

                                        <div>
                                        {
                                            communes !== null && (
                                                <FormControl style={{ marginBottom: 15 }} variant="outlined" fullWidth>
                                                    <InputLabel>Comuna</InputLabel>
                                                    <Select value={commune} label="Comuna" security="true" onChange={(e) => setCommune(e.target.value)}>                    
                                                    {
                                                        communes.length > 0 ? (
                                                            communes.map(commune => (
                                                                <MenuItem key={commune.name} value={commune.name}>{commune.name}</MenuItem>
                                                            ))
                                                        ) : (
                                                            <MenuItem disabled={true}>No hay comunas aquí aún</MenuItem>
                                                        )
                                                    }
                                                    </Select>
                                                </FormControl>
                                            )
                                        }    
                                        </div>

                                        <FormControl style={{ marginBottom: 15 }} variant="outlined" fullWidth>
                                            <InputLabel>Grado Administrativo</InputLabel>
                                            <Select value={level} label="Grado Administrativo" security="true" onChange={(e) => handleChangeLevelGrade(e.target.value)}>
                                                <MenuItem value={"teacher"}>Profesor</MenuItem>
                                                <MenuItem value={"student"}>Alumno</MenuItem>
                                                <MenuItem value={"proxie"}>Apoderado</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <div>
                                        {
                                            level !== "" && level === "student" && (
                                                <div style={{ display: "flex" }}>
                                                    <FormControl variant="outlined" style={{ marginBottom: 15, width: "calc(100vh - 30px)", marginRight: 7.5 }}>
                                                        <InputLabel>Grado del Curso</InputLabel>
                                                        <Select value={grade} label="Grado del curso" security="true" onChange={(e) => handleNumberCourseGrade(e.target.value)}>
                                                        {
                                                            myGrades.map(elem => (
                                                                <MenuItem key={elem} value={elem}>{elem}</MenuItem>
                                                            ))
                                                        }
                                                        </Select>
                                                    </FormControl>

                                                    <FormControl variant="outlined" style={{ marginBottom: 15, width: "calc(100vh - 30px)", marginRight: 7.5, marginLeft: 7.5 }}>
                                                        <InputLabel>Numero del Curso</InputLabel>
                                                        <Select disabled={disabled} value={number} label="Numero del curso" security="true" onChange={(e) => setNumber(e.target.value)}>
                                                        {
                                                            mutableGrades.map(elem => (
                                                                <MenuItem key={elem} value={elem}>{elem}</MenuItem>
                                                            ))
                                                        }
                                                        </Select>
                                                    </FormControl>

                                                    <FormControl variant="outlined" style={{ marginBottom: 15, width: "calc(100vh - 30px)", marginLeft: 7.5 }}>
                                                        <InputLabel>Letra del Curso</InputLabel>
                                                        <Select value={letter} label="Letra del curso" security="true" onChange={(e) => setLetter(e.target.value)}>
                                                        {
                                                            myLetterGrades.map(elem => (
                                                                <MenuItem key={elem} value={elem}>{elem}</MenuItem>
                                                            ))
                                                        }
                                                        </Select>
                                                    </FormControl>
                                                </div>
                                            )
                                        }
                                        </div>

                                        <div>
                                        {
                                            level !== "" && level === "teacher" && (
                                                <Button style={{ color: "#2074d4", margin: "auto", marginBottom: 15 }} onClick={() => setAddLearnSubjects(!addLearnSubjects)}>
                                                {
                                                    addLearnSubjects === false ? (
                                                        <Typography variant="button">Abrir lista de tipos de asignaturas y asignarlos al profesor</Typography>
                                                    ) : (
                                                        <Typography variant="button">Cerrar lista de tipos de asignatura</Typography>
                                                    )
                                                }
                                                </Button>
                                            )
                                        }
                                        </div>

                                        <div>
                                        {
                                            level !== "" && level === "proxie" && (
                                                <Button style={{ color: "#2074d4", margin: "auto", marginBottom: 15 }} onClick={() => setAddStudents(!addStudents)}>
                                                {
                                                    addStudents === false ? (
                                                        <Typography variant="button">Abrir lista de estudiantes y asignar alumnos</Typography>
                                                    ) : (
                                                        <Typography variant="button">Cerrar lista de estudiantes</Typography>
                                                    )
                                                }
                                                </Button>
                                            )
                                        }
                                        </div>

                                        <TextField style={{ marginBottom: 15 }} type="text" label="Correo" variant="outlined" security="true" onChange={(e) => setEmail(e.target.value)} value={email} fullWidth />
                                        <TextField style={{ marginBottom: 15 }} type="text" label="Contraseña" variant="outlined" security="true" onChange={(e) => setPassword(e.target.value)} value={password} fullWidth />
                                        <TextField style={{ marginBottom: 15 }} type="text" label="Confirmar Contraseña" variant="outlined" security="true" onChange={(e) => setPasswordRepeat(e.target.value)} value={passwordRepeat} fullWidth />
                                    </ThemeProvider>
                                </Card>
                            </Grid>
                        </Grid>
                    </React.Fragment>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={() => handleCloseUser()}>
                        Cerrar Ventana
                    </Button>
                    <Button style={{ color: "#2074d4" }} onClick={async () => await handleCreateUser()}>
                        Registrar Usuario
                    </Button>
                </DialogActions>           
            </Dialog>
            {/* Dialogo para crear un usuario */}   
        </>
    );
};

export default Dialogs;