import React, { useCallback, useState, useEffect } from 'react';

import { Button, Card, CardContent, createTheme, Dialog, DialogContent, DialogTitle, Divider, Grid, IconButton, Paper, TextField, Tooltip, Typography, useMediaQuery, useTheme, ThemeProvider, DialogActions, DialogContentText, CircularProgress, List, ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { Delete, Edit, Replay, ThumbDown, ThumbUp } from '@material-ui/icons';
import { blue } from '@material-ui/core/colors';

import { showMessage } from '../../helpers/message/handleMessage';
import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';
import { timeago } from '../../helpers/format/handleFormat';

import moment from 'moment';
import axios from 'axios';

const InputTheme = createTheme({
    palette: {
        primary: {
            main: "#2074d4"
        }
    },
});

const QuestionInfoCard = ({ doc, user, access }) => {
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
    const [loadingLike, setLoadingLike] = useState(false);
    const [loadingDislike, setLoadingDislike] = useState(false);
    const [errorCode, setErrorCode] = useState(null);

    const [loadingQuestionRate, setLoadingQuestionRate] = useState(true);
    const [errorQuestionRate, setErrorQuestionRate] = useState(false);
    const [questionRate, setQuestionRate] = useState(null);

    const [loadingQuestionComments, setLoadingQuestionComments] = useState(true);
    const [errorQuestionComments, setErrorQuestionComments] = useState(false);
    const [questionComments, setQuestionComments] = useState(null);


    const [loadingPostComment, setLoadingPostComment] = useState(false);
    const [errorPostComment, setErrorPostComment] = useState(false);

    const [loadingDeleteComment, setLoadingDeleteComment] = useState(false);
    const [errorDeleteComment, setErrorDeleteComment] = useState(false);

    const [loadingEditComment, setLoadingEditComment] = useState(false);
    const [errorEditComment, setErrorEditComment] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);

    const [commentQuestionDialog, setCommentQuestionDialog] = useState(false);
    const [editCommentQuestionDialog, setEditCommentQuestionDialog] = useState(false);
    const [deleteCommentQuestionDialog, setDeleteCommentQuestionDialog] = useState(false);

    const [comment, setComment] = useState("");

    // useCallbacks
    // Dialogs
    const handleOpenCommentQuestionDialog = useCallback(
        () => {
            setCommentQuestionDialog(true);
        },
        [setCommentQuestionDialog],
    );

    const handleCloseCommentQuestionDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setComment("");
            return setCommentQuestionDialog(false);
        },
        [setCommentQuestionDialog, setComment],
    );


    const handleOpenEditCommentQuestionDialog = useCallback(
        (doc) => {
            setSelectedComment(doc);
            setComment(doc.data.comment);
            setEditCommentQuestionDialog(true);
        },
        [setSelectedComment, setComment, setEditCommentQuestionDialog],
    );

    const handleCloseEditCommentQuestionDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setComment("");
            setSelectedComment(null);
            return setEditCommentQuestionDialog(false);
        },
        [setEditCommentQuestionDialog, setSelectedComment, setComment],
    );


    const handleOpenDeleteCommentQuestionDialog = useCallback(
        (doc) => {
            setSelectedComment(doc);
            setComment(doc.data.comment);
            setDeleteCommentQuestionDialog(true);
        },
        [setSelectedComment, setComment, setDeleteCommentQuestionDialog],
    );

    const handleCloseDeleteCommentQuestionDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setComment("");
            setSelectedComment(null);
            return setDeleteCommentQuestionDialog(false);
        },
        [setDeleteCommentQuestionDialog, setSelectedComment, setComment],
    );


    // Common callbacks
    const handleGetRateQuestion = useCallback(
        async () => {
            if (doc === null || doc.id === null || access === null)
            {
                return;
            }

            setLoadingQuestionRate(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-question-rate`, {
                params: {
                    questionIdParam: Encrypt(doc.id),
                    rateParam: Encrypt(access)
                }
            })
            .then(async result => {
                console.log("RESULTADO", result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setQuestionRate(Decrypt(result.data.data));
                    setErrorQuestionRate(false);
                    setErrorCode(null);
                    
                    return setLoadingQuestionRate(false);
                }
                if (result.status === 200 && result.data.code === "NO_RATES_QUESTION")
                {
                    setQuestionRate([]);
                    setErrorQuestionRate(false);
                    setErrorCode(null);

                    return setLoadingQuestionRate(false);
                }
                else
                {
                    setQuestionRate(undefined);
                    setErrorQuestionRate(true);
                    setErrorCode(result.data.code);

                    return setLoadingQuestionRate(false);
                }
            })
            .catch(error => {
                setQuestionRate(undefined);
                setErrorQuestionRate(true);

                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode(error.response.data.code); 
                }
                else
                {
                    setErrorCode("GET_QUESTION_RATE_ERROR");
                }

                setLoadingQuestionRate(false);
            })
            .finally(() => {
                return () => {
                    setLoadingQuestionRate(null);
                    setErrorQuestionRate(null);
                    setQuestionRate(null);
                    setErrorCode(null);
                }
            });
        },
        [doc, access, setLoadingQuestionRate, setErrorQuestionRate, setQuestionRate, setErrorCode],
    );

    const handleLikeQuestion = useCallback(
        async () => {
            if (doc === null || doc.id === null)
            {
                return;
            }

            setLoadingLike(true);

            await axios.post(`${process.env.REACT_APP_API_URI}/post-like-question`, {
                questionIdParam: Encrypt(doc.id)
            })
            .then(async result => {
                if (result.status === 201 && result.data.code === "PROCESS_OK")
                {
                    await handleGetRateQuestion();
                    setLoadingLike(false);
                    showMessage(result.data.message, result.data.type);
                }
                else
                {
                    setLoadingLike(false);
                    showMessage(result.data.message, result.data.type);
                }
            })
            .catch(error => {
                setLoadingLike(false);

                if (error.response)
                {
                    console.log(error.response);
                    // showMessage(result.data.message, result.data.type);
                }
            })
            .finally(() => {
                return () => {
                    setLoadingLike(null);
                }
            });
        },
        [doc, setLoadingLike, handleGetRateQuestion],
    );

    const handleDislikeQuestion = useCallback(
        async () => {
            if (doc === null || doc.id === null)
            {
                return;
            }

            setLoadingDislike(true);

            await axios.post(`${process.env.REACT_APP_API_URI}/post-dislike-question`, {
                questionIdParam: Encrypt(doc.id)
            })
            .then(async result => {
                if (result.status === 201 && result.data.code === "PROCESS_OK")
                {
                    await handleGetRateQuestion();
                    setLoadingDislike(false);
                    showMessage(result.data.message, result.data.type);
                }
                else
                {
                    setLoadingDislike(false);
                    showMessage(result.data.message, result.data.type);
                }
            })
            .catch(error => {
                setLoadingDislike(false);

                if (error.response)
                {
                    console.log(error.response);
                    // showMessage(result.data.message, result.data.type);
                }
            })
            .finally(() => {
                return () => {
                    setLoadingDislike(null);
                }
            });
        },
        [doc, setLoadingDislike, handleGetRateQuestion],
    );

    const handleGetCommentsQuestion = useCallback(
        async () => {
            if (doc === null || doc.id === null)
            {
                return;
            }

            setLoadingQuestionComments(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-question-comments`, {
                params: {
                    questionIdParam: Encrypt(doc.id)
                }
            })
            .then(async result => {
                console.log("RESULTADO", result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setQuestionComments(Decrypt(result.data.data));
                    setErrorQuestionComments(false);
                    setErrorCode(null);
                }
                else
                {
                    setQuestionComments(undefined);
                    setErrorQuestionComments(true);
                    setErrorCode(result.data.code);
                }

                setLoadingQuestionComments(false);
            })
            .catch(error => {
                setQuestionComments(undefined);
                setErrorQuestionComments(true);

                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode(error.response.data.code); 
                }
                else
                {
                    setErrorCode("GET_QUESTION_COMMENTS_ERROR");
                }

                setLoadingQuestionComments(false);
            })
            .finally(() => {
                return () => {
                    setLoadingQuestionComments(null);
                    setErrorQuestionComments(null);
                    setQuestionComments(null);
                    setErrorCode(null);
                }
            });
        },
        [doc, setLoadingQuestionComments, setErrorQuestionComments, setQuestionComments, setErrorCode],
    );

    const handlePostQuestionComment = useCallback(
        async () => {
            if (doc === null || doc.id === null)
            {
                return;
            }

            if (comment === "" || comment === null)
            {
                return showMessage("Complete el campo comentario", "info");
            }

            setLoadingPostComment(true);

            let objectPost = {
                comment: comment
            }

            await axios.post(`${process.env.REACT_APP_API_URI}/post-question-comment`, {
                objectData: Encrypt(objectPost)
            }, {
                params: {
                    questionIdParam: Encrypt(doc.id)
                }
            })
            .then(async result => {
                if (result.status === 201 && result.data.code === "PROCESS_OK")
                {
                    await handleGetCommentsQuestion();
                    setLoadingPostComment(false);
                    setErrorPostComment(false);
                    setErrorCode(null);

                    handleCloseCommentQuestionDialog();
                    showMessage(result.data.message, result.data.type);
                }
                else
                {
                    setLoadingPostComment(false);
                    setErrorPostComment(true);
                    setErrorCode(result.data.code);
                }
            })
            .catch(error => {
                setLoadingPostComment(false);
                setErrorPostComment(true);
                setErrorCode("POST_COMMENT_QUESTION_ERROR");

                if (error.response)
                {    
                    console.log(error.response);
                    // showMessage(result.data.message, result.data.type);
                }
            })
            .finally(() => {
                return () => {
                    setLoadingPostComment(null);
                    setErrorPostComment(null);
                    setErrorCode(null);
                }
            });
        },
        [doc, comment, handleGetCommentsQuestion, setLoadingPostComment, setErrorPostComment, setErrorCode, handleCloseCommentQuestionDialog],
    );

    const handlePutQuestionComment = useCallback(
        async () => {
            if (doc === null || doc.id === null || selectedComment === null)
            {
                return;
            }

            if (comment === "" || comment === " " || comment === null)
            {
                return showMessage("Complete el campo comentario", "info");
            }

            setLoadingEditComment(true);

            let objectPost = {
                comment: comment
            }

            await axios.put(`${process.env.REACT_APP_API_URI}/put-question-comment`, {
                objectData: Encrypt(objectPost)
            }, {
                params: {
                    questionIdParam: Encrypt(doc.id),
                    commentIdParam: Encrypt(selectedComment.id)
                }
            })
            .then(async result => {
                if (result.status === 201 && result.data.code === "PROCESS_OK")
                {
                    handleCloseEditCommentQuestionDialog();
                    setLoadingEditComment(false);
                    setErrorEditComment(false);
                    setErrorCode(null);

                    await handleGetCommentsQuestion();
                    showMessage(result.data.message, result.data.type);
                }
                else
                {
                    setLoadingEditComment(false);
                    setErrorEditComment(true);
                    setErrorCode(result.data.code);
                }
            })
            .catch(error => {
                setLoadingEditComment(false);
                setErrorEditComment(true);
                setErrorCode("EDIT_COMMENT_QUESTION_ERROR");

                if (error.response)
                {    
                    console.log(error.response);
                    // showMessage(result.data.message, result.data.type);
                }
            })
            .finally(() => {
                return () => {
                    setLoadingEditComment(null);
                    setErrorEditComment(null);
                    setErrorCode(null);
                }
            });
        },
        [doc, comment, selectedComment, handleGetCommentsQuestion, setLoadingEditComment, setErrorEditComment, setErrorCode, handleCloseEditCommentQuestionDialog],
    );

    const handleDeleteQuestionComment = useCallback(
        async () => {
            if (doc === null || doc.id === null || selectedComment === null)
            {
                return;
            }

            setLoadingDeleteComment(true);

            await axios.delete(`${process.env.REACT_APP_API_URI}/delete-question-comment`, {
                params: {
                    questionIdParam: Encrypt(doc.id),
                    commentIdParam: Encrypt(selectedComment.id)
                }
            })
            .then(async result => {
                console.log(result);
                
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    handleCloseDeleteCommentQuestionDialog();
                    setLoadingDeleteComment(false);
                    setErrorDeleteComment(false);
                    setErrorCode(null);

                    await handleGetCommentsQuestion();
                    showMessage(result.data.message, result.data.type);
                }
                else
                {
                    setLoadingDeleteComment(false);
                    setErrorDeleteComment(true);
                    setErrorCode(result.data.code);
                }
            })
            .catch(error => {
                setLoadingDeleteComment(false);
                setErrorDeleteComment(true);
                setErrorCode("DELETE_COMMENT_QUESTION_ERROR");

                if (error.response)
                {    
                    console.log(error.response);
                    // showMessage(result.data.message, result.data.type);
                }
            })
            .finally(() => {
                return () => {
                    setLoadingDeleteComment(null);
                    setErrorDeleteComment(null);
                    setErrorCode(null);
                }
            });
        },
        [doc, selectedComment, handleGetCommentsQuestion, setLoadingDeleteComment, setErrorDeleteComment, setErrorCode, handleCloseDeleteCommentQuestionDialog],
    );

    
    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            await handleGetRateQuestion();
        }

        if (doc !== null)
        {
            callQuery();
        
            return () => {
                setLoadingQuestionRate(null);
                setErrorQuestionRate(null);
                setQuestionRate(null);
                setErrorCode(null);
            }
        }
    }, [doc, handleGetRateQuestion, setLoadingQuestionRate, setErrorQuestionRate, setQuestionRate, setErrorCode]);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetCommentsQuestion();
        }

        if (doc !== null)
        {
            callQuery();
        
            return () => {
                setLoadingQuestionComments(null);
                setErrorQuestionComments(null);
                setQuestionComments(null);
                setErrorCode(null);
            }
        }
    }, [doc, handleGetCommentsQuestion, setLoadingQuestionComments, setErrorQuestionComments, setQuestionComments, setErrorCode]);


    return (
        <React.Fragment>
            <Card style={{ marginBottom: 15 }} variant="outlined">
                <CardContent>
                    <Typography component="p" variant="h5">{doc.data.question}</Typography>
                    <Typography style={{ marginTop: 5, marginBottom: 15 }}>{`Preguntado ${timeago(new Date(doc.data.created_at._seconds * 1000))}`}</Typography>
                
                    <Divider style={{ marginBottom: 15 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={1}>
                        {
                            loadingLike === true || loadingDislike === true ? (
                                <Paper elevation={0} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                    <Paper elevation={0} style={{ marginTop: 60, display: 'inline-flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                    </Paper>
                                </Paper>
                            ) : loadingQuestionRate === true ? (
                                <Paper elevation={0} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                    <Paper elevation={0} style={{ marginTop: 60, display: 'inline-flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                    </Paper>
                                </Paper>
                            ) : errorQuestionRate === true ? (
                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <React.Fragment>
                                        {
                                            errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                <Tooltip title={<Typography>Recargar Contenido</Typography>}>
                                                    <IconButton onClick={async () => await handleGetRateQuestion()}>
                                                        <Replay />
                                                    </IconButton>
                                                </Tooltip>
                                            )
                                        }
                                        </React.Fragment>
                                    </Paper>
                                </Paper>
                            ) : questionRate === null ? (
                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                    </Paper>
                                </Paper>
                            ) : questionRate === undefined ? (
                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <React.Fragment>
                                        {
                                            errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                <Tooltip title={<Typography>Recargar Contenido</Typography>}>
                                                    <IconButton onClick={async () => await handleGetRateQuestion()}>
                                                        <Replay />
                                                    </IconButton>
                                                </Tooltip>
                                            )
                                        }
                                        </React.Fragment>
                                    </Paper>
                                </Paper>
                            ) : (
                                <Paper elevation={0} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                    <React.Fragment>
                                    {
                                        access === "admin" ? (
                                            <Paper elevation={0} style={{ marginBottom: 15, display: 'inline-flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <ThumbUp color="disabled" />
                                            </Paper>
                                        ) : (
                                            <Paper elevation={0} style={{ marginBottom: 15, display: 'inline-flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Tooltip title={<Typography>{questionRate.length > 0 ? questionRate[0].userRate.data.liked === true ? "Ya no me gusta" : "Me gusta" : "Me gusta"}</Typography>} placement="top">
                                                    <IconButton onClick={async () => await handleLikeQuestion()} color={questionRate.length > 0 ? questionRate[0].userRate.data.liked === true ? "primary" : "default" : "default"}>
                                                        <ThumbUp />
                                                    </IconButton>
                                                </Tooltip>
                                            </Paper>
                                        )
                                    }
                                    </React.Fragment>

                                    <Typography>{questionRate.length > 0 ? String(questionRate[0].likedCount - questionRate[0].dislikedCount) : "0"}</Typography>

                                    <React.Fragment>
                                    {
                                        access === "admin" ? (
                                            <Paper elevation={0} style={{ marginTop: 15, display: 'inline-flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <ThumbDown color="disabled" />
                                            </Paper>
                                        ) : (
                                            <Paper elevation={0} style={{ marginTop: 15, display: 'inline-flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Tooltip title={<Typography>{questionRate.length > 0 ? questionRate[0].userRate.data.disliked === true ? "quitar no me gusta" : "No me gusta" : "No me gusta"}</Typography>} placement="bottom">
                                                    <IconButton onClick={async () => await handleDislikeQuestion()} color={questionRate.length > 0 ? questionRate[0].userRate.data.disliked === true ? "primary" : "default" : "default"}>
                                                        <ThumbDown />
                                                    </IconButton>
                                                </Tooltip>
                                            </Paper>
                                        )
                                    }
                                    </React.Fragment>
                                </Paper>
                            )
                        }
                        </Grid>

                        <Grid item xs={11}>
                            <Typography>{doc.data.description}</Typography>
                        </Grid>

                        <Grid item xs={12} style={{ marginLeft: 15, marginRight: 15, display: 'flex', flexDirection: 'row' }}>
                            <Paper variant="outlined" style={{ width: 'fit-content', padding: 5, paddingLeft: 10, paddingRight: 10, marginLeft: 'auto' }}>
                                <Typography>{`Preguntado en el día ${moment(new Date(doc.data.created_at._seconds * 1000)).format("D [de] MMMM [de] gggg[, a las ] HH:mm")}`}</Typography>
                                <Typography>{`${Decrypt(user.data.name)} ${Decrypt(user.data.surname)}`}</Typography>                                                  
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                        {
                            loadingQuestionComments === true ? (
                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(2% + 15px" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                        <Typography style={{ marginTop: 15 }}>Cargando Comentarios de la pregunta</Typography>
                                    </Paper>
                                </Paper>
                            ) : errorQuestionComments === true ? (
                                <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(2% + 15px)" }}>
                                    <Typography style={{ textAlign: "center" }}>
                                    {
                                        errorCode !== null ? (
                                            errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                            ) : errorCode === "NO_COMMENTS_QUESTION" ? (
                                                "No existen comentarios en la pregunta, por favor intentelo más tarde"
                                            ) : (
                                                "Ha ocurrido algo inesperado al obtener los comentarios, intentelo nuevamente"
                                            )
                                        ) : (
                                            "Ha ocurrido algo inesperado al obtener los comentarios, intentelo nuevamente"
                                        )
                                    }
                                    </Typography>

                                    <React.Fragment>
                                    {
                                        errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                            <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                <Button onClick={async () => await handleGetCommentsQuestion()} style={{ color: "#2074d4" }}>
                                                    <Typography variant="button">Recargar comentarios</Typography>
                                                </Button>
                                            </Paper>
                                        )
                                    }
                                    </React.Fragment>
                                </Paper>
                            ) : questionComments === null ? (
                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(2% + 15px)" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                        <Typography style={{ marginTop: 15 }}>Cargando Comentarios de la pregunta</Typography>
                                    </Paper>
                                </Paper>
                            ) : questionComments === undefined ? (
                                <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(2% + 15px)" }}>
                                    <Typography style={{ textAlign: "center" }}>
                                    {
                                        errorCode !== null ? (
                                            errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                            ) : errorCode === "NO_COMMENTS_QUESTION" ? (
                                                "No existen comentarios en la pregunta, por favor intentelo más tarde"
                                            ) : (
                                                "Ha ocurrido algo inesperado al obtener los comentarios, intentelo nuevamente"
                                            )
                                        ) : (
                                            "Ha ocurrido algo inesperado al obtener los comentarios, intentelo nuevamente"
                                        )
                                    }
                                    </Typography>

                                    <React.Fragment>
                                    {
                                        errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                            <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                <Button onClick={async () => await handleGetCommentsQuestion()} style={{ color: "#2074d4" }}>
                                                    <Typography variant="button">Recargar comentarios</Typography>
                                                </Button>
                                            </Paper>
                                        )
                                    }
                                    </React.Fragment>
                                </Paper>
                            ) : (
                                <React.Fragment>
                                    <Divider style={{ marginTop: 15 }} />

                                    <List>
                                    {
                                        questionComments.map(doc => (
                                            <Paper key={doc.id} elevation={0} itemType="div">
                                                <ListItem style={{ width: '100%' }}>
                                                    <ListItemText 
                                                        primary={
                                                            <Paper elevation={0} itemType="div" style={{ display: 'inline-flex' }}>
                                                                <Typography>{doc.data.comment}</Typography>
                                                                <Typography style={{ color: blue[500], marginLeft: 10 }}>{`${Decrypt(doc.data.name)} ${Decrypt(doc.data.surname)}`}</Typography>
                                                            </Paper>} 

                                                        secondary={` - ${moment(new Date(doc.data.created_at._seconds * 1000)).format("D [de] MMMM [de] gggg[, a las ] HH:mm")}`} security="true" />

                                                    <ListItemSecondaryAction>
                                                    {
                                                        access === "admin" ? (
                                                            <Tooltip title={<Typography>Eliminar Comentario</Typography>}>
                                                                <IconButton onClick={() => handleOpenDeleteCommentQuestionDialog(doc)}>
                                                                    <Delete />
                                                                </IconButton>
                                                            </Tooltip>
                                                        ) : access === "student" && doc.data.created_by === doc.uid ? (
                                                            <Tooltip title={<Typography>Editar Pregunta</Typography>}>
                                                                <IconButton onClick={() => handleOpenEditCommentQuestionDialog(doc)}>
                                                                    <Edit />
                                                                </IconButton>
                                                            </Tooltip>
                                                        ) : (
                                                            <React.Fragment>
                                                            </React.Fragment>
                                                        )
                                                    }
                                                    </ListItemSecondaryAction>
                                                </ListItem>

                                                <Divider />
                                            </Paper>
                                        ))
                                    }
                                    </List>
                                </React.Fragment>
                            )
                        }
                        </Grid>
                        
                        <React.Fragment>
                        {
                            access !== "admin" && (
                                <Grid item xs={12} style={{ marginLeft: 15, marginRight: 15, display: 'flex', flexDirection: 'row' }}>
                                    <Button variant="text" onClick={handleOpenCommentQuestionDialog} style={{ color: "#2074d4" }}>Añade un comentario</Button>
                                </Grid>
                            )
                        }
                        </React.Fragment>
                    </Grid>
                </CardContent>
            </Card>

            <Dialog open={commentQuestionDialog} fullScreen={fullScreen} onClose={handleCloseCommentQuestionDialog} fullWidth={true} maxWidth="sm" scroll="paper">
                <DialogTitle>Nuevo comentario en la pregunta "{doc.data.question}"</DialogTitle>
                <DialogContent>
                {
                    loadingPostComment === true ? (
                        <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Creando Comentario en el foro</Typography>
                            </Paper>
                        </Paper>
                    ) : errorPostComment === true ? (
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
                                                    "Ha ocurrido un error al intentar crear el comentario, intentelo nuevamente"
                                                )
                                            }
                                            </Typography>

                                            <React.Fragment>
                                            {
                                                errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                    <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                        <Button onClick={() => setErrorPostComment(false)} style={{ color: "#2074d4" }}>
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
                            <DialogContentText>Llena el formulario para añadir un comentario a esta pregunta</DialogContentText>
                    
                            <ThemeProvider theme={InputTheme}>
                                <TextField value={comment} label="Comentario" type="text" variant="outlined" fullWidth onChange={(e) => setComment(e.target.value)} />
                            </ThemeProvider>
                        </React.Fragment>
                    )
                }
                </DialogContent>
                <DialogActions>
                {
                    errorPostComment === false && (
                        loadingPostComment === true ? (
                            <Paper elevation={0} style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", padding: 5, marginRight: 15 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                            </Paper>
                        ) : (
                            <React.Fragment>
                                <Button color="inherit" onClick={() => handleCloseCommentQuestionDialog(false)}>
                                    Cerrar Ventana
                                </Button>
                                <Button onClick={async () => await handlePostQuestionComment()} style={{ color: "#2074d4" }}>
                                    Añadir Comentario
                                </Button>
                            </React.Fragment>
                        )
                    )
                }
                </DialogActions>
            </Dialog>

            <Dialog open={editCommentQuestionDialog} fullScreen={fullScreen} onClose={handleCloseEditCommentQuestionDialog} fullWidth={true} maxWidth="sm" scroll="paper">
                <DialogTitle>Editar comentario en la pregunta "{doc.data.question}"</DialogTitle>
                <DialogContent>
                {
                    selectedComment === null ? (
                        <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando comentario seleccionado</Typography>
                            </Paper>
                        </Paper>
                    ) : (
                        <React.Fragment>
                        {
                            loadingEditComment === true ? (
                                <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                        <Typography style={{ marginTop: 15 }}>Editando Comentario en el foro</Typography>
                                    </Paper>
                                </Paper>
                            ) : errorEditComment === true ? (
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
                                                            "Ha ocurrido un error al intentar editar el comentario, intentelo nuevamente"
                                                        )
                                                    }
                                                    </Typography>

                                                    <React.Fragment>
                                                    {
                                                        errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                            <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                <Button onClick={() => setErrorEditComment(false)} style={{ color: "#2074d4" }}>
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
                                    <DialogContentText>Llena el formulario para editar el comentario seleccionado de esta pregunta</DialogContentText>
                                    
                                    <ThemeProvider theme={InputTheme}>
                                        <TextField value={comment} label="Comentario" type="text" variant="outlined" fullWidth onChange={(e) => setComment(e.target.value)} />
                                    </ThemeProvider>
                                </React.Fragment>
                            )
                        }
                        </React.Fragment>
                    )
                }
                </DialogContent>
                <DialogActions>
                {
                    selectedComment !== null && (
                        errorEditComment === false && (
                            loadingEditComment === true ? (
                                <Paper elevation={0} style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", padding: 5, marginRight: 15 }}>
                                    <CircularProgress style={{ color: "#2074d4" }} />
                                </Paper>
                            ) : (
                                <React.Fragment>
                                    <Button color="inherit" onClick={() => handleCloseEditCommentQuestionDialog(false)}>
                                        Cerrar Ventana
                                    </Button>
                                    <Button onClick={async () => await handlePutQuestionComment()} style={{ color: "#2074d4" }}>
                                        Editar Comentario
                                    </Button>
                                </React.Fragment>
                            )
                        )
                    )
                }
                </DialogActions>
            </Dialog>

            <Dialog open={deleteCommentQuestionDialog} fullScreen={fullScreen} onClose={handleCloseDeleteCommentQuestionDialog} fullWidth={true} maxWidth="sm" scroll="paper">
                <DialogTitle>Eliminar comentario en la pregunta "{doc.data.question}"</DialogTitle>
                <DialogContent>
                {
                    selectedComment === null ? (
                        <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando comentario seleccionado</Typography>
                            </Paper>
                        </Paper>
                    ) : (
                        <React.Fragment>
                        {
                            loadingDeleteComment === true ? (
                                <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                        <Typography style={{ marginTop: 15 }}>Eliminando Comentario en el foro</Typography>
                                    </Paper>
                                </Paper>
                            ) : errorDeleteComment === true ? (
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
                                                                <Button onClick={() => setErrorDeleteComment(false)} style={{ color: "#2074d4" }}>
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
                                    <DialogContentText>Esta seguro de eliminar este comentario?, este paso es irreversible</DialogContentText>
                                </React.Fragment>
                            )
                        }
                        </React.Fragment>
                    )
                }
                </DialogContent>
                <DialogActions>
                {
                    selectedComment !== null && (
                        errorDeleteComment === false && (
                            loadingDeleteComment === true ? (
                                <Paper elevation={0} style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", padding: 5, marginRight: 15 }}>
                                    <CircularProgress style={{ color: "#2074d4" }} />
                                </Paper>
                            ) : (
                                <React.Fragment>
                                    <Button color="inherit" onClick={() => handleCloseDeleteCommentQuestionDialog(false)}>
                                        Cerrar Ventana
                                    </Button>
                                    <Button onClick={async () => await handleDeleteQuestionComment()} style={{ color: "#2074d4" }}>
                                        Eliminar Comentario
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

export default QuestionInfoCard;