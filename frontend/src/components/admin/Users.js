import React, { useCallback, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { AppBar, Box, Breadcrumbs, Button, Card, CardContent, CircularProgress, Divider, ListItem, ListItemText, Paper, Tab, Tabs, Typography } from '@material-ui/core';
import { NavigateNext } from '@material-ui/icons';

import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';

import PropTypes from 'prop-types';

import axios from 'axios';

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && (
                <Box p={3}>
                    <div>
                        {children}
                    </div>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

const a11yProps = (index) => {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const Users = () => {
    // uses
    const history = useHistory();

    // useStates
    const [students, setStudents] = useState(null);
    const [callStudents, setCallStudents] = useState(true);
    const [errorStudents, setErrorStudents] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [errorCode, setErrorCode] = useState(null);
    
    const [teachers, setTeachers] = useState(null);
    const [callTeachers, setCallTeachers] = useState(false);
    const [errorTeachers, setErrorTeachers] = useState(false);
    const [loadingTeachers, setLoadingTeachers] = useState(false);

    const [proxies, setProxies] = useState(null);
    const [callProxies, setCallProxies] = useState(false);
    const [errorProxies, setErrorProxies] = useState(false);
    const [loadingProxies, setLoadingProxies] = useState(false);

    const [value, setValue] = useState(0);

    // useCallbacks
    /**
     * useCallback para obtener los tipos de usuarios
     */
    const handleGetUsers = useCallback(
        async (type) => {
            if (type === "teacher")
            {
                setLoadingTeachers(true);
            }
            else if (type === "student")
            {
                setLoadingStudents(true);
            }
            else if (type === "proxie")
            {
                setLoadingProxies(true);
            }

            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-users", {
                params: {
                    levelParam: Encrypt(type)   
                }
            })
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    if (type === "teacher")
                    {
                        setTeachers(Decrypt(result.data.data)); 
                        setLoadingTeachers(false);
                        setErrorTeachers(false);
                        setErrorCode(null);
                    }
                    else if (type === "student")
                    {
                        setStudents(Decrypt(result.data.data)); 
                        setLoadingStudents(false);
                        setErrorStudents(false);
                        setErrorCode(null);
                    }
                    else if (type === "proxie")
                    {
                        setProxies(Decrypt(result.data.data)); 
                        setLoadingProxies(false);
                        setErrorProxies(false);
                        setErrorCode(null);
                    }
                }
                else
                {
                    if (type === "teacher")
                    {
                        setTeachers(undefined); 
                        setLoadingTeachers(false);
                        setErrorTeachers(true);
                        setErrorCode(result.data.code);
                    }
                    else if (type === "student")
                    {
                        setStudents(undefined); 
                        setLoadingStudents(false);
                        setErrorStudents(true);
                        setErrorCode(result.data.code);
                    }
                    else if (type === "proxie")
                    {
                        setProxies(undefined); 
                        setLoadingProxies(false);
                        setErrorProxies(true);
                        setErrorCode(result.data.code);
                    }
                }
            })
            .catch(error => {
                if (type === "teacher")
                {
                    setTeachers(undefined); 
                    setLoadingTeachers(false);
                    setErrorTeachers(true);
                    setErrorCode(error.response.data.error.code);
                }
                else if (type === "student")
                {
                    setStudents(undefined); 
                    setLoadingStudents(false);
                    setErrorStudents(true);
                    setErrorCode(error.response.data.error.code);
                }
                else if (type === "proxie")
                {
                    setProxies(undefined); 
                    setLoadingProxies(false);
                    setErrorProxies(true);
                    setErrorCode(error.response.data.error.code);
                }

                console.log(error.response.data.error.message);
            })
            .finally(() => {
                return () => {
                    setStudents(null);
                    setCallStudents(null);
                    setErrorStudents(null);
                    setLoadingStudents(null);
                    setErrorCode(null);
                    
                    setTeachers(null);
                    setCallTeachers(null);
                    setErrorTeachers(null);
                    setLoadingTeachers(null);

                    setProxies(null);
                    setCallProxies(null);
                    setErrorProxies(null);
                    setLoadingProxies(null);
                }
            });     
        },
        [setStudents, setCallStudents, setErrorStudents, setLoadingStudents, setErrorCode, setTeachers, setCallTeachers, setErrorTeachers, setLoadingTeachers, setProxies, setCallProxies, setErrorProxies, setLoadingProxies],
    );

    /**
     * useCallback para obtener usuarios por tipo
     */
    const handleGetUsersByType = useCallback(
        async (index) => {
            if (index === 0 && callStudents === false)
            {      
                setCallStudents(true);
                return await handleGetUsers("student");
            }
            else if (index === 1 && callTeachers === false)
            {  
                setCallTeachers(true);
                return await handleGetUsers("teacher");
            }
            else if (index === 2 && callProxies === false)
            {   
                setCallProxies(true);
                return await handleGetUsers("proxie");
            }
        },
        [callStudents, callTeachers, callProxies, handleGetUsers],
    );

    /**
     * Función para manejar el cambio del indice del tab
     * @param {Event} event evento que recibe
     * @param {Number} newValue indice del tab
     */
    const handleChange = useCallback(
        (event, newValue) => {
            setValue(newValue);
            handleGetUsersByType(newValue);
        },
        [setValue, handleGetUsersByType],
    );

    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            await handleGetUsers("student");
        }

        callQuery();

        return () => {
            setStudents(null);
        }
    }, [handleGetUsers, setStudents]);


    return (
        <Paper elevation={0}> 
            <Paper style={{ padding: 20, marginBottom: 15 }} variant="outlined">
                <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                    <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                        Home
                    </Link>
                    <Typography style={{ color: "#2074d4" }}>Usuarios</Typography>
                </Breadcrumbs>
            </Paper>

            <AppBar position="sticky" variant="outlined" elevation={0} color="inherit" style={{ top: 65 }}>
                <Tabs value={value} onChange={handleChange} TabIndicatorProps={{ style: { backgroundColor: "#2074d4"} }} textColor="inherit" centered>
                    <Tab wrapped label="Alumnos" {...a11yProps(0)} />
                    <Tab wrapped label="Docentes" {...a11yProps(1)} />
                    <Tab wrapped label="Apoderados" {...a11yProps(2)} />     
                </Tabs>
            </AppBar>  

            <Card variant="outlined" style={{ marginBottom: 15 }}>
                <CardContent>
                    <TabPanel value={value} index={0}>
                    {
                        loadingStudents === true ? (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 30 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando Estudiantes</Typography>
                            </Paper>
                        ) : errorStudents === true ? (
                            <React.Fragment>
                                <Typography style={{ textAlign: "center" }}>
                                {
                                    errorCode !== null ? (
                                        errorCode === "NO_USERS_ASSIGNED" ? (
                                            "No hay usuarios creados aquí"
                                        ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                        ) : (
                                            "Ha ocurrido un error, intente obtener los usuarios nuevamente"
                                        )
                                    ) : (
                                        "Ha ocurrido un error, intente obtener los usuarios nuevamente"
                                    )
                                }
                                </Typography>
                                
                                <React.Fragment>
                                {
                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                        <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                            <Button onClick={async () => await handleGetUsers("student")} style={{ color: "#2074d4" }}>
                                                <Typography variant="button">Recargar Alumnos</Typography>
                                            </Button>
                                        </Paper>
                                    )
                                }
                                </React.Fragment>
                            </React.Fragment>     
                        ) : students === null ? (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 30 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando Estudiantes</Typography>
                            </Paper>
                        ) : students === undefined ? (
                            <React.Fragment>
                                <Typography style={{ textAlign: "center" }}>
                                {
                                    errorCode !== null ? (
                                        errorCode === "NO_USERS_ASSIGNED" ? (
                                            "No hay usuarios creados aquí"
                                        ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                        ) : (
                                            "Ha ocurrido un error, intente obtener los usuarios nuevamente"
                                        )
                                    ) : (
                                        "Ha ocurrido un error, intente obtener los usuarios nuevamente"
                                    )
                                }
                                </Typography>
                                
                                <React.Fragment>
                                {
                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                        <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                            <Button onClick={async () => await handleGetUsers("student")} style={{ color: "#2074d4" }}>
                                                <Typography variant="button">Recargar Alumnos</Typography>
                                            </Button>
                                        </Paper>
                                    )
                                }
                                </React.Fragment>
                            </React.Fragment>    
                        ) : students.length <= 0 ? (
                            <React.Fragment>
                                <Typography style={{ textAlign: "center", marginTop: 15, marginBottom: 15 }}>No existen alumnos aún</Typography>
                                        
                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                    <Button onClick={async () => await handleGetUsers("student")} style={{ color: "#2074d4" }}>
                                        <Typography variant="button">Recargar Alumnos</Typography>
                                    </Button>
                                </Paper>
                            </React.Fragment>             
                        ) : (
                            <React.Fragment>
                                <React.Fragment>
                                {
                                    students.map(doc => (
                                        <ListItem key={doc.id} button onClick={() => history.push(`/users/${doc.id}`)}>
                                            <ListItemText primary={<Typography>{`${Decrypt(doc.data.name)} ${Decrypt(doc.data.surname)}`}</Typography>} secondary={<Typography>{Decrypt(doc.data.rut)}</Typography>} />
                                        </ListItem>
                                    ))
                                }   
                                </React.Fragment>
                            
                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                    <Button onClick={async () => await handleGetUsers("student")} style={{ color: "#2074d4" }}>
                                        <Typography variant="button">Recargar Alumnos</Typography>
                                    </Button>
                                </Paper>
                            </React.Fragment>
                        )        
                    }
                    </TabPanel>

                    <TabPanel value={value} index={1}>
                    {
                        loadingTeachers === true ? (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 30 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando Profesores</Typography>
                            </Paper>
                        ) : errorTeachers === true ? (
                            <React.Fragment>
                                <Typography style={{ textAlign: "center" }}>
                                {
                                    errorCode !== null ? (
                                        errorCode === "NO_USERS_ASSIGNED" ? (
                                            "No hay usuarios creados aquí"
                                        ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                        ) : (
                                            "Ha ocurrido un error, intente obtener los usuarios nuevamente"
                                        )
                                    ) : (
                                        "Ha ocurrido un error, intente obtener los usuarios nuevamente"
                                    )
                                }
                                </Typography>
                                
                                <React.Fragment>
                                {
                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                        <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                            <Button onClick={async () => await handleGetUsers("teacher")} style={{ color: "#2074d4" }}>
                                                <Typography variant="button">Recargar Profesores</Typography>
                                            </Button>
                                        </Paper>
                                    )
                                }
                                </React.Fragment>
                            </React.Fragment>     
                        ) : teachers === null ? (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 30 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando Profesores</Typography>
                            </Paper>
                        ) : teachers === undefined ? (
                            <React.Fragment>
                                <Typography style={{ textAlign: "center" }}>
                                {
                                    errorCode !== null ? (
                                        errorCode === "NO_USERS_ASSIGNED" ? (
                                            "No hay usuarios creados aquí"
                                        ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                        ) : (
                                            "Ha ocurrido un error, intente obtener los usuarios nuevamente"
                                        )
                                    ) : (
                                        "Ha ocurrido un error, intente obtener los usuarios nuevamente"
                                    )
                                }
                                </Typography>
                                
                                <React.Fragment>
                                {
                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                        <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                            <Button onClick={async () => await handleGetUsers("teacher")} style={{ color: "#2074d4" }}>
                                                <Typography variant="button">Recargar Profesores</Typography>
                                            </Button>
                                        </Paper>
                                    )
                                }
                                </React.Fragment>
                            </React.Fragment>    
                        ) : teachers.length <= 0 ? (
                            <React.Fragment>
                                <Typography style={{ textAlign: "center", marginTop: 15, marginBottom: 15 }}>No existen profesores aún</Typography>
                                        
                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                    <Button onClick={async () => await handleGetUsers("teacher")} style={{ color: "#2074d4" }}>
                                        <Typography variant="button">Recargar Profesores</Typography>
                                    </Button>
                                </Paper>
                            </React.Fragment>             
                        ) : (
                            <React.Fragment>
                                <React.Fragment>
                                {
                                    teachers.map(doc => (
                                        <ListItem key={doc.id} button onClick={() => history.push(`/users/${doc.id}`)}>
                                            <ListItemText primary={<Typography>{`${Decrypt(doc.data.name)} ${Decrypt(doc.data.surname)}`}</Typography>} secondary={<Typography>{Decrypt(doc.data.rut)}</Typography>} />
                                        </ListItem>
                                    ))
                                }   
                                </React.Fragment>
                            
                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                    <Button onClick={async () => await handleGetUsers("teacher")} style={{ color: "#2074d4" }}>
                                        <Typography variant="button">Recargar Profesores</Typography>
                                    </Button>
                                </Paper>
                            </React.Fragment>
                        )        
                    }
                    </TabPanel>

                    <TabPanel value={value} index={2}>
                    {
                        loadingProxies === true ? (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 30 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando Apoderados</Typography>
                            </Paper>
                        ) : errorProxies === true ? (
                            <React.Fragment>
                                <Typography style={{ textAlign: "center" }}>
                                {
                                    errorCode !== null ? (
                                        errorCode === "NO_USERS_ASSIGNED" ? (
                                            "No hay usuarios creados aquí"
                                        ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                        ) : (
                                            "Ha ocurrido un error, intente obtener los usuarios nuevamente"
                                        )
                                    ) : (
                                        "Ha ocurrido un error, intente obtener los usuarios nuevamente"
                                    )
                                }
                                </Typography>
                                
                                <React.Fragment>
                                {
                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                        <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                            <Button onClick={async () => await handleGetUsers("proxie")} style={{ color: "#2074d4" }}>
                                                <Typography variant="button">Recargar Apoderados</Typography>
                                            </Button>
                                        </Paper>
                                    )
                                }
                                </React.Fragment>
                            </React.Fragment>     
                        ) : proxies === null ? (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 30 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando Apoderados</Typography>
                            </Paper>
                        ) : proxies === undefined ? (
                            <React.Fragment>
                                <Typography style={{ textAlign: "center" }}>
                                {
                                    errorCode !== null ? (
                                        errorCode === "NO_USERS_ASSIGNED" ? (
                                            "No hay usuarios creados aquí"
                                        ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                        ) : (
                                            "Ha ocurrido un error, intente obtener los usuarios nuevamente"
                                        )
                                    ) : (
                                        "Ha ocurrido un error, intente obtener los usuarios nuevamente"
                                    )
                                }
                                </Typography>
                                
                                <React.Fragment>
                                {
                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                        <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                            <Button onClick={async () => await handleGetUsers("proxie")} style={{ color: "#2074d4" }}>
                                                <Typography variant="button">Recargar Apoderados</Typography>
                                            </Button>
                                        </Paper>
                                    )
                                }
                                </React.Fragment>
                            </React.Fragment>    
                        ) : proxies.length <= 0 ? (
                            <React.Fragment>
                                <Typography style={{ textAlign: "center", marginTop: 15, marginBottom: 15 }}>No existen apoderados aún</Typography>
                                        
                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                    <Button onClick={async () => await handleGetUsers("proxie")} style={{ color: "#2074d4" }}>
                                        <Typography variant="button">Recargar Apoderados</Typography>
                                    </Button>
                                </Paper>
                            </React.Fragment>             
                        ) : (
                            <React.Fragment>
                                <React.Fragment>
                                {
                                    proxies.map(doc => (
                                        <ListItem key={doc.id} button onClick={() => history.push(`/users/${doc.id}`)}>
                                            <ListItemText primary={<Typography>{`${Decrypt(doc.data.name)} ${Decrypt(doc.data.surname)}`}</Typography>} secondary={<Typography>{Decrypt(doc.data.rut)}</Typography>} />
                                        </ListItem>
                                    ))
                                }   
                                </React.Fragment>
                            
                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                    <Button onClick={async () => await handleGetUsers("proxie")} style={{ color: "#2074d4" }}>
                                        <Typography variant="button">Recargar Apoderados</Typography>
                                    </Button>
                                </Paper>
                            </React.Fragment>
                        )        
                    }
                    </TabPanel>
                </CardContent>
            </Card>              
        </Paper>
    );
};

export default Users;