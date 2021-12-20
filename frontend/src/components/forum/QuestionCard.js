import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button, Card, CardContent, CardHeader, CircularProgress, Dialog, Divider, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Paper, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { Delete, Edit } from '@material-ui/icons';
import { blue } from '@material-ui/core/colors';

import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';

import moment from 'moment';
import axios from 'axios';
import { showMessage } from '../../helpers/message/handleMessage';

const QuestionCard = ({ idUser, access, doc, handleGetQuestions }) => {
    // uses
    const themeApp = useTheme();
    const fullScreen = useMediaQuery(themeApp.breakpoints.down('sm'));


    moment.locale('es', {
        months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
        monthsShort: 'Enero._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.'.split('_'),
        weekdays: 'Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sabado'.split('_'),
        weekdaysShort: 'Dom._Lun._Mar._Mier._Jue._Vier._Sab.'.split('_'),
        weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sa'.split('_')
    });


    // useStates
    const [deleteQuestionDialog, setDeleteQuestionDialog] = useState(false);

    const [loadingDeleteQuestion, setLoadingDeleteQuestion] = useState(false);
    const [errorDeleteQuestion, setErrorDeleteQuestion] = useState(false);
    const [errorCode, setErrorCode] = useState(null);

    const [selectedQuestion, setSelectedQuestion] = useState(null);

    
    // useCallbacks
    const handleOpenDeleteQuestionDialog = useCallback(
        (question) => {
            setSelectedQuestion(question);
            setDeleteQuestionDialog(true);
        },
        [setSelectedQuestion, setDeleteQuestionDialog],
    );
    const handleCloseDeleteQuestionDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setSelectedQuestion(null);
            return setDeleteQuestionDialog(false);
        },
        [setDeleteQuestionDialog, setSelectedQuestion],
    );

    const handleDeleteQuestion = useCallback(
        async () => {
            if (selectedQuestion === null || selectedQuestion.id === null)
            {
                return;
            }

            setLoadingDeleteQuestion(true);

            await axios.delete(`${process.env.REACT_APP_API_URI}/delete-question`, {
                params: {
                    questionIdParam: Encrypt(selectedQuestion.id),
                }
            })
            .then(async result => {
                console.log(result);
                
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    handleCloseDeleteQuestionDialog();
                    setLoadingDeleteQuestion(false);
                    setErrorDeleteQuestion(false);
                    setErrorCode(null);

                    await handleGetQuestions();
                    showMessage(result.data.message, result.data.type);
                }
                else
                {
                    setLoadingDeleteQuestion(false);
                    setErrorDeleteQuestion(true);
                    setErrorCode(result.data.code);
                }
            })
            .catch(error => {
                setLoadingDeleteQuestion(false);
                setErrorDeleteQuestion(true);
                setErrorCode("DELETE_QUESTION_ERROR");

                if (error.response)
                {    
                    console.log(error.response);
                    // showMessage(result.data.message, result.data.type);
                }
            })
            .finally(() => {
                return () => {
                    setLoadingDeleteQuestion(null);
                    setErrorDeleteQuestion(null);
                    setErrorCode(null);
                }
            });
        },
        [selectedQuestion, handleGetQuestions, setLoadingDeleteQuestion, setErrorDeleteQuestion, setErrorCode, handleCloseDeleteQuestionDialog],
    );


    return (
        <React.Fragment>
            <Card style={{ marginTop: 15 }} variant="outlined">
                <CardHeader action={
                    Decrypt(access) === "admin" && (
                        <Tooltip title={<Typography>Eliminar Pregunta</Typography>}>{/** AQUI DEBO HACER ELIMINACIÓN LOGIA Y EDITAR COMO ALUMNO PROPIETARIO */}
                            <IconButton onClick={() => handleOpenDeleteQuestionDialog(doc)}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    ) }
                    
                    title={
                        <Link to={`forum/${doc.id}`} style={{ textDecoration: 'none', color: blue[500] }} security="true">
                            <Typography variant="h5" component="p">{doc.data.question}</Typography>
                        </Link>}

                    subheader={
                        <Typography>{`Creado el ${moment(new Date(doc.data.created_at._seconds * 1000)).format("D [de] MMMM [de] gggg[, a las ] HH:mm")} ${doc.data.name !== null ? `por ${Decrypt(doc.data.name)} ${Decrypt(doc.data.surname)}` : ``}`}</Typography>
                    } />
                <CardContent>
                    <Typography variant="body2" color="textSecondary" component="p">{doc.data.description}</Typography>
                </CardContent>
            </Card>

            <Dialog open={deleteQuestionDialog} fullScreen={fullScreen} onClose={handleCloseDeleteQuestionDialog} fullWidth={true} maxWidth="sm" scroll="paper">
                <DialogTitle>Eliminar la pregunta seleccionada</DialogTitle>
                <DialogContent>
                {
                    selectedQuestion === null ? (
                        <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando pregunta seleccionada</Typography>
                            </Paper>
                        </Paper>
                        ) : (
                            <React.Fragment>
                            {
                                loadingDeleteQuestion === true ? (
                                    <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <CircularProgress style={{ color: "#2074d4" }} />
                                            <Typography style={{ marginTop: 15 }}>Eliminando Respuesta en el foro</Typography>
                                        </Paper>
                                    </Paper>
                                ) : errorDeleteQuestion === true ? (
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
                                                            ) : errorCode === "delete-question-comment" ? (
                                                                "No estas autorizado a realizar esta acción"
                                                            ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                                "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente o bien"
                                                            ) : (
                                                                "Ha ocurrido un error al intentar eliminar el comentario, intentelo nuevamente"
                                                            )
                                                        }
                                                        </Typography>

                                                        <React.Fragment>
                                                        {
                                                            errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                    <Button onClick={() => setErrorDeleteQuestion(false)} style={{ color: "#2074d4" }}>
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
                                        <DialogContentText>Esta seguro de eliminar esta pregunta?, este paso es irreversible</DialogContentText>
                                    </React.Fragment>
                                )
                            }
                            </React.Fragment>
                        )
                    }
                    </DialogContent>
                    <DialogActions>
                    {
                        selectedQuestion !== null && (
                                errorDeleteQuestion === false && (
                                    loadingDeleteQuestion === true ? (
                                        <Paper elevation={0} style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", padding: 5, marginRight: 15 }}>
                                            <CircularProgress style={{ color: "#2074d4" }} />
                                        </Paper>
                                    ) : (
                                        <React.Fragment>
                                            <Button color="inherit" onClick={() => handleCloseDeleteQuestionDialog()}>
                                                Cerrar Ventana
                                            </Button>
                                            <Button onClick={async () => await handleDeleteQuestion()} style={{ color: "#2074d4" }}>
                                                Eliminar Respuesta
                                            </Button>
                                        </React.Fragment>
                                    )
                                )
                            )
                        }
                        </DialogActions>
                    </Dialog>
        </React.Fragment>
    )
}

export default QuestionCard