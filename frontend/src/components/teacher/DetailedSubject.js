import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Breadcrumbs, Button, Card, CardContent, Divider, Grid, List, ListItem, ListItemText, Paper, Typography } from '@material-ui/core';
import { NavigateNext } from '@material-ui/icons';

import { Decrypt } from '../../helpers/cipher/cipher';
import history from './../../helpers/history/handleHistory';
import { clearAuthData } from '../../helpers/auth/handleGetLevel';
import { deleteRefreshToken, deleteToken } from '../../helpers/token/handleToken';

import axios from 'axios';

const DetailedSubject = () => {
    const { id } = useParams();

    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,     setError] = useState(false);
    const [access,   setAccess] = useState(null);

    const handleGetDetailedSubject = useCallback(
        async () => {
            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-detailed-course", {
                params: {
                    courseID: id
                }
            })
            .then(result => {
                console.log(result.data.data.course[0].data);
                console.log(result.data.data.units);

                if (result.data.data.course[0].data === undefined)
                {
                    setLoading(false);
                    setError(true);
                }
                else
                {
                    setLoading(false);
                    setError(false);
                    setSubject(result.data.data);
                }
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
                setError(false);
                setSubject(undefined);
            })
            .finally(() => {
                return () => {
                    setSubject(null); 
                    setError(null);
                    setLoading(null);
                }
            })
        },
        [id, setLoading, setError, setSubject],
    );

    const handleGetAccess = useCallback(
        async () => {
            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-access")
            .then(result => {
                if (result.data.code === "PROCESS_OK")
                {
                    setAccess(result.data.data);
                }
            })
            .catch(error => {
                if (error.response.data.error.message === "TOKEN_MISSING")
                {
                    clearAuthData();
                    history.push("/");
                }
                else if (error.response.data.error.message === "TOKEN_INVALID")
                {
                    deleteToken();
                    deleteRefreshToken();

                    clearAuthData();
                    history.push("/");
                }
                else
                {
                    console.log(error.response.data.error.message);
                }
            })
            .finally(() => {
                return () => {
                    setAccess(null);
                }
            });
        },
        [setAccess],
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
            await handleGetDetailedSubject();
        }

        return callQuery();
    }, [handleGetDetailedSubject]);

    return (
        <div>
        {
            loading === true ? (
                <p>loading</p>
            ) : (
                error === true ? (
                    <p>acá ha ocurrido un error</p>
                ) : (
                    subject !== null && access !== null ? (
                        <>
                            <Paper style={{ padding: 20, marginBottom: 15 }} variant="outlined">
                                <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                                    <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                                        Home
                                    </Link>
                                    <Link to="/my-subjects" style={{ textDecoration: "none", color: "#333" }}>
                                        Mis Cursos
                                    </Link>
                                    <Typography style={{ color: "#2074d4" }}>{subject.course[0].data.code}</Typography>
                                </Breadcrumbs>
                            </Paper>

                            <Grid container spacing={2}>
                                <Grid item container md={9} style={{ marginTop: 15 }}>
                                    <Card variant="outlined" style={{ width: "100%" }}>
                                        <CardContent>
                                            <Typography variant="h5" color="textSecondary">
                                                {Decrypt(subject.course[0].data.courseName)}
                                            </Typography>

                                            <Typography variant="subtitle1" style={{ marginBottom: 15 }}>
                                                {Decrypt(subject.course[0].data.description)}
                                            </Typography>

                                            {
                                                Decrypt(access) === "teacher" && (
                                                    <Button>Abrir editor para agregar archivos</Button>
                                                )
                                            }

                                            <List>
                                            {
                                                subject.units.map(doc => (
                                                    <div key={doc.id}>
                                                        <ListItem>
                                                            <ListItemText primary={`Unidad ${doc.unit.numberUnit} : ${doc.unit.unit}`} />
                                                        </ListItem>

                                                        <Divider style={{ marginTop: 5, marginBottom: 15 }} /> 
                                                    </div>
                                                   
                                                ))
                                            }
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item container md={3} style={{ marginTop: 15 }}>
                                    <Card variant="outlined" style={{ width: "100%" }}>
                                        <CardContent>
                                            aca irá el contenido de ayuda
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </>
                    ) : (
                        <p>cargando</p>
                    )
                )
            )
        }
        </div>
    )
}

export default DetailedSubject;