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
import Profile from './../components/Profile';
import Users from './../components/admin/Users';
import HomeTeacher from './teacher/HomeTeacher';
import Navigation from './../templates/Navigation';
import ManageSubject from './subject/ManageSubject';
import HomeAdmin from './../components/admin/HomeAdmin';
import UserDetail from './../components/admin/UserDetail';

import axios from 'axios';
import HomeStudent from './student/HomeStudent';
import Testing from './others/Testing';
import DetailedSubject from './teacher/DetailedSubject';

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

    // useCallback
    const handleGetAccess = useCallback(
        async () => {
            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-access")
            .then(result => {
                console.log("el resultado es", result);
                if (result.data.code === "PROCESS_OK")
                {
                    setAccess(result.data.data);
                }
            })
            .catch(error => {
                if (error.response.code === "TOKEN_MISSING")
                {
                    clearAuthData();
                    history.push("/");
                }
                else if (error.response.code === "TOKEN_INVALID")
                {
                    deleteToken();
                    deleteRefreshToken();

                    clearAuthData();
                    history.push("/");
                }
                else
                {
                    console.log("EROR : ", error.response.data.code);
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

    return (
        <div className={classes.root}>
            <ThemeProvider theme={theme}>
                <Router history={history}>
                    <Navigation />

                    <main className={classes.content}>
                        <div className={classes.toolbar} />

                        <Switch>
                            <Route exact path="/profile" component={Profile} />    
                
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
                                </Switch>
                            ) }
                                                      
                            { access !== null && Decrypt(access) === "teacher" && (
                                <Switch>
                                    <Route exact path="/" component={HomeTeacher}/> 
                                    <Route exact path="/my-subjects" component={MyCourses}/> 
                                    <Route exact path="/subject/:id" component={DetailedSubject}/> 
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