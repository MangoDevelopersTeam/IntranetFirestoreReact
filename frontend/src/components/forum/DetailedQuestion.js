import React, { useCallback, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { CircularProgress, Paper, Typography, Button, Breadcrumbs, Card, CardContent, createTheme, ThemeProvider, TextField, Divider } from '@material-ui/core';
import { NavigateNext } from '@material-ui/icons';

import { Encrypt, Decrypt } from '../../helpers/cipher/cipher';
import { showMessage } from '../../helpers/message/handleMessage';

import AnswerCard from './AnswerCard';
import QuestionInfoCard from './QuestionInfoCard';

import axios from 'axios';


const InputTheme = createTheme({
    palette: {
        primary: {
            main: "#2074d4"
        }
    },
});

const DetailedQuestion = () => {
    // uses
    const { idQuestion } = useParams();


    // useStates
    const [detailedQuestion, setDetailedQuestion] = useState(null);
    const [errorDetailedQuestion, setErrorDetailedQuestion] = useState(false);
    const [loadingDetailedQuestion, setLoadingDetailedQuestion] = useState(true);
    const [errorCode, setErrorCode] = useState(null);

    const [access, setAccess] = useState(null);
    const [errorAccess, setErrorAccess] = useState(false);
    const [loadingAccess, setLoadingAccess] = useState(true);

    const [userQuestion, setUserQuestion] = useState(null);
    const [errorUserQuestion, setErrorUserQuestion] = useState(false);
    const [loadingUserQuestion, setLoadingUserQuestion] = useState(true);

    const [loadingPostAnswer, setLoadingPostAnswer] = useState(false);
    const [errorPostAnswer, setErrorPostAnswer] = useState(false);
    const [answer, setAnswer] = useState("");

    const [loadingQuestionAnswers, setLoadingQuestionAnswers] = useState(true);
    const [errorQuestionAnswers, setErrorQuestionAnswers] = useState(false);
    const [questionAnswers, setQuestionAnswers] = useState(null);


    // useCallbacks
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

    const handleGetQuestionInfo = useCallback(
        async () => {
            if (idQuestion === null)
            {
                return;
            }

            setLoadingDetailedQuestion(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-detailed-question`, {
                params: {
                    questionIdParam: Encrypt(idQuestion)
                }
            })
            .then(result => {
                console.log("Detalle=> ", result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    console.log(Decrypt(result.data.data));
                    setDetailedQuestion(Decrypt(result.data.data));
                    setErrorDetailedQuestion(false);
                    setErrorCode(null);
                }
                else
                {
                    setDetailedQuestion(undefined);
                    setErrorDetailedQuestion(true);
                    setErrorCode(result.data.code);
                }

                setLoadingDetailedQuestion(false);
            })
            .catch(error => {
                setDetailedQuestion(undefined);
                setErrorDetailedQuestion(true);

                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode(error.response.data.code); 
                }
                else
                {
                    setErrorCode("GET_ANNOTATIONS_ERROR");
                }

                setLoadingDetailedQuestion(false);
            })
            .finally(() => {
                return () => {
                    setLoadingDetailedQuestion(null);
                    setErrorDetailedQuestion(null);
                    setErrorCode(null);
                    setDetailedQuestion(null);
                }
            });
        },
        [idQuestion, setDetailedQuestion, setErrorCode, setErrorDetailedQuestion, setLoadingDetailedQuestion],
    );

    const handleGetUserQuestionInfo = useCallback(
        async () => {
            if (detailedQuestion === null || detailedQuestion === undefined)
            {
                return;
            }

            setLoadingUserQuestion(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-user-info`, {
                params: {
                    idUserParam : Encrypt(detailedQuestion[0].data.created_by)
                }
            })
            .then(result => {
                console.log("Detalle=> ", result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    console.log("el usuaruo es =>>", Decrypt(result.data.data));
                    setUserQuestion(Decrypt(result.data.data));
                    setErrorUserQuestion(false);
                    setErrorCode(null);
                }
                else
                {
                    setUserQuestion(undefined);
                    setErrorUserQuestion(true);
                    setErrorCode(result.data.code);
                }

                setLoadingUserQuestion(false);
            })
            .catch(error => {
                setUserQuestion(undefined);
                setErrorUserQuestion(true);

                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode(error.response.data.code); 
                }
                else
                {
                    setErrorCode("GET_ANNOTATIONS_ERROR");
                }

                setLoadingUserQuestion(false);
            })
            .finally(() => {
                return () => {
                    setLoadingUserQuestion(null);
                    setErrorUserQuestion(null);
                    setErrorCode(null);
                    setUserQuestion(null);
                }
            });
        },
        [detailedQuestion, setUserQuestion, setErrorCode, setErrorUserQuestion, setLoadingUserQuestion],
    );



    const handleGetAnswersQuestion = useCallback(
        async () => {
            if (detailedQuestion[0] === null)
            {
                return;
            }

            setLoadingQuestionAnswers(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-question-answers`, {
                params: {
                    questionIdParam: Encrypt(detailedQuestion[0].id)
                }
            })
            .then(async result => {
                console.log("RESULTADO", result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setQuestionAnswers(Decrypt(result.data.data));
                    setErrorQuestionAnswers(false);
                    setErrorCode(null);
                }
                else
                {
                    setQuestionAnswers(undefined);
                    setErrorQuestionAnswers(true);
                    setErrorCode(result.data.code);
                }

                setLoadingQuestionAnswers(false);
            })
            .catch(error => {
                setQuestionAnswers(undefined);
                setErrorQuestionAnswers(true);

                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode(error.response.data.code); 
                }
                else
                {
                    setErrorCode("GET_QUESTION_ANSWERS_ERROR");
                }

                setLoadingQuestionAnswers(false);
            })
            .finally(() => {
                return () => {
                    setLoadingQuestionAnswers(null);
                    setErrorQuestionAnswers(null);
                    setQuestionAnswers(null);
                    setErrorCode(null);
                }
            });
        },
        [detailedQuestion, setLoadingQuestionAnswers, setErrorQuestionAnswers, setQuestionAnswers, setErrorCode],
    );

    const handlePostAnswerComment = useCallback(
        async () => {
            if (detailedQuestion[0] === null)
            {
                return;
            }

            if (answer === "" || answer === null)
            {
                return showMessage("Complete el campo comentario", "info");
            }

            setLoadingPostAnswer(true);

            let objectPost = {
                answer: answer
            }

            await axios.post(`${process.env.REACT_APP_API_URI}/post-question-answer`, {
                objectData: Encrypt(objectPost)
            }, {
                params: {
                    questionIdParam: Encrypt(detailedQuestion[0].id)
                }
            })
            .then(async result => {
                if (result.status === 201 && result.data.code === "PROCESS_OK")
                {
                    await handleGetAnswersQuestion();
                    setLoadingPostAnswer(false);
                    setErrorPostAnswer(false);
                    setErrorCode(null);
                    setAnswer("");

                    showMessage(result.data.message, result.data.type);
                }
                else
                {
                    setLoadingPostAnswer(false);
                    setErrorPostAnswer(true);
                    setErrorCode(result.data.code);
                }
            })
            .catch(error => {
                setLoadingPostAnswer(false);
                setErrorPostAnswer(true);
                setErrorCode("POST_ANSWER_QUESTION_ERROR");

                if (error.response)
                {    
                    console.log(error.response);
                    // showMessage(result.data.message, result.data.type);
                }
            })
            .finally(() => {
                return () => {
                    setLoadingPostAnswer(null);
                    setErrorPostAnswer(null);
                    setErrorCode(null);
                }
            });
        },
        [detailedQuestion, answer, setLoadingPostAnswer, setErrorPostAnswer, setErrorCode, setAnswer, handleGetAnswersQuestion],
    );



    useEffect(() => {
        let callQuery = async () => {
            await handleGetAccess();
        }

        callQuery();

        return () => {
            setAccess(null);
            setErrorAccess(null);
            setLoadingAccess(null);
            setErrorCode(null);
        }
    }, [handleGetAccess, setAccess, setErrorAccess, setLoadingAccess, setErrorCode]);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetQuestionInfo();
        }

        callQuery();

        return () => {
            setDetailedQuestion(null);
            setErrorDetailedQuestion(null);
            setLoadingDetailedQuestion(null);
            setErrorCode(null);
        }
    }, [handleGetQuestionInfo, setDetailedQuestion, setErrorDetailedQuestion, setLoadingDetailedQuestion, setErrorCode]);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetUserQuestionInfo();
        }

        if (detailedQuestion !== null && detailedQuestion !== undefined)
        {
            callQuery();

            return () => {
                setUserQuestion(null);
                setErrorUserQuestion(null);
                setLoadingUserQuestion(null);
                setErrorCode(null);
            }
        }
    }, [detailedQuestion, handleGetUserQuestionInfo, setUserQuestion, setErrorUserQuestion, setLoadingUserQuestion, setErrorCode]);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetAnswersQuestion();
        }

        if (detailedQuestion !== null && detailedQuestion !== undefined)
        {
            callQuery();

            return () => {
                setLoadingQuestionAnswers(null);
                setErrorQuestionAnswers(null);
                setQuestionAnswers(null);
                setErrorCode(null);
            }
        }
    }, [detailedQuestion, handleGetAnswersQuestion, setLoadingQuestionAnswers, setErrorQuestionAnswers, setErrorCode]);


    return (
        <Paper elevation={0} itemType="div">
        {
            loadingAccess === true ? (
                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <CircularProgress style={{ color: "#2074d4" }} />
                        <Typography style={{ marginTop: 15 }}>Cargando acceso</Typography>
                    </Paper>
                </Paper>
            ) : errorAccess === true ? (
                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Typography style={{ textAlign: "center" }}>
                        {
                            errorCode !== null ? (
                                errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                    "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente o bien"
                                ) : (
                                    "Ha ocurrido un error al verificar el acceso, intentelo nuevamente"
                                )
                            ) : (
                                "Ha ocurrido algo inesperado al momento de verificar el acceso, intentelo nuevamente porfavor"
                            )
                        }
                        </Typography>

                        <React.Fragment>
                        {
                            errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetAccess()}>
                                    <Typography variant="button">Recargar Acceso</Typography>
                                </Button>
                            )
                        }
                        </React.Fragment>
                    </Paper>
                </Paper>
            ) : access === null ? (
                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <CircularProgress style={{ color: "#2074d4" }} />
                        <Typography style={{ marginTop: 15 }}>Cargando acceso</Typography>
                    </Paper>
                </Paper>
            ) : access === undefined ? (
                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Typography style={{ textAlign: "center" }}>
                        {
                            errorCode !== null ? (
                                errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                    "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente o bien"
                                ) : (
                                    "Ha ocurrido un error al verificar el acceso, intentelo nuevamente"
                                )
                            ) : (
                                "Ha ocurrido algo inesperado al momento de verificar el acceso, intentelo nuevamente porfavor"
                            )
                        }
                        </Typography>

                        <React.Fragment>
                        {
                            errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
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
                {
                    loadingDetailedQuestion === true ? (
                        <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                            <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando pregunta seleccionada</Typography>
                            </Paper>
                        </Paper>
                    ) : errorDetailedQuestion === true ? (
                        <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                            <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Typography style={{ textAlign: "center" }}>
                                {
                                    errorCode !== null ? (
                                        errorCode === "PARAMS_BAD_FORMATING" ? (
                                            "Asegurese de enviar el identificador correctamente, intentelo nuevamente"
                                        ) : errorCode === "BAD_TYPES_PARAM" ? (
                                            "Verifique que el identificador sea correcto, intentelo nuevamente porfavor"
                                        ) : errorCode === "PARAMS_EMPTY" ? (
                                            "Asegurese de que el identicador se envíe, intentelo nuevamente"
                                        ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente o bien"
                                        ) : (
                                            "Ha ocurrido un error al obtener el detalle de la pregunta, intentelo nuevamente"
                                        )
                                    ) : (
                                        "Ha ocurrido algo inesperado al momento de obtener el detalle de la pregunta, intentelo nuevamente porfavor"
                                    )
                                }
                                </Typography>

                                <React.Fragment>
                                {
                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                        <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetQuestionInfo()}>
                                            <Typography variant="button">Recargar detalle asignatura</Typography>
                                        </Button>
                                    )
                                }
                                </React.Fragment>
                            </Paper>
                        </Paper>
                    ) : detailedQuestion === null ? (
                        <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                            <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando pregunta seleccionada</Typography>
                            </Paper>
                        </Paper>
                    ) : detailedQuestion === undefined ? (
                        <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                            <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Typography style={{ textAlign: "center" }}>
                                {
                                    errorCode !== null ? (
                                        errorCode === "PARAMS_BAD_FORMATING" ? (
                                            "Asegurese de enviar el identificador correctamente, intentelo nuevamente"
                                        ) : errorCode === "BAD_TYPES_PARAM" ? (
                                            "Verifique que el identificador sea correcto, intentelo nuevamente porfavor"
                                        ) : errorCode === "PARAMS_EMPTY" ? (
                                            "Asegurese de que el identicador se envíe, intentelo nuevamente"
                                        ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente o bien"
                                        ) : (
                                            "Ha ocurrido un error al obtener el detalle de la pregunta, intentelo nuevamente"
                                        )
                                    ) : (
                                        "Ha ocurrido algo inesperado al momento de obtener el detalle de la pregunta, intentelo nuevamente porfavor"
                                    )
                                }
                                </Typography>

                                <React.Fragment>
                                {
                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                        <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetQuestionInfo()}>
                                            <Typography variant="button">Recargar detalle asignatura</Typography>
                                        </Button>
                                    )
                                }
                                </React.Fragment>
                            </Paper>
                        </Paper>
                    ) : (
                        <React.Fragment>
                        {
                            loadingUserQuestion === true ? (
                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                        <Typography style={{ marginTop: 15 }}>Cargando Datos de la pregunta</Typography>
                                    </Paper>
                                </Paper>
                            ) : errorUserQuestion === true ? (
                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <Typography style={{ textAlign: "center" }}>
                                        {
                                            errorCode !== null ? (
                                                errorCode === "PARAMS_BAD_FORMATING" ? (
                                                    "Asegurese de enviar el identificador correctamente, intentelo nuevamente"
                                                ) : errorCode === "BAD_TYPES_PARAM" ? (
                                                    "Verifique que el identificador sea correcto, intentelo nuevamente porfavor"
                                                ) : errorCode === "PARAMS_EMPTY" ? (
                                                    "Asegurese de que el identicador se envíe, intentelo nuevamente"
                                                ) : errorCode === "ID_PARAM_NULL" ? (
                                                    "Asegurese de que el identificador este presente, intentelo nuevamente"
                                                ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                    "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente o bien"
                                                ) : (
                                                    "Ha ocurrido un error al obtener el detalle de la pregunta, intentelo nuevamente"
                                                )
                                            ) : (
                                                "Ha ocurrido algo inesperado al momento de obtener información de la pregunta, intentelo nuevamente porfavor"
                                            )
                                        }
                                        </Typography>

                                        <React.Fragment>
                                        {
                                            errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetUserQuestionInfo()}>
                                                    <Typography variant="button">Recargar información de la asignatura</Typography>
                                                </Button>
                                            )
                                        }
                                        </React.Fragment>
                                    </Paper>
                                </Paper>
                            ) : userQuestion === null ? (
                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                        <Typography style={{ marginTop: 15 }}>Cargando Datos de la pregunta</Typography>
                                    </Paper>
                                </Paper>
                            ) : userQuestion === undefined ? (
                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <Typography style={{ textAlign: "center" }}>
                                        {
                                            errorCode !== null ? (
                                                errorCode === "PARAMS_BAD_FORMATING" ? (
                                                    "Asegurese de enviar el identificador correctamente, intentelo nuevamente"
                                                ) : errorCode === "BAD_TYPES_PARAM" ? (
                                                    "Verifique que el identificador sea correcto, intentelo nuevamente porfavor"
                                                ) : errorCode === "PARAMS_EMPTY" ? (
                                                    "Asegurese de que el identicador se envíe, intentelo nuevamente"
                                                ) : errorCode === "ID_PARAM_NULL" ? (
                                                    "Asegurese de que el identificador este presente, intentelo nuevamente"
                                                ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                    "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente o bien"
                                                ) : (
                                                    "Ha ocurrido un error al obtener el detalle de la pregunta, intentelo nuevamente"
                                                )
                                            ) : (
                                                "Ha ocurrido algo inesperado al momento de obtener información de la pregunta, intentelo nuevamente porfavor"
                                            )
                                        }
                                        </Typography>

                                        <React.Fragment>
                                        {
                                            errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetUserQuestionInfo()}>
                                                    <Typography variant="button">Recargar información de la asignatura</Typography>
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
                                            <Link to="/forum" style={{ textDecoration: "none", color: "#333" }}>
                                                Foro
                                            </Link>
                                            <Typography style={{ color: "#2074d4" }}>{detailedQuestion[0].data.question}</Typography>
                                        </Breadcrumbs>
                                    </Paper>

                                    <QuestionInfoCard doc={detailedQuestion[0]} user={userQuestion[0]} access={Decrypt(access)} />
                                    
                                    <Card variant="outlined">
                                        <CardContent>
                                        {
                                            loadingPostAnswer === true ? (
                                                <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                        <CircularProgress style={{ color: "#2074d4" }} />
                                                        <Typography style={{ marginTop: 15 }}>Creando Respuesta en el foro</Typography>
                                                    </Paper>
                                                </Paper>
                                            ) : errorPostAnswer === true ? (
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
                                                                            "Ha ocurrido un error al intentar crear la respuesta, intentelo nuevamente"
                                                                        )
                                                                    }
                                                                    </Typography>

                                                                    <React.Fragment>
                                                                    {
                                                                        errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                                            <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                                <Button onClick={() => setErrorPostAnswer(false)} style={{ color: "#2074d4" }}>
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
                                                {
                                                    Decrypt(access) === "student" && (
                                                        <React.Fragment>
                                                            <Paper elevation={0} itemType="div" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                                                                <Typography component="p" variant="h5">
                                                                    Tu Respuesta
                                                                </Typography>
                                                                <Button variant="outlined" onClick={async () => handlePostAnswerComment()}>
                                                                    <Typography variant="button">Guarda tu respuesta</Typography>
                                                                </Button>
                                                            </Paper>

                                                            <ThemeProvider theme={InputTheme}>
                                                                <TextField value={answer} onChange={(e) => setAnswer(e.target.value)} label="Tu respuesta" type="text" variant="outlined" multiline fullWidth />
                                                            </ThemeProvider>
                                                        </React.Fragment>
                                                    )
                                                }
                                                </React.Fragment>
                                            )
                                        }
                                        </CardContent>
                                    </Card>

                                    <Paper elevation={0} itemType="div" style={{ marginTop: 15 }}>
                                    {
                                        loadingQuestionAnswers === true ? (
                                            <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", padding: 30 }}>
                                                <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <CircularProgress style={{ color: "#2074d4" }} />
                                                    <Typography style={{ marginTop: 15 }}>Cargando Respuestas de la pregunta</Typography>
                                                </Paper>
                                            </Paper>
                                        ) : errorQuestionAnswers ? (
                                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", padding: 30 }}>
                                                <Typography style={{ textAlign: "center" }}>
                                                {
                                                    errorCode !== null ? (
                                                        errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                                        ) : errorCode === "NO_ANSWERS_QUESTION" ? (
                                                            "No existen respuestas en esta pregunta, por favor intentelo nuevamente"
                                                        ) : (
                                                            "Ha ocurrido algo inesperado al obtener las respuestas, intentelo nuevamente"
                                                        )
                                                    ) : (
                                                        "Ha ocurrido algo inesperado al obtener las respuestas, intentelo nuevamente"
                                                    )
                                                }
                                                </Typography>

                                                <React.Fragment>
                                                {
                                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                        <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                            <Button onClick={async () => await handleGetAnswersQuestion()} style={{ color: "#2074d4" }}>
                                                                <Typography variant="button">Recargar Respuestas</Typography>
                                                            </Button>
                                                        </Paper>
                                                    )
                                                }
                                                </React.Fragment>
                                            </Paper>
                                        ) : questionAnswers === null ? (
                                            <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", padding: 30 }}>
                                                <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <CircularProgress style={{ color: "#2074d4" }} />
                                                    <Typography style={{ marginTop: 15 }}>Cargando Respuestas de la pregunta</Typography>
                                                </Paper>
                                            </Paper>
                                        ) : questionAnswers === undefined ? (
                                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", padding: 30 }}>
                                                <Typography style={{ textAlign: "center" }}>
                                                {
                                                    errorCode !== null ? (
                                                        errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                                        ) : errorCode === "NO_ANSWERS_QUESTION" ? (
                                                            "No existen respuestas en esta pregunta, por favor intentelo nuevamente"
                                                        ) : (
                                                            "Ha ocurrido algo inesperado al obtener las respuestas, intentelo nuevamente"
                                                        )
                                                    ) : (
                                                        "Ha ocurrido algo inesperado al obtener las respuestas, intentelo nuevamente"
                                                    )
                                                }
                                                </Typography>

                                                <React.Fragment>
                                                {
                                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                        <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                            <Button onClick={async () => await handleGetAnswersQuestion()} style={{ color: "#2074d4" }}>
                                                                <Typography variant="button">Recargar Respuestas</Typography>
                                                            </Button>
                                                        </Paper>
                                                    )
                                                }
                                                </React.Fragment>
                                            </Paper>
                                        ) : (
                                            <React.Fragment>
                                            {
                                                questionAnswers.map(doc => (
                                                    <AnswerCard key={doc.id} doc={doc} question={detailedQuestion[0]} access={Decrypt(access)} handleGetAnswersQuestion={handleGetAnswersQuestion} />
                                                ))
                                            }
                                            </React.Fragment>
                                        )
                                    }
                                    </Paper>
                                </React.Fragment>
                            )
                        }
                        </React.Fragment>
                    )
                }
                </React.Fragment>
            )
        }
        </Paper>
    );
};

export default DetailedQuestion;