import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Breadcrumbs, Button, Card, CardContent, CircularProgress, Divider, List, ListItem, ListItemText, Paper, Typography } from '@material-ui/core';
import { NavigateNext } from '@material-ui/icons';

import { Decrypt } from './../../helpers/cipher/cipher';

import axios from 'axios';

const MyCourses = () => {
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
                }
                else
                {
                    setErrorCourses(true);
                }

                setLoadingCourses(false);
            })
            .catch(error => {
                if (error.response)
                {
                    setErrorCode(error.response.data.code);
                    setLoadingCourses(false);
                    setErrorCourses(true);

                    console.log(error.response);
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
        <div>
            <Paper style={{ padding: 20, marginBottom: 15 }} variant="outlined">
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

                    <div>
                    {
                        loadingCourses === true ? (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                            </div>
                        ) : (
                            errorCourses === true ? (
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
                                    
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                        <Button onClick={() => handleGetTeacherStudentCourses()} style={{ color: "#2074d4" }}>Recargar Asignaturas</Button>
                                    </div>
                                </React.Fragment>
                            ) : (
                                courses === null ? (
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                    </div>
                                ) : (
                                    <React.Fragment>
                                        <List>
                                        {
                                            courses.map(doc => (
                                                <Link key={doc.id} to={`/subject/${doc.id}`} style={{ color: "#333", textDecoration: "none" }}>
                                                    <ListItem key={doc.id} button>
                                                        <ListItemText primary={Decrypt(Decrypt(doc.data).name)} secondary={Decrypt(doc.data).code} />
                                                    </ListItem>
                                                </Link>
                                            ))
                                        }
                                        </List>
                                    
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                            <Button onClick={() => handleGetTeacherStudentCourses()} style={{ color: "#2074d4" }}>Recargar Asignaturas</Button>
                                        </div>
                                    </React.Fragment>
                                )
                            )
                        )
                    }
                    </div>              
                </CardContent>
            </Card>
        </div>
    );
};

export default MyCourses;