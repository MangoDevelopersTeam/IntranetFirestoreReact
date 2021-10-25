import React, { useCallback, useEffect, useState } from 'react';
import { Router, Route, Switch } from 'react-router-dom';

import { makeStyles, ThemeProvider, unstable_createMuiStrictModeTheme as MuiThemeUS } from '@material-ui/core';

import { Decrypt } from '../helpers/cipher/cipher';
import history from './../helpers/history/handleHistory';
import { clearAuthData } from '../helpers/auth/handleGetLevel';
import { deleteRefreshToken, deleteToken } from '../helpers/token/handleToken';

import Loading from './others/Loading';
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

import ManageSubject from './subject/ManageSubject';

import HomeStudent from './student/HomeStudent';

import Testing from './others/Testing';
import ErrorMain from './others/ErrorMain';
import RouteNotFound from './others/RouteNotFound';

import axios from 'axios';
import StudentsSubject from './teacher/StudentsSubject';

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
    const [error, setError] = useState(false);


    // useCallback
    /**
     * useCallback para obtener el nivel de acceso del usuario
     */
    const handleGetAccess = useCallback(
        async () => {
            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-access")
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {   
                    setError(false);
                    setAccess(result.data.data);
                    
                    return;
                }
                else
                {
                    return setError(true);
                }
            })
            .catch(error => {
                if (error.response)
                {
                    if (error.response.code === "TOKEN_MISSING")
                    {
                        clearAuthData();
                        history.push("/");

                        return;
                    }
                    else if (error.response.code === "TOKEN_INVALID")
                    {
                        deleteToken();
                        deleteRefreshToken();

                        clearAuthData();
                        history.push("/");

                        return;
                    }
                    else
                    {
                        return setError(true);
                    }
                }
            })
            .finally(() => {
                return () => {
                    setAccess(null);
                    setError(null);
                }
            });
        },
        [setAccess, setError],
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


    return (
        <div className={classes.root}>
            <ThemeProvider theme={theme}>
                <Router history={history}>
                    <Navigation />

                    <main className={classes.content}>
                        <div className={classes.toolbar} />

                        <Switch>
                            <Route exact path="/profile" component={Profile} />    
                
                            { error === true && (
                                <Route component={ErrorMain} />
                            ) }

                            { access === null && (
                                <Route component={Loading} /> 
                            ) }

                            { access !== null && Decrypt(access) === "admin" && (
                                <Switch>
                                    <Route exact path="/" component={HomeAdmin}/> 
                                    <Route exact path="/users" component={Users} />
                                    <Route exact path="/users/:id" component={UserDetail} />
                                    <Route exact path="/subjects" component={ManageSubject} />
                                    <Route exact path="/subjects/:id" component={Subject} />
                                    <Route exact path="/testing" component={Testing} />
                                    <Route component={RouteNotFound} />
                                </Switch>
                            ) }
                                                      
                            { access !== null && Decrypt(access) === "teacher" && (
                                <Switch>
                                    <Route exact path="/" component={HomeTeacher}/> 
                                    <Route exact path="/my-subjects" component={MyCourses}/> 
                                    <Route exact path="/subject/:id" component={DetailedSubject}/> 
                                    <Route exact path="/subject/students/:id" component={StudentsSubject}/> 
                                </Switch>
                            ) }  

                            { access !== null && Decrypt(access) === "student" && (
                                <Switch>
                                    <Route exact path="/" component={HomeStudent}/> 
                                    <Route exact path="/my-subjects" component={MyCourses}/> 
                                    <Route exact path="/subject/:id" component={DetailedSubject}/>
                                </Switch>
                            ) }                
                        </Switch>
                        
                    </main>

                    <Dialogs />
                    <Message />
                </Router>
            </ThemeProvider>
        </div>
    );
};

export default Main;