import React, { useCallback, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { Avatar, Breadcrumbs, Button, Card, CardContent, CircularProgress, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Paper, Tooltip, Typography } from '@material-ui/core';
import { FormatListNumbered, NavigateNext, Person, Reorder } from '@material-ui/icons';

import { Decrypt } from '../../helpers/cipher/cipher';

import axios from 'axios';


const MyStudents = () => {
    const history = useHistory();

    const [loadingStudents, setLoadingStudents] = useState(true);
    const [errorStudents, setErrorStudents] = useState(false);
    const [students, setStudents] = useState(null);
    const [errorCode, setErrorCode] = useState(null);

    const handleGetStudentsProxie = useCallback(
        async () => {
            setLoadingStudents(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-my-students-proxie`)
            .then(result => {
                console.log(result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setStudents(Decrypt(result.data.data));
                    setErrorStudents(false);
                    setErrorCode(null);
                }
                else
                {
                    setStudents(undefined);
                    setErrorStudents(true);
                    setErrorCode(result.data.code);
                }

                setLoadingStudents(false);
            })
            .catch(error => {
                setStudents(undefined);
                setErrorStudents(true);

                if (error.response)
                {
                    setErrorCode(error.response.data.code); 
                }
                else
                {
                    setErrorCode("GET_STUDENTS_TEACHER_ERROR");
                }

                setLoadingStudents(false);
            })
            .finally(() => {
                return () => {
                    setLoadingStudents(null);
                    setErrorStudents(null);
                    setErrorCode(null);
                    setStudents(null);
                }
            });
        },
        [setStudents, setErrorCode, setErrorStudents, setLoadingStudents],
    );
    
    useEffect(() => {
        let callQuery = async () => {
            await handleGetStudentsProxie();
        }

        callQuery();
        
        return () => {
            setStudents(null);
        }
    }, [setStudents, handleGetStudentsProxie]);

    return (
        <Paper elevation={0} itemType="div">
            <Paper variant="outlined" itemType="div" style={{ padding: 20, marginBottom: 15 }}>
                <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                    <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                        Home
                    </Link>
                    <Typography style={{ color: "#2074d4" }}>Mis Estudiantes</Typography>
                </Breadcrumbs>
            </Paper>

            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6">Todos los estudiantes asignados a ti</Typography>    

                    <Divider style={{ marginTop: 15, marginBottom: 15 }} />

                    <Paper elevation={0} itemType="div">
                    {
                        loadingStudents === true ? (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 30 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando Estudiantes</Typography>
                            </Paper>
                        ) : errorStudents === true ? (
                            <React.Fragment>
                            {
                                errorCode !== null && (
                                    <React.Fragment>
                                        <Typography style={{ textAlign: "center" }}>
                                        {
                                            errorCode === "NO_STUDENTS_ASSIGNED" ? (
                                                "No tienes estudiantes asignados a ti aún"
                                            ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente o bien"
                                            ) : (
                                                "Ha ocurrido un error, intente obtener los estudiantes nuevamente"
                                            )
                                        }
                                        </Typography>

                                        <React.Fragment>
                                        {
                                            errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                    <Button onClick={async () => await handleGetStudentsProxie()} style={{ color: "#2074d4" }}>
                                                        <Typography variant="button">Recargar Estudiantes</Typography>
                                                    </Button>
                                                </Paper>
                                            )
                                        }
                                        </React.Fragment>
                                    </React.Fragment>
                                )
                            }
                            </React.Fragment>
                        ) : students === null ? (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 30 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando Estudiantes</Typography>
                            </Paper>
                        ) : students === undefined ? (
                            <React.Fragment>
                            {
                                errorCode !== null && (
                                    <React.Fragment>
                                        <Typography style={{ textAlign: "center" }}>
                                        {
                                            errorCode === "NO_STUDENTS_ASSIGNED" ? (
                                                "No tienes estudiantes asignados a ti aún"
                                            ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente o bien"
                                            ) : (
                                                "Ha ocurrido un error, intente obtener los estudiantes nuevamente"
                                            )
                                        }
                                        </Typography>

                                        <React.Fragment>
                                        {
                                            errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                    <Button onClick={async () => await handleGetStudentsProxie()} style={{ color: "#2074d4" }}>
                                                        <Typography variant="button">Recargar Estudiantes</Typography>
                                                    </Button>
                                                </Paper>
                                            )
                                        }
                                        </React.Fragment>
                                    </React.Fragment>
                                )
                            }
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <List>
                                {
                                    students.map(doc => (
                                        <Paper elevation={0} key={doc.id}>
                                            <ListItem>
                                                <ListItemAvatar>
                                                    <Avatar>
                                                        <Person />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText primary={`${Decrypt(doc.data.name)} ${Decrypt(doc.data.surname)}`} secondary={Decrypt(doc.data.rut)} />
                                                <ListItemSecondaryAction>
                                                    <Tooltip title={<Typography>Ver notas estudiante</Typography>}>
                                                        <IconButton onClick={() => history.push(`my-students/subjects/${doc.id}`)} edge="end" aria-label="delete">
                                                            <FormatListNumbered />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title={<Typography>Ver anotaciones estudiante</Typography>}>
                                                        <IconButton onClick={() => history.push(`my-students/annotations/${doc.id}`)} edge="end" aria-label="delete" style={{ marginLeft: 20 }}>
                                                            <Reorder />
                                                        </IconButton>
                                                    </Tooltip>                   
                                                </ListItemSecondaryAction>
                                            </ListItem>

                                            <Divider />
                                        </Paper>
                                    ))
                                }
                                </List>
     
                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                    <Button onClick={async () => await handleGetStudentsProxie()} style={{ color: "#2074d4" }}>
                                        <Typography variant="button">Recargar Estudiantes</Typography>
                                    </Button>
                                </Paper>
                            </React.Fragment>
                        )
                    }
                    </Paper>      
                </CardContent>
            </Card>
        </Paper>
    )
}

export default MyStudents;