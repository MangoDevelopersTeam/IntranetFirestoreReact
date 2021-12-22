import React, { useCallback, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { Breadcrumbs, Button, Card, CardContent, CircularProgress, Divider, List, ListItem, ListItemText, Paper, Typography } from '@material-ui/core';
import { NavigateNext } from '@material-ui/icons';

import { Decrypt } from './../../helpers/cipher/cipher';

import axios from 'axios';

const MyCourses = () => {
    // uses
    const history = useHistory();

    // useStates
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [errorCourses, setErrorCourses] = useState(false);
    const [errorCode, setErrorCode] = useState(null);
    const [courses, setCourses] = useState(null);


    // useCallbacks
    /**
     * useCallback para obtener los cursos del profesor actual
     */
    const handleGetTeacherStudentCourses = useCallback(
        async () => {
            setLoadingCourses(true);

            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-user-courses")
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setCourses(Decrypt(result.data.data));
                    setErrorCourses(false);
                    setErrorCode(null);
                }
                else
                {
                    setCourses(undefined);
                    setErrorCourses(true);
                    setErrorCode(result.data.code);
                }

                setLoadingCourses(false);
            })
            .catch(error => {
                setCourses(undefined);
                setErrorCourses(true);
                setLoadingCourses(false);
                
                if (error.response)
                {
                    setErrorCode(error.response.data.code);
                }
                else
                {
                    setErrorCode("GET_COURSES_ERROR");
                }
            })
            .finally(() => {
                return () => {
                    setLoadingCourses(null);
                    setErrorCourses(null);
                    setErrorCode(null);
                    setCourses(null);
                }
            });
        },
        [setCourses, setErrorCode, setErrorCourses, setLoadingCourses],
    );
    

    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            await handleGetTeacherStudentCourses();
        }

        
        callQuery();
        
        return () => {
            setCourses(null);
        }
    }, [setCourses, handleGetTeacherStudentCourses]);

    
    return (
        <Paper elevation={0} itemType="div">
            <Paper variant="outlined" itemType="div" style={{ padding: 20, marginBottom: 15 }}>
                <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                    <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                        Home
                    </Link>
                    <Typography style={{ color: "#2074d4" }}>Mis Asignaturas</Typography>
                </Breadcrumbs>
            </Paper>

            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6">Todas las asignaturas</Typography>    

                    <Divider style={{ marginTop: 15, marginBottom: 15 }} />

                    <Paper elevation={0} itemType="div">
                    {
                        loadingCourses === true ? (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 30 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando Asignaturas</Typography>
                            </Paper>
                        ) : errorCourses === true ? (
                            <React.Fragment>
                                <Typography style={{ textAlign: "center" }}>
                                {
                                    errorCode !== null && (
                                        errorCode === "NO_COURSES" ? (
                                            "No existen asignaturas asignados a ti aún"
                                        ) : errorCode === "FIREBASE_GET_COURSES_ERROR" ? (
                                            "Ha ocurrido un error al obtener las asignaturas asignados a tí"
                                        ) : (
                                            "Ha ocurrido un error, intente obtener las asignaturas nuevamente"
                                        )
                                    )
                                }
                                </Typography>
                                    
                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                    <Button onClick={async () => await handleGetTeacherStudentCourses()} style={{ color: "#2074d4" }}>
                                        <Typography variant="button">Recargar Asignaturas</Typography>
                                    </Button>
                                </Paper>
                            </React.Fragment>
                        ) : courses === null ? (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 30 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando Asignaturas</Typography>
                            </Paper>
                        ) : courses === undefined ? (
                            <React.Fragment>
                                <Typography style={{ textAlign: "center" }}>
                                {
                                    errorCode !== null && (
                                        errorCode === "NO_COURSES" ? (
                                            "No existen asignaturas asignados a ti aún"
                                        ) : errorCode === "FIREBASE_GET_COURSES_ERROR" ? (
                                            "Ha ocurrido un error al obtener las asignaturas asignados a tí"
                                        ) : (
                                            "Ha ocurrido un error, intente obtener las asignaturas nuevamente"
                                        )
                                    )
                                }
                                </Typography>
                                    
                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                    <Button onClick={async () => await handleGetTeacherStudentCourses()} style={{ color: "#2074d4" }}>
                                        <Typography variant="button">Recargar Asignaturas</Typography>
                                    </Button>
                                </Paper>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <List>
                                {
                                    courses.map(doc => (  
                                        <ListItem key={doc.id} button onClick={() => history.push(`/subject/${doc.id}`)}>
                                            <ListItemText primary={Decrypt(Decrypt(doc.data).name)} secondary={Decrypt(doc.data).code} />
                                        </ListItem>
                                    ))
                                }
                                </List>
                                    
                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                    <Button onClick={async () => await handleGetTeacherStudentCourses()} style={{ color: "#2074d4" }}>
                                        <Typography variant="button">Recargar Asignaturas</Typography>
                                    </Button>
                                </Paper>
                            </React.Fragment>
                        )
                    }
                    </Paper>            
                </CardContent>
            </Card>
        </Paper>
    );
};

export default MyCourses;