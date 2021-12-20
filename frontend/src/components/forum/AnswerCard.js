import React, { useCallback, useState, useEffect } from 'react'

import { Button, Card, CardContent, CircularProgress, createTheme, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, IconButton, Paper, TextField, Tooltip, Typography, useMediaQuery, useTheme, ThemeProvider, List, ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core'
import { blue } from '@material-ui/core/colors';
import { Delete, Edit, Replay, ThumbDown, ThumbUp } from '@material-ui/icons';

import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';
import { showMessage } from '../../helpers/message/handleMessage';

import axios from 'axios';
import moment from 'moment';

const InputTheme = createTheme({
    palette: {
        primary: {
            main: "#2074d4"
        }
    },
});

const AnswerCard = ({ doc, access, question, handleGetAnswersQuestion }) => {
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

    const [loadingAnswerRate, setLoadingAnswerRate] = useState(true);
    const [errorAnswerRate, setErrorAnswerRate] = useState(false);
    const [answerRate, setAnswerRate] = useState(null);

    const [loadingAnswerComments, setLoadingAnswerComments] = useState(true);
    const [errorAnswerComments, setErrorAnswerComments] = useState(false);
    const [answerComments, setAnswerComments] = useState(null);

    const [commentAnswerDialog, setCommentAnswerDialog] = useState(false);
    const [editCommentAnswerDialog, setEditCommentAnswerDialog] = useState(false);
    const [deleteCommentAnswerDialog, setDeleteCommentAnswerDialog] = useState(false);
    const [deleteAnswerDialog, setDeleteAnswerDialog] = useState(false);


    const [loadingPostComment, setLoadingPostComment] = useState(false);
    const [errorPostComment, setErrorPostComment] = useState(false);

    const [loadingDeleteComment, setLoadingDeleteComment] = useState(false);
    const [errorDeleteComment, setErrorDeleteComment] = useState(false);

    const [loadingDeleteAnswer, setLoadingDeleteAnswer] = useState(false);
    const [errorDeleteAnswer, setErrorDeleteAnswer] = useState(false);

    const [loadingEditComment, setLoadingEditComment] = useState(false);
    const [errorEditComment, setErrorEditComment] = useState(false);

    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [selectedComment, setSelectedComment] = useState(null);

    const [commentAnswer, setCommentAnswer] = useState("");

    
    // Dialogs useCallbacks
    const handleOpenCommentAnswerDialog = useCallback(
        (answer) => {
            setSelectedAnswer(answer);
            setCommentAnswerDialog(true);
        },
        [setCommentAnswerDialog, setSelectedAnswer],
    );
    const handleCloseCommentAnswerDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setCommentAnswer("");
            return setCommentAnswerDialog(false);
        },
        [setCommentAnswerDialog, setCommentAnswer],
    );


    const handleOpenEditCommentAnswerDialog = useCallback(
        (answer, comment) => {
            setSelectedAnswer(answer);
            setSelectedComment(comment);

            setCommentAnswer(comment.data.comment);
            setEditCommentAnswerDialog(true);
        },
        [setSelectedAnswer, setSelectedComment, setCommentAnswer, setEditCommentAnswerDialog],
    );
    const handleCloseEditCommentAnswerDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setCommentAnswer("");
            setSelectedAnswer(null);
            setSelectedComment(null);
            return setEditCommentAnswerDialog(false);
        },
        [setEditCommentAnswerDialog, setSelectedAnswer, setSelectedComment, setCommentAnswer],
    );


    const handleOpenDeleteCommentAnswerDialog = useCallback(
        (answer, comment) => {
            setSelectedAnswer(answer);
            setSelectedComment(comment);

            setCommentAnswer(comment.data.comment);
            setDeleteCommentAnswerDialog(true);
        },
        [setSelectedAnswer, setSelectedComment, setCommentAnswer, setDeleteCommentAnswerDialog],
    );
    const handleCloseDeleteCommentAnswerDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setCommentAnswer("");
            setSelectedAnswer(null);
            setSelectedComment(null);
            return setDeleteCommentAnswerDialog(false);
        },
        [setDeleteCommentAnswerDialog, setSelectedAnswer, setSelectedComment, setCommentAnswer],
    );


    const handleOpenDeleteAnswerDialog = useCallback(
        (answer) => {
            setSelectedAnswer(answer);
            setDeleteAnswerDialog(true);
        },
        [setSelectedAnswer, setDeleteAnswerDialog],
    );
    const handleCloseDeleteAnswerDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setSelectedAnswer(null);
            return setDeleteAnswerDialog(false);
        },
        [setDeleteAnswerDialog, setSelectedAnswer],
    );


    // Common callbacks
    const handleGetRateAnswer = useCallback(
        async () => {
            if (doc === null || doc.id === null || doc.data === null || doc.data.idQuestion === null || access === null)
            {
                return;
            }

            setLoadingAnswerRate(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-answer-rate`, {
                params: {
                    questionIdParam: Encrypt(doc.data.idQuestion),
                    answerIdParam: Encrypt(doc.id),
                    rateParam: Encrypt(access)
                }
            })
            .then(async result => {
                console.log("RESULTADO", result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setAnswerRate(Decrypt(result.data.data));
                    setErrorAnswerRate(false);
                    setErrorCode(null);
                    
                    return setLoadingAnswerRate(false);
                }
                if (result.status === 200 && result.data.code === "NO_RATES_ANSWER")
                {
                    setAnswerRate([]);
                    setErrorAnswerRate(false);
                    setErrorCode(null);

                    return setLoadingAnswerRate(false);
                }
                else
                {
                    setAnswerRate(undefined);
                    setErrorAnswerRate(true);
                    setErrorCode(result.data.code);

                    return setLoadingAnswerRate(false);
                }
            })
            .catch(error => {
                setAnswerRate(undefined);
                setErrorAnswerRate(true);

                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode(error.response.data.code); 
                }
                else
                {
                    setErrorCode("GET_ANSWER_RATE_ERROR");
                }

                setLoadingAnswerRate(false);
            })
            .finally(() => {
                return () => {
                    setLoadingAnswerRate(null);
                    setErrorAnswerRate(null);
                    setAnswerRate(null);
                    setErrorCode(null);
                }
            });
        },
        [doc, access, setLoadingAnswerRate, setErrorAnswerRate, setAnswerRate, setErrorCode],
    );

    const handleLikeAnswer = useCallback(
        async () => {
            if (doc === null || doc.id === null || doc.data === null || doc.data.idQuestion === null)
            {
                return;
            }

            setLoadingLike(true);

            await axios.post(`${process.env.REACT_APP_API_URI}/post-like-answer`, {
                questionIdParam: Encrypt(doc.data.idQuestion),
                answerIdParam: Encrypt(doc.id)
            })
            .then(async result => {
                if (result.status === 201 && result.data.code === "PROCESS_OK")
                {
                    await handleGetRateAnswer();
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
        [doc, setLoadingLike, handleGetRateAnswer],
    );

    const handleDislikeAnswer = useCallback(
        async () => {
            if (doc === null || doc.id === null || doc.data === null || doc.data.idQuestion === null)
            {
                return;
            }

            setLoadingDislike(true);

            await axios.post(`${process.env.REACT_APP_API_URI}/post-dislike-answer`, {
                questionIdParam: Encrypt(doc.data.idQuestion),
                answerIdParam: Encrypt(doc.id)
            })
            .then(async result => {
                if (result.status === 201 && result.data.code === "PROCESS_OK")
                {
                    await handleGetRateAnswer();
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
        [doc, setLoadingDislike, handleGetRateAnswer],
    );



    const handleGetCommentsAnswer = useCallback(
        async () => {
            if (doc === null || doc.id === null || question === null)
            {
                return;
            }

            setLoadingAnswerComments(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-answer-comments`, {
                params: {
                    answerIdParam: Encrypt(doc.id),
                    questionIdParam: Encrypt(question.id)
                }
            })
            .then(async result => {
                console.log("RESULTADO DE PREGUNTAS IN RESPONDE", result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setAnswerComments(Decrypt(result.data.data));
                    setErrorAnswerComments(false);
                    setErrorCode(null);
                }
                else
                {
                    setAnswerComments(undefined);
                    setErrorAnswerComments(true);
                    setErrorCode(result.data.code);
                }

                setLoadingAnswerComments(false);
            })
            .catch(error => {
                setAnswerComments(undefined);
                setErrorAnswerComments(true);

                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode(error.response.data.code); 
                }
                else
                {
                    setErrorCode("GET_ANSWER_COMMENTS_ERROR");
                }

                setLoadingAnswerComments(false);
            })
            .finally(() => {
                return () => {
                    setLoadingAnswerComments(null);
                    setErrorAnswerComments(null);
                    setAnswerComments(null);
                    setErrorCode(null);
                }
            });
        },
        [doc, question, setLoadingAnswerComments, setErrorAnswerComments, setAnswerComments, setErrorCode],
    );

    const handlePostCommentAnswer = useCallback(
        async () => {
            if (selectedAnswer === null || selectedAnswer.id === null || question === null || question.id === null)
            {
                return;
            }

            if (commentAnswer === "" || commentAnswer === null)
            {
                return showMessage("Complete el campo comentario", "info");
            }

            setLoadingPostComment(true);

            let objectPost = {
                comment: commentAnswer
            }

            await axios.post(`${process.env.REACT_APP_API_URI}/post-answer-comment`, {
                objectData: Encrypt(objectPost)
            }, {
                params: {
                    questionIdParam: Encrypt(question.id),
                    answerIdParam: Encrypt(selectedAnswer.id)
                }
            })
            .then(async result => {
                if (result.status === 201 && result.data.code === "PROCESS_OK")
                {
                    await handleGetCommentsAnswer();
                    setLoadingPostComment(false);
                    setErrorPostComment(false);
                    setErrorCode(null);

                    handleCloseCommentAnswerDialog();
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
                setErrorCode("POST_COMMENT_ANSWER_ERROR");

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
        [commentAnswer, selectedAnswer, question, handleGetCommentsAnswer, setLoadingPostComment, setErrorPostComment, setErrorCode, handleCloseCommentAnswerDialog],
    );

    const handlePutCommentAnswer = useCallback(
        async () => {
            if (selectedAnswer === null || selectedAnswer.id === null || question === null || question.id === null || selectedComment === null || selectedComment.id === null)
            {
                return;
            }

            if (commentAnswer === "" || commentAnswer === " " || commentAnswer === null)
            {
                return showMessage("Complete el campo comentario", "info");
            }

            setLoadingEditComment(true);

            let objectPost = {
                comment: commentAnswer
            }

            await axios.put(`${process.env.REACT_APP_API_URI}/put-answer-comment`, {
                objectData: Encrypt(objectPost)
            }, {
                params: {
                    questionIdParam: Encrypt(question.id),
                    commentIdParam: Encrypt(selectedComment.id),
                    answerIdParam: Encrypt(selectedAnswer.id)
                }
            })
            .then(async result => {
                if (result.status === 201 && result.data.code === "PROCESS_OK")
                {
                    handleCloseEditCommentAnswerDialog();
                    setLoadingEditComment(false);
                    setErrorEditComment(false);
                    setErrorCode(null);

                    await handleGetCommentsAnswer();
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
                setErrorCode("EDIT_COMMENT_ANSWER_ERROR");

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
        [selectedAnswer, selectedComment, question, commentAnswer, handleGetCommentsAnswer, setLoadingEditComment, setErrorEditComment, setErrorCode, handleCloseEditCommentAnswerDialog],
    );

    const handleDeleteCommentAnswer = useCallback(
        async () => {
            if (selectedAnswer === null || selectedAnswer.id === null || question === null || question.id === null)
            {
                return;
            }
            // /delete-answer-comment
            setLoadingDeleteAnswer(true);

            await axios.delete(`${process.env.REACT_APP_API_URI}/delete-answer-comment`, {
                params: {
                    questionIdParam: Encrypt(question.id),
                    answerIdParam: Encrypt(selectedAnswer.id)
                }
            })
            .then(async result => {
                console.log(result);
                
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    handleCloseDeleteAnswerDialog();
                    setLoadingDeleteAnswer(false);
                    setErrorDeleteAnswer(false);
                    setErrorCode(null);

                    await handleGetAnswersQuestion
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
        [selectedAnswer, selectedComment, question, handleGetCommentsAnswer, setLoadingDeleteComment, setErrorDeleteComment, setErrorCode, handleCloseDeleteCommentAnswerDialog],
    );

    const handleDeleteAnswer = useCallback(
        async () => {
            if (selectedAnswer === null || selectedAnswer.id === null || question === null || question.id === null)
            {
                return;
            }

            setLoadingDeleteAnswer(true);

            await axios.delete(`${process.env.REACT_APP_API_URI}/delete-question-answer`, {
                params: {
                    questionIdParam: Encrypt(question.id),
                    answerIdParam: Encrypt(selectedAnswer.id)
                }
            })
            .then(async result => {
                console.log(result);
                
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    handleCloseDeleteAnswerDialog();
                    setLoadingDeleteAnswer(false);
                    setErrorDeleteAnswer(false);
                    setErrorCode(null);

                    await handleGetAnswersQuestion()
                    showMessage(result.data.message, result.data.type);
                }
                else
                {
                    setLoadingDeleteAnswer(false);
                    setErrorDeleteAnswer(true);
                    setErrorCode(result.data.code);
                }
            })
            .catch(error => {
                setLoadingDeleteAnswer(false);
                setErrorDeleteAnswer(true);
                setErrorCode("DELETE_ANSWER_QUESTION_ERROR");

                if (error.response)
                {    
                    console.log(error.response);
                    // showMessage(result.data.message, result.data.type);
                }
            })
            .finally(() => {
                return () => {
                    setLoadingDeleteAnswer(null);
                    setErrorDeleteAnswer(null);
                    setErrorCode(null);
                }
            });
        },
        [selectedAnswer, question, handleGetAnswersQuestion, setLoadingDeleteAnswer, setErrorDeleteAnswer, setErrorCode, handleCloseDeleteAnswerDialog],
    );




    useEffect(() => {
        let callQuery = async () => {
            await handleGetRateAnswer();
        }

        if (doc !== null && access !== null)
        {
            callQuery();
        
            return () => {
                setLoadingAnswerRate(null);
                setErrorAnswerRate(null);
                setAnswerRate(null);
                setErrorCode(null);
            }
        }
    }, [access, doc, handleGetRateAnswer, setLoadingAnswerRate, setErrorAnswerRate, setAnswerRate, setErrorCode]);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetCommentsAnswer();
        }

        if (doc !== null)
        {
            callQuery();
        
            return () => {
                setLoadingAnswerComments(null);
                setErrorAnswerComments(null);
                setAnswerComments(null);
                setErrorCode(null);
            }
        }
    }, [doc, handleGetCommentsAnswer, setLoadingAnswerComments, setErrorAnswerComments, setAnswerComments, setErrorCode]);


    return (
        <React.Fragment>
        {
            doc === null || access === null ? (
                <Typography>Hace falta elementos para mostrar este elemento, por favor, intentelo nuevamente</Typography>
            ) : (
                <React.Fragment>
                    <Card style={{ marginBottom: 15 }} variant="outlined">
                        <CardContent>
                            <Grid container spacing={3}> {/**AQUI DEBO HACER ELIMINACIÓN LOGICA */}
                                <Grid item xs={1}>
                                {
                                    loadingLike === true || loadingDislike === true ? (
                                        <Paper elevation={0} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                            <Paper elevation={0} style={{ marginTop: 60, display: 'inline-flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                            </Paper>
                                        </Paper>
                                    ) : loadingAnswerRate === true ? (
                                        <Paper elevation={0} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                            <Paper elevation={0} style={{ marginTop: 60, display: 'inline-flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                            </Paper>
                                        </Paper>
                                    ) : errorAnswerRate === true ? (
                                        <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                            <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <React.Fragment>
                                                {
                                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                        <Tooltip title={<Typography>Recargar Contenido</Typography>}>
                                                            <IconButton onClick={async () => await handleGetRateAnswer()}>
                                                                <Replay />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )
                                                }
                                                </React.Fragment>
                                            </Paper>
                                        </Paper>
                                    ) : answerRate === null ? (
                                        <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                            <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                            </Paper>
                                        </Paper>
                                    ) : answerRate === undefined ? (
                                        <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                            <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <React.Fragment>
                                                {
                                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                        <Tooltip title={<Typography>Recargar Contenido</Typography>}>
                                                            <IconButton onClick={async () => await handleGetRateAnswer()}>
                                                                <Replay />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )
                                                }
                                                </React.Fragment>
                                            </Paper>
                                        </Paper>
                                    ) : (
                                        <Card elevation={0} itemType="div" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>   
                                            <React.Fragment>
                                            {
                                                access === "admin" ? (
                                                    <Paper elevation={0} style={{ marginBottom: 15, display: 'inline-flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <ThumbUp color="disabled" />
                                                    </Paper>
                                                ) : (
                                                    <Paper elevation={0} style={{ marginBottom: 15, display: 'inline-flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Tooltip title={<Typography>{answerRate.length > 0 ? answerRate[0].userRate.data.liked === true ? "Ya no me gusta" : "Me gusta" : "Me gusta"}</Typography>} placement="top">
                                                            <IconButton onClick={async () => await handleLikeAnswer()} color={answerRate.length > 0 ? answerRate[0].userRate.data.liked === true ? "primary" : "default" : "default"}>
                                                                <ThumbUp />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Paper>
                                                )
                                            }
                                            </React.Fragment>

                                            <Typography>{answerRate.length > 0 ? String(answerRate[0].likedCount - answerRate[0].dislikedCount) : "0"}</Typography>

                                            <React.Fragment>
                                            {
                                                access === "admin" ? (
                                                    <Paper elevation={0} style={{ marginTop: 15, display: 'inline-flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <ThumbDown color="disabled" />
                                                    </Paper>
                                                ) : (
                                                    <Paper elevation={0} style={{ marginTop: 15, display: 'inline-flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Tooltip title={<Typography>{answerRate.length > 0 ? answerRate[0].userRate.data.disliked === true ? "quitar no me gusta" : "No me gusta" : "No me gusta"}</Typography>} placement="bottom">
                                                            <IconButton onClick={async () => await handleDislikeAnswer()} color={answerRate.length > 0 ? answerRate[0].userRate.data.disliked === true ? "primary" : "default" : "default"}>
                                                                <ThumbDown />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Paper>
                                                )
                                            }
                                            </React.Fragment>
                                        </Card>
                                    )
                                }
                                </Grid>

                                <Grid item xs={9}>
                                    <Typography>{doc.data.answer}</Typography>
                                </Grid>

                                <Grid item xs={2}>
                                {
                                    access === "admin" && (
                                        <Tooltip title={<Typography>Eliminar Respuesta</Typography>}>
                                            <IconButton onClick={() => handleOpenDeleteAnswerDialog(doc)}>
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    )
                                }
                                </Grid>

                                <Grid item xs={12} style={{ marginLeft: 15, marginRight: 15, display: 'flex', flexDirection: 'row' }}>
                                    <Paper variant="outlined" style={{ width: 'fit-content', padding: 5, paddingLeft: 10, paddingRight: 10, marginLeft: 'auto' }}>
                                        <React.Fragment>
                                            <Typography>{`Respondido en el día ${moment(new Date(doc.data.created_at._seconds * 1000)).format("D [de] MMMM [de] gggg[, a las ] HH:mm")}`}</Typography>
                                            <Typography>{`${Decrypt(doc.data.name)} ${Decrypt(doc.data.surname)}`}</Typography>
                                        </React.Fragment>                               
                                    </Paper>
                                </Grid>
                            </Grid>      

                            <Grid item xs={12}>
                            {
                                loadingAnswerComments === true ? (
                                    <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(2% + 15px" }}>
                                        <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <CircularProgress style={{ color: "#2074d4" }} />
                                            <Typography style={{ marginTop: 15 }}>Cargando Comentarios</Typography>
                                        </Paper>
                                    </Paper>
                                ) : errorAnswerComments === true ? (
                                    <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(2% + 15px)" }}>
                                        <Typography style={{ textAlign: "center" }}>
                                        {
                                            errorCode !== null ? (
                                                errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                    "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                                ) : errorCode === "NO_COMMENTS_ANSWER" ? (
                                                    "No existen comentarios, por favor intentelo más tarde"
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
                                                    <Button onClick={async () => await handleGetCommentsAnswer()} style={{ color: "#2074d4" }}>
                                                        <Typography variant="button">Recargar comentarios</Typography>
                                                    </Button>
                                                </Paper>
                                            )
                                        }
                                        </React.Fragment>
                                    </Paper>
                                ) : answerComments === null ? (
                                    <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(2% + 15px)" }}>
                                        <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <CircularProgress style={{ color: "#2074d4" }} />
                                            <Typography style={{ marginTop: 15 }}>Cargando Comentarios</Typography>
                                        </Paper>
                                    </Paper>
                                ) : answerComments === undefined ? (
                                    <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(2% + 15px)" }}>
                                        <Typography style={{ textAlign: "center" }}>
                                        {
                                            errorCode !== null ? (
                                                errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                    "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                                ) : errorCode === "NO_COMMENTS_ANSWER" ? (
                                                    "No existen comentarios, por favor intentelo más tarde"
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
                                                    <Button onClick={async () => await handleGetCommentsAnswer()} style={{ color: "#2074d4" }}>
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
                                            answerComments.map(doc2 => (
                                                <Paper key={doc2.id} elevation={0} itemType="div">
                                                    <ListItem style={{ width: '100%' }}>
                                                        <ListItemText 
                                                            primary={
                                                                <Paper elevation={0} itemType="div" style={{ display: 'inline-flex' }}>
                                                                    <Typography>{doc2.data.comment}</Typography>
                                                                    <Typography style={{ color: blue[500], marginLeft: 10 }}>{`${Decrypt(doc2.data.name)} ${Decrypt(doc2.data.surname)}`}</Typography>
                                                                </Paper>} 

                                                            secondary={` - ${moment(new Date(doc2.data.created_at._seconds * 1000)).format("D [de] MMMM [de] gggg[, a las ] HH:mm")}`} security="true" />

                                                        <ListItemSecondaryAction>
                                                        {
                                                            access === "admin" ? (
                                                                <Tooltip title={<Typography>Eliminar Comentario</Typography>}>
                                                                    <IconButton onClick={() => handleOpenDeleteCommentAnswerDialog(doc, doc2)}>
                                                                        <Delete />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            ) : access === "student" && doc2.data.created_by === doc2.uid ? (
                                                                <Tooltip title={<Typography>Editar Pregunta</Typography>}>
                                                                    <IconButton onClick={() => handleOpenEditCommentAnswerDialog(doc, doc2)}>
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
                                        <Button variant="text" onClick={() => handleOpenCommentAnswerDialog(doc)} style={{ color: "#2074d4" }}>Añade un comentario</Button>
                                    </Grid>
                                )
                            }
                            </React.Fragment>
                        </CardContent>
                    </Card>

                    <Divider style={{ marginBottom: 20 }} />

                    <Dialog open={commentAnswerDialog} fullScreen={fullScreen} onClose={handleCloseCommentAnswerDialog} fullWidth={true} maxWidth="sm" scroll="paper">
                        <DialogTitle>Nuevo comentario en la respuesta seleccionada</DialogTitle>
                        <DialogContent>
                        {
                            selectedAnswer === null ? (
                                <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                        <Typography style={{ marginTop: 15 }}>Cargando comentario seleccionado</Typography>
                                    </Paper>
                                </Paper>
                            ) : loadingPostComment === true ? (
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
                                    <DialogContentText>Llena el formulario para añadir un comentario a esta respuesta</DialogContentText>
                                            
                                    <ThemeProvider theme={InputTheme}>
                                        <TextField value={commentAnswer} label="Comentario" type="text" variant="outlined" fullWidth onChange={(e) => setCommentAnswer(e.target.value)} />
                                    </ThemeProvider>
                                </React.Fragment>
                            )
                        }
                        </DialogContent>
                        <DialogActions>
                        {
                            selectedAnswer !== null && (
                                errorPostComment === false && (
                                    loadingPostComment === true ? (
                                        <Paper elevation={0} style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", padding: 5, marginRight: 15 }}>
                                            <CircularProgress style={{ color: "#2074d4" }} />
                                        </Paper>
                                    ) : (
                                        <React.Fragment>
                                            <Button color="inherit" onClick={() => handleCloseCommentAnswerDialog()}>
                                                Cerrar Ventana
                                            </Button>
                                            <Button onClick={async () => await handlePostCommentAnswer()} style={{ color: "#2074d4" }}>
                                                Añadir Comentario
                                            </Button>
                                        </React.Fragment>
                                    )
                                )
                            )
                        }
                        </DialogActions>
                    </Dialog>

                    <Dialog open={editCommentAnswerDialog} fullScreen={fullScreen} onClose={handleCloseEditCommentAnswerDialog} fullWidth={true} maxWidth="sm" scroll="paper">
                        <DialogTitle>Editar comentario en la respuesta seleccionada</DialogTitle>
                        <DialogContent>
                        {
                            selectedAnswer === null || selectedComment === null ? (
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
                                            <DialogContentText>Llena el formulario para editar el comentario seleccionado de esta respuesta</DialogContentText>
                                            
                                            <ThemeProvider theme={InputTheme}>
                                                <TextField value={commentAnswer} label="Comentario" type="text" variant="outlined" fullWidth onChange={(e) => setCommentAnswer(e.target.value)} />
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
                            selectedAnswer !== null && selectedComment !== null && (
                                errorEditComment === false && (
                                    loadingEditComment === true ? (
                                        <Paper elevation={0} style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", padding: 5, marginRight: 15 }}>
                                            <CircularProgress style={{ color: "#2074d4" }} />
                                        </Paper>
                                    ) : (
                                        <React.Fragment>
                                            <Button color="inherit" onClick={() => handleCloseEditCommentAnswerDialog()}>
                                                Cerrar Ventana
                                            </Button>
                                            <Button onClick={async () => await handlePutCommentAnswer()} style={{ color: "#2074d4" }}>
                                                Editar Comentario
                                            </Button>
                                        </React.Fragment>
                                    )
                                )
                            )
                        }
                        </DialogActions>
                    </Dialog>

                    <Dialog open={deleteCommentAnswerDialog} fullScreen={fullScreen} onClose={handleCloseDeleteCommentAnswerDialog} fullWidth={true} maxWidth="sm" scroll="paper">
                        <DialogTitle>Eliminar comentario en la respuesta seleccionada</DialogTitle>
                        <DialogContent>
                        {
                            selectedAnswer === null || selectedComment === null ? (
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
                            selectedAnswer !== null && selectedComment !== null &&  (
                                errorDeleteComment === false && (
                                    loadingDeleteComment === true ? (
                                        <Paper elevation={0} style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", padding: 5, marginRight: 15 }}>
                                            <CircularProgress style={{ color: "#2074d4" }} />
                                        </Paper>
                                    ) : (
                                        <React.Fragment>
                                            <Button color="inherit" onClick={() => handleCloseDeleteCommentAnswerDialog(false)}>
                                                Cerrar Ventana
                                            </Button>
                                            <Button onClick={async () => await handleDeleteCommentAnswer()} style={{ color: "#2074d4" }}>
                                                Eliminar Comentario
                                            </Button>
                                        </React.Fragment>
                                    )
                                )
                            )
                        }
                        </DialogActions>
                    </Dialog>

                    <Dialog open={deleteAnswerDialog} fullScreen={fullScreen} onClose={handleCloseDeleteAnswerDialog} fullWidth={true} maxWidth="sm" scroll="paper">
                        <DialogTitle>Eliminar la respuesta seleccionada</DialogTitle>
                        <DialogContent>
                        {
                            selectedAnswer === null ? (
                                <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                        <Typography style={{ marginTop: 15 }}>Cargando respuesta seleccionada</Typography>
                                    </Paper>
                                </Paper>
                            ) : (
                                <React.Fragment>
                                {
                                    loadingDeleteAnswer === true ? (
                                        <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                <Typography style={{ marginTop: 15 }}>Eliminando Respuesta en el foro</Typography>
                                            </Paper>
                                        </Paper>
                                    ) : errorDeleteAnswer === true ? (
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
                                                                        <Button onClick={() => setErrorDeleteAnswer(false)} style={{ color: "#2074d4" }}>
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
                                            <DialogContentText>Esta seguro de eliminar esta respuesta?, este paso es irreversible</DialogContentText>
                                        </React.Fragment>
                                    )
                                }
                                </React.Fragment>
                            )
                        }
                        </DialogContent>
                        <DialogActions>
                        {
                            selectedAnswer !== null && (
                                errorDeleteAnswer === false && (
                                    loadingDeleteAnswer === true ? (
                                        <Paper elevation={0} style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", padding: 5, marginRight: 15 }}>
                                            <CircularProgress style={{ color: "#2074d4" }} />
                                        </Paper>
                                    ) : (
                                        <React.Fragment>
                                            <Button color="inherit" onClick={() => handleCloseDeleteAnswerDialog()}>
                                                Cerrar Ventana
                                            </Button>
                                            <Button onClick={async () => await handleDeleteAnswer()} style={{ color: "#2074d4" }}>
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
        </React.Fragment>
    )
}

export default AnswerCard;