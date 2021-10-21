import React, { useCallback, useEffect, useState } from 'react';

import { Breadcrumbs, Button, Card, CardContent, CircularProgress, Divider, List, ListItem, ListItemText, Paper, Typography } from '@material-ui/core';

import { Decrypt } from './../../helpers/cipher/cipher';
import { showMessage } from './../../helpers/message/handleMessage';

import axios from 'axios';
import { NavigateNext } from '@material-ui/icons';
import { Link } from 'react-router-dom';

const MyCourses = () => {
    // useStates
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [courses, setCourses] = useState(null);


    // useCallbacks
    /**
     * useCallback para obtener los cursos del profesor actual
     */
    const handleGetTeacherStudentCourses = useCallback(
        async () => {
            setLoading(true);

            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-user-courses")
            .then(result => {
                if (result?.data?.code === "PROCESS_OK")
                {
                    setCourses(Decrypt(result?.data?.data));
                    setError(false);
                }
                else if (result?.data?.code === "NO_COURSES")
                {
                    setError(true);
                }
                else
                {
                    showMessage("Ha ocurrido un error mientras se obtenian sus asignaturas", "info");
                    setError(true);
                }

                setLoading(false);
            })
            .catch(error => {
                if (error?.response?.code === "FIREBASE_GET_COURSES_ERROR")
                {
                    showMessage(error.response.message, error.response.type);
                }
                else
                {
                    showMessage("Ha ocurrido un error mientras se obtenian sus asignaturas", "info");
                }

                setLoading(false);
                setError(true);
            })
            .finally(() => {
                return () => {
                    setCourses(null);
                }
            });
        },
        [setCourses, setLoading, setError],
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
                    <Typography style={{ color: "#2074d4" }}>Mis Cursos</Typography>
                </Breadcrumbs>
            </Paper>

            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6">Todas las asignaturas</Typography>    

                    <Divider style={{ marginTop: 15, marginBottom: 15 }} />

                    <div>
                    {
                        loading === true ? (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                            </div>
                        ) : (
                            error === false ? (
                                courses === null ? (
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                    </div>
                                ) : (
                                    <>
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
                                    </>
                                )
                            ) : (
                                <>
                                    <Typography style={{ textAlign: "center" }}>No existen cursos asignados a ti aún</Typography>
                                    
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                        <Button onClick={() => handleGetTeacherStudentCourses()} style={{ color: "#2074d4" }}>Recargar Asignaturas</Button>
                                    </div>
                                </>
                            )
                        )
                    }
                    </div>              
                </CardContent>
            </Card>
        </div>
    )
}

export default MyCourses
