import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button, Card, CardContent, CircularProgress, createTheme, Paper, Typography, useMediaQuery, useTheme, ThemeProvider, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, FormControl, InputLabel, Select, MenuItem, TextField, Breadcrumbs, FormLabel, FormControlLabel, Radio, RadioGroup } from '@material-ui/core'
import { FilterList, NavigateNext } from '@material-ui/icons';

import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';
import { showMessage } from './../../helpers/message/handleMessage';

import { myArrayCourses } from './../../utils/allCourses';

import QuestionCard from './QuestionCard';

import axios from 'axios';

const InputTheme = createTheme({
    palette: {
        primary: {
            main: "#2074d4"
        }
    },
});

const Forum = () => {
    // uses
    const themeApp = useTheme();
    const fullScreen = useMediaQuery(themeApp.breakpoints.down('sm'));

    // useStates
    const [access,   setAccess] = useState(null);
    const [errorAccess, setErrorAccess] = useState(false);
    const [loadingAccess, setLoadingAccess] = useState(true);
    const [errorCode, setErrorCode] = useState(null);

    const [questions, setQuestions] = useState(null);
    const [errorQuestions, setErrorQuestions] = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(true);

    const [theme, setTheme] = useState("");
    const [question, setQuestion] = useState("");
    const [description, setDescription] = useState("");
    const [filter, setFilter] = useState("");

    const [loadingPostQuestion, setLoadingPostQuestion] = useState(false);
    const [errorPostQuestion, setErrorPostQuestion] = useState(false);

    const [loadingFilterQuestions, setLoadingFilterQuestions] = useState(false);
    const [errorFilterQuestions, setErrorFilterQuestions] = useState(false);

    const [newQuestionDialog, setNewQuestionDialog] = useState(false);
    const [filterDialog, setFilterDialog] = useState(false);

    // useCallbacks
    // dialogsCallbacks
    const handleOpenNewQuestionDialog = useCallback(
        () => {
            setNewQuestionDialog(true);
        },
        [setNewQuestionDialog],
    );
    const handleCloseNewQuestionDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setTheme("");
            setQuestion("");
            setDescription("");
            return setNewQuestionDialog(false);
        },
        [setNewQuestionDialog, setTheme, setQuestion, setDescription],
    );
    
    const handleOpenFilterDialog = useCallback(
        () => {
            setFilterDialog(true);
        },
        [setFilterDialog],
    );
    const handleCloseFilterDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            return setFilterDialog(false);
        },
        [setFilterDialog],
    );

    
    // functionalCallbacks
    const handleGetAccess = useCallback(
        async () => {
            setLoadingAccess(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-access`)
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setAccess(Decrypt(result.data.data));
                    setErrorAccess(false);
                    setErrorCode(null);
                }
                else
                {
                    setAccess(undefined);
                    setErrorAccess(true);
                    setErrorCode(result.data.code);
                }

                setLoadingAccess(false);
            })
            .catch(error => {
                setErrorAccess(true);
                setAccess(undefined);

                if (error.response)
                {
                    setErrorCode(error.response.data.code);
                }
                else
                {
                    setErrorCode("GET_ACCESS_ERROR");
                }

                setLoadingAccess(false);
            })
            .finally(() => {
                return () => {
                    setAccess(null);
                    setErrorAccess(null);
                    setErrorCode(null);
                    setLoadingAccess(null);
                }
            });
        },
        [setAccess, setErrorAccess, setErrorCode, setLoadingAccess],
    );

    const handleGetQuestions = useCallback(
        async () => {
            setLoadingQuestions(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-questions-forum`)
            .then(result => {
                console.log(result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    console.log("questions are =>", Decrypt(result.data.data));
                    setQuestions(Decrypt(result.data.data));
                    setErrorQuestions(false);
                    setErrorCode(null);
                }
                else
                {
                    setQuestions(undefined);
                    setErrorQuestions(true);
                    setErrorCode(result.data.code);
                }

                setLoadingQuestions(false);
            })
            .catch(error => {
                setErrorQuestions(true);
                setQuestions(undefined);

                if (error.response)
                {
                    setErrorCode(error.response.data.code);
                }
                else
                {
                    setErrorCode("GET_ACCESS_ERROR");
                }

                setLoadingQuestions(false);
            })
            .finally(() => {
                return () => {
                    setQuestions(null);
                    setErrorQuestions(null);
                    setErrorCode(null);
                    setLoadingQuestions(null);
                }
            });
        },
        [setQuestions, setErrorQuestions, setErrorCode, setLoadingQuestions],
    );

    const handleGetFilteredQuestions = useCallback(
        async () => {
            if (filter === "")
            {
                return showMessage("Complete los valores requeridos para filtrar las preguntas", "info");
            }

            setLoadingFilterQuestions(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-filtered-questions-forum`, {
                params: {
                    themeParam: Encrypt(filter)
                }
            })
            .then(result => {
                console.log(result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setQuestions(Decrypt(result.data.data));
                    setErrorFilterQuestions(false);
                    setErrorCode(null);
                }
                else
                {
                    setQuestions(undefined);
                    setErrorFilterQuestions(false);
                    setErrorCode(result.data.code);
                }

                handleCloseFilterDialog();
                setLoadingFilterQuestions(false);
            })
            .catch(error => {
                setErrorFilterQuestions(true);
                setQuestions(undefined);

                if (error.response)
                {
                    setErrorCode(error.response.data.code);
                }
                else
                {
                    setErrorCode("GET_QUESTIONS_ERROR");
                }

                handleCloseFilterDialog();
                setLoadingFilterQuestions(false);
            })
            .finally(() => {
                return () => {
                    setQuestions(null);
                    setErrorFilterQuestions(null);
                    setErrorCode(null);
                    setLoadingFilterQuestions(null);
                }
            });
        },
        [filter, setQuestions, setErrorFilterQuestions, setErrorCode, setLoadingFilterQuestions, handleCloseFilterDialog],
    );

    const handleAddQuestion = useCallback(
        async () => {
            if (theme === null || question === null || description === null)
            {
                return showMessage("Verifique el valor de los campos", "error");
            }

            if (theme === "" || question === "" || description === "")
            {
                return showMessage("Complete todos los campos de texto y selección", "info");
            }

            setLoadingPostQuestion(true);

            let object = {
                question: question,
                description: description,
                theme: theme
            };

            await axios.post(`${process.env.REACT_APP_API_URI}/post-question-forum`, {
                objectData: Encrypt(object)
            })
            .then(async result => {
                if (result.status === 201 && result.data.code === "PROCESS_OK")
                {
                    handleCloseNewQuestionDialog();
                    setLoadingPostQuestion(false);
                    setErrorPostQuestion(false);
                    setErrorCode(null);

                    await handleGetQuestions();
                    showMessage("Pregunta creada correctamente", "success");
                }
                else
                {
                    setLoadingPostQuestion(false);
                    setErrorPostQuestion(true);
                    setErrorCode(result.data.code);
                }
            })
            .catch(error => {
                setLoadingPostQuestion(false);
                setErrorPostQuestion(true);

                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode(error.response.data.code);
                }
                else
                {
                    setErrorCode("POST_QUESTION_ERROR");
                }
            })
            .finally(() => {
                return () => {
                    setLoadingPostQuestion(null);
                    setErrorPostQuestion(null);
                    setErrorCode(null);
                }
            });
        },
        [theme, question, description, setErrorCode, setErrorPostQuestion, setLoadingPostQuestion, handleGetQuestions, handleCloseNewQuestionDialog],
    );



    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            await handleGetAccess();
        }
        
        callQuery();

        return () => {
            setAccess(null);
        }
    }, [handleGetAccess, setAccess]);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetQuestions();
        }

        callQuery();

        return () => {
            setQuestions(null);
            setErrorQuestions(null);
            setLoadingQuestions(null);
        }
    }, [handleGetQuestions, setQuestions, setErrorQuestions, setLoadingQuestions])

    return (
        <Paper elevation={0} itemType="div">
        {
            loadingAccess === true ? (
                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <CircularProgress style={{ color: "#2074d4" }} />
                        <Typography style={{ marginTop: 15 }}>Cargando Acceso</Typography>
                    </Paper>
                </Paper>
            ) : errorAccess === true ? (
                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <React.Fragment>
                        {
                            errorCode !== null && (
                                <React.Fragment>
                                    <Typography style={{ textAlign: "center" }}>
                                    {
                                        errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente o bien"
                                        ) : (
                                            "Ha ocurrido un error al verificar el acceso, intentelo nuevamente"
                                        )
                                    }
                                    </Typography>

                                    <React.Fragment>
                                    {
                                        errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                            <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                <Button onClick={async () => await handleGetAccess()} style={{ color: "#2074d4" }}>
                                                    <Typography variant="button">Recargar Acceso</Typography>
                                                </Button>
                                            </Paper>
                                        )
                                    }
                                    </React.Fragment>
                                </React.Fragment>
                            )
                        }
                        </React.Fragment>
                    </Paper>
                </Paper>
            ) : access === null ? (
                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <CircularProgress style={{ color: "#2074d4" }} />
                        <Typography style={{ marginTop: 15 }}>Cargando</Typography>
                    </Paper>
                </Paper>
            ) : access === undefined ? (
                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <React.Fragment>
                        {
                            errorCode !== null && (
                                <React.Fragment>
                                    <Typography style={{ textAlign: "center" }}>
                                    {
                                        errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente o bien"
                                        ) : (
                                            "Ha ocurrido un error al verificar el acceso, intentelo nuevamente"
                                        )
                                    }
                                    </Typography>

                                    <React.Fragment>
                                    {
                                        errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                            <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                <Button onClick={async () => await handleGetAccess()} style={{ color: "#2074d4" }}>
                                                    <Typography variant="button">Recargar Acceso</Typography>
                                                </Button>
                                            </Paper>
                                        )
                                    }
                                    </React.Fragment>
                                </React.Fragment>
                            )
                        }
                        </React.Fragment>

                        <React.Fragment>
                        {
                            errorCode !== null && errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetAccess()}>
                                    <Typography variant="button">Recargar Acceso</Typography>
                                </Button>
                            )
                        }
                        </React.Fragment>
                    </Paper>
                </Paper>
            ) : (
                <React.Fragment>
                    <Paper variant="outlined" itemType="div" style={{ padding: 20, marginBottom: 15 }}>
                        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                            <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                                Home
                            </Link>
                            <Typography style={{ color: "#2074d4" }}>Foro</Typography>
                        </Breadcrumbs>
                    </Paper>

                    <Paper elevation={0} itemType="div">
                        <Card variant="outlined">
                            <CardContent>
                                <Paper elevation={0} itemType="div" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 15 }}>
                                    <Typography component="p" variant="h5">Todas las Preguntas</Typography>

                                    <React.Fragment>
                                    {
                                        Decrypt(access) === "student" && (
                                            <Button onClick={handleOpenNewQuestionDialog}>
                                                <Typography variant="button">Añadir Pregunta</Typography> 
                                            </Button>
                                        )
                                    }
                                    </React.Fragment>
                                </Paper>

                                <Paper elevation={0} itemType="div" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                    <React.Fragment>
                                    {
                                        loadingQuestions === true ? (
                                            <CircularProgress style={{ color: "#2074d4" }} />
                                        ) : errorQuestions === true ? (
                                            <Typography>0 Preguntas</Typography>
                                        ) : questions === null ? (
                                            <CircularProgress style={{ color: "#2074d4" }} />
                                        ) : questions === undefined ? (
                                            <Typography>0 Preguntas</Typography>
                                        ) : (
                                            <Typography>{ `${questions.length} Preguntas` }</Typography>
                                        )
                                    }
                                    </React.Fragment>

                                    <Button startIcon={<FilterList />} style={{ color: "#2074d4" }} onClick={handleOpenFilterDialog}>
                                        <Typography variant="button">Filtrar Preguntas</Typography> 
                                    </Button>        
                                </Paper>
                
                                <Divider />

                                <React.Fragment>
                                {
                                    loadingQuestions === true ? (
                                        <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(2% + 10px)" }}>
                                            <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                <Typography style={{ marginTop: 15 }}>Cargando Preguntas</Typography>
                                            </Paper>
                                        </Paper>
                                    ) : errorQuestions === true ? (
                                        <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(2% + 15px)" }}>
                                            <Typography style={{ textAlign: "center" }}>
                                            {
                                                errorCode !== null ? (
                                                    errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                        "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                                    ) : errorCode === "NO_QUESTIONS_FORUM" ? (
                                                        "No existen preguntas en el foro, por favor intentelo más tarde"
                                                    ) : (
                                                        "Ha ocurrido un error al obtener las preguntas del foro"
                                                    )
                                                ) : (
                                                    "Ha ocurrido algo inesperado al obtener las preguntas, intentelo nuevamente"
                                                )
                                            }
                                            </Typography>

                                            <React.Fragment>
                                            {
                                                errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                    <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                        <Button onClick={async () => await handleGetQuestions()} style={{ color: "#2074d4" }}>
                                                            <Typography variant="button">Recargar preguntas</Typography>
                                                        </Button>
                                                    </Paper>
                                                )
                                            }
                                            </React.Fragment>
                                        </Paper>
                                    ) : questions === null ? (
                                        <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(2% + 15px)" }}>
                                            <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                <Typography style={{ marginTop: 15 }}>Cargando Preguntas</Typography>
                                            </Paper>
                                        </Paper>
                                    ) : questions === undefined ? (
                                        <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(2% + 15px)" }}>
                                            <Typography style={{ textAlign: "center" }}>
                                            {
                                                errorCode !== null ? (
                                                    errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                        "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                                    ) : errorCode === "NO_QUESTIONS_FORUM" ? (
                                                        "No existen preguntas en el foro, por favor intentelo más tarde"
                                                    ) : (
                                                        "Ha ocurrido un error al obtener las preguntas del foro"
                                                    )
                                                ) : (
                                                    "Ha ocurrido algo inesperado al obtener las preguntas, intentelo nuevamente"
                                                )
                                            }
                                            </Typography>

                                            <React.Fragment>
                                            {
                                                errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                    <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                        <Button onClick={async () => await handleGetQuestions()} style={{ color: "#2074d4" }}>
                                                            <Typography variant="button">Recargar preguntas</Typography>
                                                        </Button>
                                                    </Paper>
                                                )
                                            }
                                            </React.Fragment>
                                        </Paper>
                                    ) : (
                                        <React.Fragment>
                                        {
                                            questions.map(doc => (
                                                <QuestionCard key={doc.id} idUser={doc.uid} access={access} doc={doc} handleGetQuestions={handleGetQuestions} />
                                            ))
                                        }
                                        </React.Fragment>
                                    )
                                }
                                </React.Fragment>
                            </CardContent>
                        </Card>
                    </Paper>

                    <Dialog open={newQuestionDialog} fullScreen={fullScreen} onClose={handleCloseNewQuestionDialog} fullWidth={true} maxWidth="sm" scroll="paper">
                        <DialogTitle>Hacer preguntas en el Foro</DialogTitle>
                        <DialogContent>
                        {
                            loadingPostQuestion === true ? (
                                <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                        <Typography style={{ marginTop: 15 }}>Creando Pregunta en el foro</Typography>
                                    </Paper>
                                </Paper>
                            ) : errorPostQuestion === true ? (
                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(2% + 10px)" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <React.Fragment>
                                        {
                                            errorCode !== null && (
                                                <React.Fragment>
                                                    <Typography style={{ textAlign: "center" }}>
                                                    {
                                                        errorCode === "DATA_SENT_NULL" ? (
                                                            "Verifique que los datos los haya enviado correctamente, porfavor, intentelo nuevamente"
                                                        ) : errorCode === "DATA_SENT_INVALID" ? (
                                                            "Verifique que los datos enviados sean correctos, intentelo nuevamente"
                                                        ) : errorCode === "BODY_SENT_NULL" ? (
                                                            "Verifique que los datos los haya enviado correctamente, porfavor, intentelo nuevamente"
                                                        ) : errorCode === "BAD_TYPE_BODY_VALUES" ? (
                                                            "Verifique los datos enviados, e intentelo nuevamente"
                                                        ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente o bien"
                                                        ) : (
                                                            "Ha ocurrido un error al intentar registrar la pregunta, intentelo nuevamente"
                                                        )
                                                    }
                                                    </Typography>

                                                    <React.Fragment>
                                                    {
                                                        errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                            <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                <Button onClick={() => setErrorPostQuestion(false)} style={{ color: "#2074d4" }}>
                                                                    <Typography variant="button">Intentar Nuevamente</Typography>
                                                                </Button>
                                                            </Paper>
                                                        )
                                                    }
                                                    </React.Fragment>
                                                </React.Fragment>
                                            )
                                        }
                                        </React.Fragment>
                                    </Paper>
                                </Paper>
                            ) : (
                                <React.Fragment>
                                    <DialogContentText>
                                        Completa el formulario para hacer una pregunta en el Foro de ayuda
                                    </DialogContentText>

                                    <ThemeProvider theme={InputTheme}>
                                        <TextField onChange={(e) => setQuestion(e.target.value)} value={question} label="Pregunta" type="text" variant="outlined" fullWidth style={{ marginBottom: 15 }} />
                                        <TextField onChange={(e) => setDescription(e.target.value)} value={description} label="Descripción" type="text" variant="outlined" fullWidth multiline style={{ marginBottom: 15 }} />
                                        
                                        <FormControl variant="outlined" fullWidth>
                                            <InputLabel>Tema</InputLabel>
                                            <Select value={theme} onChange={(e) => setTheme(e.target.value)} label="Tema">
                                            {
                                                myArrayCourses.map((doc, index) => (
                                                    <MenuItem key={index} value={doc}>{doc}</MenuItem>
                                                ))
                                            }
                                            </Select>
                                        </FormControl>
                                    </ThemeProvider>
                                </React.Fragment>
                            )
                        }
                        </DialogContent>
                        <DialogActions>
                        {
                            errorPostQuestion === false && (
                                loadingPostQuestion === true ? (
                                    <Paper elevation={0} style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", padding: 5, marginRight: 15 }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                    </Paper>
                                ) : (
                                    <React.Fragment>
                                        <Button onClick={handleCloseNewQuestionDialog} color="inherit">
                                            Cerrar Ventana
                                        </Button>
                                        <Button onClick={async () => await handleAddQuestion()} style={{ color: "#2074d4"}}>
                                            Añadir Pregunta
                                        </Button>
                                    </React.Fragment>
                                )
                            )
                        }
                        </DialogActions>
                    </Dialog>


                    <Dialog open={filterDialog} fullScreen={fullScreen} onClose={handleCloseFilterDialog} fullWidth={false} maxWidth="xs" scroll="paper">
                        <DialogTitle>Filtrar Preguntas</DialogTitle>
                        <DialogContent>
                        {
                            loadingFilterQuestions === true ? (
                                <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                        <Typography style={{ marginTop: 15 }}>Filtrando Preguntas en el foro</Typography>
                                    </Paper>
                                </Paper>
                            ) : errorFilterQuestions === true ? (
                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(2% + 10px)" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <React.Fragment>
                                        {
                                            errorCode !== null && (
                                                <React.Fragment>
                                                    <Typography style={{ textAlign: "center" }}>
                                                    {
                                                        errorCode === "DATA_SENT_NULL" ? (
                                                            "Verifique que los datos los haya enviado correctamente, porfavor, intentelo nuevamente"
                                                        ) : errorCode === "DATA_SENT_INVALID" ? (
                                                            "Verifique que los datos enviados sean correctos, intentelo nuevamente"
                                                        ) : errorCode === "BODY_SENT_NULL" ? (
                                                            "Verifique que los datos los haya enviado correctamente, porfavor, intentelo nuevamente"
                                                        ) : errorCode === "BAD_TYPE_BODY_VALUES" ? (
                                                            "Verifique los datos enviados, e intentelo nuevamente"
                                                        ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente o bien"
                                                        ) : errorCode === "NO_QUESTIONS_FORUM" ? (
                                                            "No existen preguntas con el tema aplicado"
                                                        ) : (
                                                            "Ha ocurrido un error al intentar filtrar las preguntas, intentelo nuevamente"
                                                        )
                                                    }
                                                    </Typography>

                                                    <React.Fragment>
                                                    {
                                                        errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                            <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                <Button onClick={() => setErrorFilterQuestions(false)} style={{ color: "#2074d4" }}>
                                                                    <Typography variant="button">Intentar Nuevamente</Typography>
                                                                </Button>
                                                            </Paper>
                                                        )
                                                    }
                                                    </React.Fragment>
                                                </React.Fragment>
                                            )
                                        }
                                        </React.Fragment>
                                    </Paper>
                                </Paper>
                            ) : (
                                <React.Fragment>
                                    <Paper elevation={0} itemType="div" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <FormControl component="fieldset">
                                            <FormLabel component="h2">Tema</FormLabel>
                                            <RadioGroup value={filter} onChange={(e) => setFilter(e.target.value)}>
                                                <FormControlLabel value="none" control={<Radio />} label="Ninguno" />
                                                {
                                                    myArrayCourses.map((doc, index) => (
                                                        <FormControlLabel key={index} value={doc} control={<Radio />} label={doc} />
                                                    ))
                                                }
                                            </RadioGroup>
                                        </FormControl>
                                    </Paper>
                                </React.Fragment>
                            )
                        }
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseFilterDialog} color="inherit">
                            <Typography variant="button">Cerrar ventana</Typography>
                            </Button>
                            <Button onClick={async () => await handleGetFilteredQuestions()} style={{ color: "#2074d4"}}>
                                <Typography variant="button">Aplicar Filtro</Typography>
                            </Button>
                        </DialogActions>
                    </Dialog>
                </React.Fragment>
            )
        }
        </Paper>
    )
}

export default Forum;