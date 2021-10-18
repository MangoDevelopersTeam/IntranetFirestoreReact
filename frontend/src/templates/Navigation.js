import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Skeleton } from '@material-ui/lab';
import { Menu, ChevronLeft, ChevronRight,  ExitToApp, People, Home, Notes, Build } from '@material-ui/icons';
import { Drawer, AppBar, Toolbar, List, CssBaseline, Typography, Divider, IconButton, ListItem, ListItemIcon, ListItemText, makeStyles, useTheme } from '@material-ui/core';

import { Decrypt } from '../helpers/cipher/cipher';
import history from './../helpers/history/handleHistory';
import { clearAuthData } from '../helpers/auth/handleGetLevel';
import { deleteRefreshToken, deleteToken } from '../helpers/token/handleToken';

import clsx from 'clsx';

import axios from 'axios';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9) + 1,
        },
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

const Navigation = () => {
    // uses
    const theme = useTheme();
    const classes = useStyles();

    
    // useStates
    const [open, setOpen] = useState(false);
    const [access, setAccess] = useState(null);


    // Funciones
    /**
     * Función para abrir el drawer navigation
     */
    const handleDrawerOpen = () => {
        setOpen(true);
    };

    /**
     * Función para cerrar el drawer navigation
     */
    const handleDrawerClose = () => {
        setOpen(false);
    };

    
    // useCallback
    /**
     * useCallback paa obtener el nivel del usuario
     */
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
                if (error.response.data.code === "TOKEN_MISSING")
                {
                    clearAuthData();
                    history.push("/");
                }
                else if (error.response.data.code === "TOKEN_INVALID")
                {
                    deleteToken();
                    deleteRefreshToken();

                    clearAuthData();
                    history.push("/");
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

    /**
     * useCallback para cerrar la sesión del usuario y redirigir al inicio
     */
    const handleSignOut = useCallback(
        () => {
            clearAuthData();
            setAccess(null);

            history.push("/");
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
            <CssBaseline />
            <AppBar position="fixed" color="inherit" className={clsx(classes.appBar, { [classes.appBarShift]: open, })}>
                <Toolbar>
                    <IconButton color="inherit" aria-label="open drawer" onClick={handleDrawerOpen} edge="start" className={clsx(classes.menuButton, { [classes.hide]: open, })}>
                        <Menu />
                    </IconButton>
                    <div>
                        <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                            <Typography variant="h6" noWrap>
                                OpenIntranet
                            </Typography>
                        </Link>  
                    </div>
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" className={clsx(classes.drawer, { [classes.drawerOpen]: open, [classes.drawerClose]: !open, })} classes={{ paper: clsx({ [classes.drawerOpen]: open, [classes.drawerClose]: !open, }), }}>
                <div className={classes.toolbar}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
                    </IconButton>
                </div>
                <Divider />
                <List>
                    <div>
                    { access === null && (
                        <>
                            <ListItem>
                                <ListItemIcon>
                                    <Skeleton variant="rect" width={30} />
                                </ListItemIcon>
                                <ListItemText primary={<Skeleton variant="text" width={100} />} />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <Skeleton variant="rect" width={30} />
                                </ListItemIcon>
                                <ListItemText primary={<Skeleton variant="text" width={100} />} />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <Skeleton variant="rect" width={30} />
                                </ListItemIcon>
                                <ListItemText primary={<Skeleton variant="text" width={100} />} />
                            </ListItem>
                        
                            <ListItem>
                                <ListItemIcon>
                                    <Skeleton variant="rect" width={30} />
                                </ListItemIcon>
                                <ListItemText primary={<Skeleton variant="text" width={100} />} />
                            </ListItem>
                        </> 
                    ) }

                    { access !== null && Decrypt(access) === "admin" && (
                        <>
                            <Link to="/" style={{ textDecoration: "none", color: "#000" }}>
                                <ListItem button>
                                    <ListItemIcon>
                                        <Home />
                                    </ListItemIcon>
                                    <ListItemText primary="Home" />
                                </ListItem>
                            </Link>

                            <Link to="/users" style={{ textDecoration: "none", color: "#000" }}>
                                <ListItem button>
                                    <ListItemIcon>
                                        <People />
                                    </ListItemIcon>
                                    <ListItemText primary="Usuarios" />
                                </ListItem>
                            </Link>

                            <Link to="/subjects" style={{ textDecoration: "none", color: "#000" }}>
                                <ListItem button>
                                    <ListItemIcon>
                                        <Notes />
                                    </ListItemIcon>
                                    <ListItemText primary="Manejar Asignaturas" />
                                </ListItem>
                            </Link>

                            <Link to="/testing" style={{ textDecoration: "none", color: "#000" }}>
                                <ListItem button>
                                    <ListItemIcon>
                                        <Build />
                                    </ListItemIcon>
                                    <ListItemText primary="Testeos" />
                                </ListItem>
                            </Link>

                            <ListItem button onClick={() => handleSignOut()}>
                                <ListItemIcon>
                                    <ExitToApp />
                                </ListItemIcon>
                                <ListItemText primary="Salir" />
                            </ListItem>
                        </>
                    ) }
                                                      
                    { access !== null && Decrypt(access) === "teacher" && (
                        <>
                            <Link to="/" style={{ textDecoration: "none", color: "#000" }}>
                                <ListItem button>
                                    <ListItemIcon>
                                        <Home />
                                    </ListItemIcon>
                                    <ListItemText primary="Home" />
                                </ListItem>
                            </Link>

                            <Link to="/my-subjects" style={{ textDecoration: "none", color: "#000" }}>
                                <ListItem button>
                                    <ListItemIcon>
                                        <Notes />
                                    </ListItemIcon>
                                    <ListItemText primary="Mis Cursos" />
                                </ListItem>
                            </Link>

                            <ListItem button onClick={() => handleSignOut()}>
                                <ListItemIcon>
                                    <ExitToApp />
                                </ListItemIcon>
                                <ListItemText primary="Salir" />
                            </ListItem>
                        </>
                    ) }      

                    { access !== null && Decrypt(access) === "proxie" && (
                        <>
                            <ListItem button onClick={() => handleSignOut()}>
                                <ListItemIcon>
                                    <ExitToApp />
                                </ListItemIcon>
                                <ListItemText primary="Salir" />
                            </ListItem>
                        </>
                    ) } 

                    { access !== null && Decrypt(access) === "student" && (
                        <>
                            <Link to="/" style={{ textDecoration: "none", color: "#000" }}>
                                <ListItem button>
                                    <ListItemIcon>
                                        <Home />
                                    </ListItemIcon>
                                    <ListItemText primary="Home" />
                                </ListItem>
                            </Link>

                            <Link to="/my-subjects" style={{ textDecoration: "none", color: "#000" }}>
                                <ListItem button>
                                    <ListItemIcon>
                                        <Notes />
                                    </ListItemIcon>
                                    <ListItemText primary="Mis Cursos" />
                                </ListItem>
                            </Link>

                            <ListItem button onClick={() => handleSignOut()}>
                                <ListItemIcon>
                                    <ExitToApp />
                                </ListItemIcon>
                                <ListItemText primary="Salir" />
                            </ListItem>
                        </>
                    ) } 
                    </div>
                </List>
            </Drawer>
        </div>
    );
};

export default Navigation;