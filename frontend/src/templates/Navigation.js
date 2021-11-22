import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Menu, ChevronLeft, ChevronRight,  ExitToApp, People, Home, Notes, Build, GridOn, FormatListNumbered } from '@material-ui/icons';
import { Drawer, AppBar, Toolbar, List, CssBaseline, Typography, Divider, IconButton, ListItem, ListItemIcon, ListItemText, makeStyles, useTheme, Paper, CircularProgress } from '@material-ui/core';

import { Decrypt } from '../helpers/cipher/cipher';
import history from './../helpers/history/handleHistory';
import { clearAuthData } from '../helpers/auth/handleGetLevel';

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

    const [errorAccess, setErrorAccess] = useState(false);
    const [loadingAccess, setLoadingAccess] = useState(true);


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
                }
            });
        },
        [setAccess, setErrorAccess, setLoadingAccess],
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
            setErrorAccess(null);
            setLoadingAccess(null);
        }
    }, [handleGetAccess, setAccess, setErrorAccess, setLoadingAccess]);


    return (
        <Paper elevation={0} className={classes.root}>
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
                    <Paper elevation={0}>
                    { 
                        loadingAccess === true ? (
                            <Paper elevation={0} style={{ height: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                            </Paper>
                        ) : (
                            errorAccess === true ? (
                                <Paper>
                                   <ListItem button onClick={() => handleSignOut()}>
                                        <ListItemIcon>
                                            <ExitToApp />
                                        </ListItemIcon>
                                        <ListItemText primary="Salir" />
                                    </ListItem>
                                </Paper>
                            ) : (
                                access === null ? (
                                    <Paper elevation={0} style={{ height: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                    </Paper>
                                ) : (
                                    <React.Fragment>
                                        { Decrypt(access) === "admin" && (
                                            <React.Fragment>
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
                                            </React.Fragment>
                                        ) }
                                                      
                                        { Decrypt(access) === "teacher" && (
                                            <React.Fragment>
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
                                            </React.Fragment>
                                        ) }      

                                        { Decrypt(access) === "proxie" && (
                                            <React.Fragment>
                                                <Link to="/" style={{ textDecoration: "none", color: "#000" }}>
                                                    <ListItem button>
                                                        <ListItemIcon>
                                                            <Home />
                                                        </ListItemIcon>
                                                        <ListItemText primary="Home" />
                                                    </ListItem>
                                                </Link>

                                                <ListItem button onClick={() => handleSignOut()}>
                                                    <ListItemIcon>
                                                        <ExitToApp />
                                                    </ListItemIcon>
                                                    <ListItemText primary="Salir" />
                                                </ListItem>
                                            </React.Fragment>
                                        ) } 

                                        { Decrypt(access) === "student" && (
                                            <React.Fragment>
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

                                                <Link to="/my-grades" style={{ textDecoration: "none", color: "#000" }}>
                                                    <ListItem button>
                                                        <ListItemIcon>
                                                            <GridOn />
                                                        </ListItemIcon>
                                                        <ListItemText primary="Mis Notas" />
                                                    </ListItem>
                                                </Link>

                                                <Link to="/my-annotations" style={{ textDecoration: "none", color: "#000" }}>
                                                    <ListItem button>
                                                        <ListItemIcon>
                                                            <FormatListNumbered />
                                                        </ListItemIcon>
                                                        <ListItemText primary="Mis Anotaciones" />
                                                    </ListItem>
                                                </Link>

                                                <ListItem button onClick={() => handleSignOut()}>
                                                    <ListItemIcon>
                                                        <ExitToApp />
                                                    </ListItemIcon>
                                                    <ListItemText primary="Salir" />
                                                </ListItem>
                                            </React.Fragment>
                                        ) } 
                                    </React.Fragment>
                                )
                            )
                        ) 
                    }
                    </Paper>
                </List>
            </Drawer>
        </Paper>
    );
};

export default Navigation;