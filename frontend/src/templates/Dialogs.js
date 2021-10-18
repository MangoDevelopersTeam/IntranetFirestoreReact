import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Skeleton } from '@material-ui/lab';
import { ExpandMore } from '@material-ui/icons';
import { Accordion, AccordionDetails, AccordionSummary, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, List, ListItem, ListItemSecondaryAction, ListItemText, MenuItem, Select, TextField, Typography, useMediaQuery, useTheme } from '@material-ui/core';

import { Encrypt } from './../helpers/cipher/cipher';
import { setUserRedux } from '../helpers/auth/handleAuth';
import { showMessage } from './../helpers/message/handleMessage';
import { checkRun } from './../helpers/format/handleFormat';
import { setRefreshToken, setToken } from './../helpers/token/handleToken';
import { hideNewAdminDialog, hideNewUserDialog } from './../helpers/dialogs/handleDialogs';

import { myArrayCourses, myArrayRegions } from '../utils/allCourses';
import { myGrades, myLetterGrades, myNumberGrades } from '../utils/allGrades';

import { SELECT_NEW_ADMIN, SELECT_NEW_USER } from './../redux/dialogsSlice';

import { user } from './../classes/user';

import axios from 'axios';

const Dialogs = () => {
    // uses
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
    
    const [password, setPassword] = useState("");
    const [securityCode, setSecurityCode] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");

    const [regions, setRegions] = useState(null);
    const [communes, setCommunes] = useState(null);

    const [grade, setGrade] = useState("");
    const [number, setNumber] = useState(1);
    const [letter, setLetter] = useState("");
    const [disabled, setDisabled] = useState(true);
    const [mutableGrades, setMutableGrades] = useState(myNumberGrades);


    // useCallbacks
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

            setGrade("");
            setNumber(1);
            setLetter("");

            if (level === "teacher")
            {
                myArrayCourses.forEach((myCourse) => {
                    document.getElementById(`${myCourse}`).checked = false;
                });
            }

            setLevel("");
        },
        [setRun, setName, setSurname, setEmail, setRegion, setCommune, setPassword, setPasswordRepeat, setSecurityCode, setCourses, setGrade, setNumber, setLetter, level, setLevel],
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

    /**
     * useCallback para manejar el cambio de región
     */
    const handleChangeRegionCommune = useCallback(
        async (region) => {
            setCommune("");
            setCommunes([]);

            setRegion(region); 
            let finded = regions.find(x => x.id === region);
            setCommunes(finded.communes);
        },
        [regions, setCommune, setCommunes, setRegion],
    );

    /**
     * useCallback para setear los numeros del curso dependiendo del grado
     */
    const handleNumberCourseGrade = useCallback(
        /**
         * Función para setear los numeros del curso dependiendo del grado
         * @param {String} grade grado del curso
         * @returns numeros correspondientes al grado
         */
        (grade) => {
            setGrade(grade);
            setDisabled(false);

            if (myGrades.find(x => x === grade) === "Media")
            {
                setMutableGrades(myNumberGrades.slice(0, 4));
            }
            else
            {
                setMutableGrades(myNumberGrades);
            }

            return;
        },
        [setGrade, setDisabled, setMutableGrades],
    );

    /**
     * useCallback para añadir cursos al arreglo de cursos
     */
    const handleAddCourse = useCallback(
        /**
         * función para añadir cursos al arreglo de cursos
         * @param {String} course curso que se añadirá al arreglo de cursos
         */
        (course) => {
            if (courses.find(x => x === course))
            {
                let index = courses.indexOf(course);

                if (index > -1) {
                    courses.splice(index, 1);
                    document.getElementById(`${course}`).checked = false;
                }
            }
            else
            {
                courses.push(course);
                document.getElementById(`${course}`).checked = true;
            }
        },
        [courses],
    );

    /**
     * useCallback para crear un usuario
     */
    const handleCreateUser = useCallback(
        /**
         * Función para crear un nuevo usuario en intranet
         * @returns retorna mensaje informativo para el usuario
         */
        async () => {
            if (run === "" || name === "" || surname === "" || region === "" || commune === "" || email === "" || password === "")
            {
                return showMessage("Complete todos los campos", "info");
            }

            if (level === "student" && (grade === "" || letter === ""))
            {
                return showMessage("Complete todos los campos", "info");
            }
            
            if (/^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/.test(email) === false)
            {
                return showMessage("Ingresa un formato valido de correo", "info");
            }
            console.log(level);
            if (level === "student")
            {
                console.log("works");
            }

            if (level === "student" || level === "proxie" || level === "teacher")
            {
                if (checkRun(run) === false)
                {
                    return showMessage("Verifique el run ingresado", "warning");
                }

                let gradeObject = {
                    grade: grade,
                    number: number,
                    letter: letter
                };

                let userGrades = Encrypt(gradeObject);
                let userCourses = Encrypt(courses);

                let userIntranet = new user(Encrypt(run), Encrypt(name), Encrypt(surname), Encrypt(region), Encrypt(commune), Encrypt(email), Encrypt(level), Encrypt(password));

                await axios.post("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/register-user/", {
                    user: userIntranet, 
                    courses: userCourses,
                    grades: userGrades
                })
                .then(result => {
                    if (result.data.code === "PROCESS_OK")
                    {
                        handleClearFields();
                        hideNewUserDialog();

                        showMessage(result.data.message, result.data.type);
                    }
                    else
                    {
                        showMessage(result.data.message, result.data.type);
                    }

                    return;
                })
                .catch(error => {
                    console.log(error);
                    // return showMessage(error.response.data.error.message, "error");
                });
            }   
            else
            {
                return showMessage("El nivel que has seleccionado no existe", "warning"); 
            }

            
        },
        [run, name, surname, region, commune, email, password, level, grade, letter, courses, number, handleClearFields],
    );

    /**
     * useCallback para crear a un administrador
     */
    const handleCreateAdmin = useCallback(
        /**
         * Función para crear un nuevo administrador en intranet
         * @returns retorna mensaje informativo para el usuario
         */
        async () => {
            if (run === "" || name === "" || surname === "" || region === "" || commune === "" || email === "" || password === "" || passwordRepeat === "" || securityCode === "")
            {
                return showMessage("Complete todos los campos", "info");
            }

            if (/^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/.test(email) === false)
            {
                return showMessage("Ingresa un formato valido de correo", "info");
            }

            if (securityCode !== process.env.REACT_APP_GRANT_KEY)
            {
                return showMessage("La clave de securidad no es correcta", "info");
            }

            if (password !== passwordRepeat)
            {
                return showMessage("Las contraseñas no coinciden", "info");
            }

            if (checkRun(run) === false)
            {
                return showMessage("Verifique el run ingresado", "warning");
            }

            await axios.post("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCxtlob-iIvGtuz6Syc0kexsKW8Es_NIT8", {
                email: email,
                password: password,
                returnSecureToken: true
            })
            .then(async result => {
                setToken(result.data.idToken);
                setRefreshToken(result.data.refreshToken);

                let adminIntranet = new user(Encrypt(run), Encrypt(name), Encrypt(surname), Encrypt(region), Encrypt(commune), Encrypt(email), Encrypt("admin"), Encrypt(password));

                await axios.post("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/register-admin/", {
                    user: adminIntranet,
                    id: Encrypt(result.data.localId)
                })
                .then(result => {
                    if (result.data.code === "PROCESS_OK")
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
                    return showMessage(error.response.data.error.message, "error");
                });
            })
            .catch(error => {
                return showMessage(error.response.data.error.message, "error");
            });
        },
        [run, name, surname, region, commune, email, password, passwordRepeat, securityCode, handleClearFields],
    );


    // useEffects
    useEffect(() => {
        let callQuery = () => {
            setRegions(myArrayRegions);
        };

        callQuery();

        return () => {
            setRegions(null);
        };        
    }, [setRegions]);

    
    return (
        <>
            {/* Dialogo para crear administrador */}
            <Dialog open={newAdmin} onClose={handleCloseAdmin} fullScreen={fullScreen} scroll="paper">
                <DialogTitle>Crear Administrador</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Completa los campos de texto para crear a un nuevo administrador para la Intranet
                    </DialogContentText>
                    <>
                        <TextField style={{ marginBottom: 15 }} type="text" label="Run" variant="outlined" security="true" placeholder="e.g. XXXXXXXX-X" onChange={(e) => setRun(e.target.value)} value={run} fullWidth />
                        <TextField style={{ marginBottom: 15 }} type="text" label="Nombre" variant="outlined" security="true" onChange={(e) => setName(e.target.value)} value={name} fullWidth />
                        <TextField style={{ marginBottom: 15 }} type="text" label="Apellido" variant="outlined" security="true" onChange={(e) => setSurname(e.target.value)} value={surname} fullWidth />
                    
                        <div>
                        { 
                            regions === null ? (
                                <Skeleton />
                            ) : (
                                <FormControl style={{ marginBottom: 15 }} variant="outlined" fullWidth>
                                    <InputLabel>Región</InputLabel>
                                    <Select value={region} label="Región" onChange={(e) => handleChangeRegionCommune(e.target.value)}>
                                    {
                                        regions?.length > 0 ? (
                                            regions?.map(region => (
                                               <MenuItem key={region?.id} value={region?.data?.numero}>{region?.data?.region}</MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled={true}>No hay Regiones acá</MenuItem>
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
                                    <Select value={commune} label="Comuna" onChange={(e) => setCommune(e.target.value)}>                    
                                    {
                                        communes.length > 0 ? (
                                            communes.map(commune => (
                                                <MenuItem key={commune?.name} value={commune?.name}>{commune?.name}</MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled={true}>No hay comunas aquí</MenuItem>
                                        )
                                    }
                                    </Select>
                                </FormControl>
                            )
                        }    
                        </div>

                        <TextField style={{ marginBottom: 15 }} type="text" label="Correo" variant="outlined" security="true" onChange={(e) => setEmail(e.target.value)} value={email} fullWidth />
                        <TextField style={{ marginBottom: 15 }} type="text" label="Contraseña" variant="outlined" security="true" onChange={(e) => setPassword(e.target.value)} value={password} fullWidth />
                        <TextField style={{ marginBottom: 15 }} type="text" label="Repetir Contraseña" variant="outlined" security="true" onChange={(e) => setPasswordRepeat(e.target.value)} value={passwordRepeat} fullWidth />
                        <TextField style={{ marginBottom: 15 }} type="text" label="Codigo de Seguridad" variant="outlined" security="true" onChange={(e) => setSecurityCode(e.target.value)} value={securityCode} fullWidth />
                    </>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={handleCloseAdmin}>
                        Cancelar Operación
                    </Button>
                    <Button color="primary" style={{ color: "#2074d4" }} onClick={handleCreateAdmin}>
                        Registrar Administrador
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Dialogo para crear administrador */}

            {/* Dialogo para crear un usuario */}
            <Dialog open={newUser} onClose={handleCloseUser} fullScreen={fullScreen} scroll="paper">
                <DialogTitle>Crear un Nuevo Usuario</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Completa los campos de texto para crear a un nuevo usuario
                    </DialogContentText>
                    <>
                        <TextField style={{ marginBottom: 15 }} type="text" label="Run" variant="outlined" security="true" placeholder="e.g. XXXXXXXX-X" onChange={(e) => setRun(e.target.value)} value={run} fullWidth />
                        <TextField style={{ marginBottom: 15 }} type="text" label="Nombre" variant="outlined" security="true" onChange={(e) => setName(e.target.value)} value={name} fullWidth />
                        <TextField style={{ marginBottom: 15 }} type="text" label="Apellido" variant="outlined" security="true" onChange={(e) => setSurname(e.target.value)} value={surname} fullWidth />
                        
                        <div>
                        { 
                            regions === null ? (
                                <Skeleton />
                            ) : (
                                <FormControl style={{ marginBottom: 15 }} variant="outlined" fullWidth>
                                    <InputLabel>Región</InputLabel>
                                    <Select value={region} label="Región" onChange={(e) => handleChangeRegionCommune(e.target.value)}>
                                    {
                                        regions?.length > 0 ? (
                                            regions?.map(region => (
                                               <MenuItem key={region?.id} value={region?.data?.numero}>{region?.data?.region}</MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled={true}>No hay Regiones acá</MenuItem>
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
                                    <Select value={commune} label="Comuna" onChange={(e) => setCommune(e.target.value)}>                    
                                    {
                                        communes.length > 0 ? (
                                            communes.map(commune => (
                                                <MenuItem key={commune?.name} value={commune?.name}>{commune?.name}</MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled={true}>No hay comunas aquí</MenuItem>
                                        )
                                    }
                                    </Select>
                                </FormControl>
                            )
                        }    
                        </div>

                        <FormControl style={{ marginBottom: 15 }} variant="outlined" fullWidth>
                            <InputLabel>Grado Administrativo</InputLabel>
                            <Select value={level} label="Grado Administrativo" security="true" onChange={(e) => setLevel(e.target.value)}>
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
                                        <Select onChange={(e) => handleNumberCourseGrade(e.target.value)} value={grade} label="Grado del curso" security="true">
                                        {
                                            myGrades.map(elem => (
                                                <MenuItem key={elem} value={elem}>{elem}</MenuItem>
                                            ))
                                        }
                                        </Select>
                                    </FormControl>

                                    <FormControl variant="outlined" style={{ marginBottom: 15, width: "calc(100vh - 30px)", marginRight: 7.5, marginLeft: 7.5 }}>
                                        <InputLabel>Numero del Curso</InputLabel>
                                        <Select disabled={disabled} onChange={(e) => setNumber(e.target.value)} value={number} label="Numero del curso" security="true">
                                        {
                                            mutableGrades.map(elem => (
                                                <MenuItem key={elem} value={elem}>{elem}</MenuItem>
                                            ))
                                        }
                                        </Select>
                                    </FormControl>

                                    <FormControl variant="outlined" style={{ marginBottom: 15, width: "calc(100vh - 30px)", marginLeft: 7.5 }}>
                                        <InputLabel>Letra del Curso</InputLabel>
                                        <Select onChange={(e) => setLetter(e.target.value)} value={letter} label="Letra del curso" security="true">
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
                                <Accordion style={{ marginBottom: 15 }} variant="outlined" >
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Typography>Asignaturas que enseña</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>    
                                        <List style={{ width: "100%" }}>
                                        {
                                            myArrayCourses?.map(myCourse => (
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
                            )
                        }
                        </div>

                        <TextField style={{ marginBottom: 15 }} type="text" label="Correo" variant="outlined" security="true" onChange={(e) => setEmail(e.target.value)} value={email} fullWidth />
                        <TextField style={{ marginBottom: 15 }} type="text" label="Contraseña" variant="outlined" security="true" onChange={(e) => setPassword(e.target.value)} value={password} fullWidth />
                    </>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={handleCloseUser}>
                        Cancelar Operación
                    </Button>
                    <Button color="primary" style={{ color: "#2074d4" }} onClick={handleCreateUser}>
                        Registrar Usuario
                    </Button>
                </DialogActions>           
            </Dialog>
            {/* Dialogo para crear un usuario */}   
        </>
    );
};

export default Dialogs;