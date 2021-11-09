import React, { useCallback, useEffect, useState } from 'react';
import { Router, Route, Switch } from 'react-router-dom';

import { makeStyles, ThemeProvider, CircularProgress, Typography, Button, unstable_createMuiStrictModeTheme as MuiThemeUS } from '@material-ui/core';

import { Decrypt } from '../helpers/cipher/cipher';
import history from './../helpers/history/handleHistory';
import { clearAuthData } from '../helpers/auth/handleGetLevel';

import Subject from './subject/Subject';
import MyCourses from './teacher/MyCourses';
import Dialogs from './../templates/Dialogs';
import Message from './../templates/Message';
import Navigation from './../templates/Navigation';

import Profile from './../components/Profile';
import Users from './../components/admin/Users';
import HomeAdmin from './../components/admin/HomeAdmin';
import UserDetail from './../components/admin/UserDetail';

import HomeTeacher from './teacher/HomeTeacher';
import DetailedSubject from './teacher/DetailedSubject';
import StudentsSubject from './teacher/StudentsSubject';

import ManageSubject from './subject/ManageSubject';
import HomeStudent from './student/HomeStudent';

import Testing from './others/Testing';
import RouteNotFound from './others/RouteNotFound';

import axios from 'axios';
import MyGrades from './student/MyGrades';
import MyAnnotations from './student/MyAnnotations';
import MyAllGrades from './student/MyAllGrades';

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
}));

const Main = () => {
    // uses
    const classes = useStyles();
    const theme = MuiThemeUS();


    // useState
    const [access, setAccess] = useState(null);
    const [expired, setExpired] = useState(false);
    const [errorAccess, setErrorAccess] = useState(false);
    const [loadingAccess, setLoadingAccess] = useState(true);
    

    // useCallbacks
    /**
     * useCallback para obtener el nivel del usuario
     */
    const handleGetAccess = useCallback(
        async () => {
            setLoadingAccess(true);

            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-access")
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setAccess(result.data.data);
                    setErrorAccess(false);
                    setLoadingAccess(false);
                }
                else
                {   
                    setAccess(null);
                    setErrorAccess(true);
                    setLoadingAccess(false);
                }
            })
            .catch(error => {
                setAccess(null);
                setErrorAccess(true);
                setLoadingAccess(false);

                if (error.response)
                {
                    console.log("THE ERROR GET ACCESS IS : ", error.response);

                    if (error.response.data.code === "FIREBASE_VERIFY_TOKEN_ERROR")
                    {
                        setExpired(true);
                    }
                }
            });
        },
        [setAccess, setErrorAccess, setLoadingAccess, setExpired],
    );


    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            await handleGetAccess();
        }

        callQuery();

        return () => {
            setAccess(null);
            setErrorAccess(null);
            setLoadingAccess(null);
        }
    }, [handleGetAccess, setAccess, setErrorAccess, setLoadingAccess]);


    return (
        <div className={classes.root}>
            <ThemeProvider theme={theme}>
                <Router history={history}>
                    <Navigation />

                    <main className={classes.content}>
                        <div className={classes.toolbar} />

                        <div>
                        {
                            loadingAccess === true ? (
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                        <Typography style={{ marginTop: 15 }}>Cargando</Typography>
                                    </div>
                                </div>
                            ) : (
                                errorAccess === true ? (
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        {
                                            expired === true ? (
                                                <React.Fragment>
                                                    <Typography style={{ marginTop: 15 }}>Su sesión ha expirado, necesita iniciar sesión nuevamente</Typography>
                                                    <Button style={{ color: "#34495E", marginTop: 15 }} onClick={() => clearAuthData()}>Iniciar Sesión Nuevamente</Button>
                                                </React.Fragment>
                                            ) : (
                                                <React.Fragment>
                                                    <Typography style={{ marginTop: 15 }}>Ha ocurrido un error al momento de obtener la sesión</Typography>
                                                    <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetAccess()}>Recargar Sesión</Button>
                                                </React.Fragment>
                                            )
                                        }
                                        </div>
                                    </div>
                                ) : (
                                    access === null ? (
                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                <Typography style={{ marginTop: 15 }}>Cargando Datos de Acceso</Typography>
                                            </div>
                                        </div>
                                    ) : (
                                        <Switch>
                                            <React.Fragment>
                                                { Decrypt(access) === "admin" && (
                                                    <Switch>
                                                        <Route exact path="/" component={HomeAdmin}/> 
                                                        <Route exact path="/users" component={Users} />
                                                        <Route exact path="/users/:id" component={UserDetail} />
                                                        <Route exact path="/subjects" component={ManageSubject} />
                                                        <Route exact path="/subjects/:id" component={Subject} />
                                                        <Route exact path="/testing" component={Testing} />
                                                        <Route exact path="/profile" component={Profile} />
                                                        <Route component={RouteNotFound} />
                                                    </Switch>
                                                ) }

                                                { Decrypt(access) === "teacher" && (
                                                    <Switch>
                                                        <Route exact path="/" component={HomeTeacher}/> 
                                                        <Route exact path="/my-subjects" component={MyCourses}/> 
                                                        <Route exact path="/subject/:id" component={DetailedSubject}/> 
                                                        <Route exact path="/subject/students/:id" component={StudentsSubject}/>
                                                        <Route exact path="/profile" component={Profile} />
                                                    </Switch>
                                                ) }

                                                { Decrypt(access) === "student" && (
                                                    <Switch>
                                                        <Route exact path="/" component={HomeStudent}/> 
                                                        <Route exact path="/my-subjects" component={MyCourses}/>
                                                        <Route exact path="/my-all-grades" component={MyAllGrades}/>
                                                        <Route exact path="/subject/:id" component={DetailedSubject}/>
                                                        <Route exact path="/subject/my-grades/:id" component={MyGrades}/>
                                                        <Route exact path="/subject/my-annotations/:id" component={MyAnnotations}/>
                                                        <Route exact path="/profile" component={Profile} />
                                                    </Switch>
                                                ) }
                                            </React.Fragment>
                                        </Switch>
                                    )
                                )
                            )
                        }  
                        </div>
                    </main>

                    <Dialogs />
                    <Message />
                </Router>
            </ThemeProvider>
        </div>
    );
};

export default Main;