import React, { useCallback, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { Accordion, AccordionDetails, AccordionSummary, AppBar, Box, Breadcrumbs, Button, Card, CardContent, CircularProgress, Divider, FormControl, InputLabel, List, ListItem, ListItemText, makeStyles, MenuItem, Paper, Select, Tab, Tabs, Typography } from '@material-ui/core';
import { ExpandMore, NavigateNext } from '@material-ui/icons';

import { clearAuthData } from '../../helpers/auth/handleGetLevel';
import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';

import PropTypes from 'prop-types';

import axios from 'axios';
import history from '../../helpers/history/handleHistory';

import { myArrayRegions } from './../../utils/allCourses'
import { showMessage } from '../../helpers/message/handleMessage';

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

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    buttonOptions: {
        flexGrow: 1,
        marginTop: 15
    },
    appbarUsers: {
        top: 65,
        backgroundColor: theme.palette.background.paper,
    }
}));

const Users = () => {
    // uses
    // eslint-disable-next-line
    const classes = useStyles();
    const history = useHistory();

    // useStates
    const [value, setValue] = useState(0);
    const [students, setStudents] = useState(null);
    const [teachers, setTeachers] = useState(null);
    const [proxies, setProxies] = useState(null);

    const [callStudents, setCallStudents] = useState(true);
    const [callTeachers, setCallTeachers] = useState(false);
    const [callProxies, setCallProxies] = useState(false);

    const [loadingStudents, setLoadingStudents] = useState(true);
    const [loadingTeachers, setLoadingTeachers] = useState(false);
    const [loadingProxies, setLoadingProxies] = useState(false);

    const [regions, setRegions] = useState(null);
    const [communes, setCommunes] = useState(null);

    const [region, setRegion] = useState("");
    const [commune, setCommune] = useState("");


    // functions
    /**
     * Función para manejar el cambio del indice del tab
     * @param {Event} event evento que recibe
     * @param {Number} newValue indice del tab
     */
    const handleChange = (event, newValue) => {
        setValue(newValue);
        handleGetUsersByType(newValue);
    };


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
                if (result.data.code === "PROCESS_OK")
                {
                    if (type === "teacher")
                    {
                        setLoadingTeachers(false);
                        setTeachers(Decrypt(result.data.data)); 
                    }
                    else if (type === "student")
                    {
                        setLoadingStudents(false);
                        setStudents(Decrypt(result.data.data)); 
                    }
                    else if (type === "proxie")
                    {
                        setLoadingProxies(false);
                        setProxies(Decrypt(result.data.data)); 
                    }
                }
            })
            .catch(error => {
                console.log(error.response.data.error.message);
            })
            .finally(() => {
                return () => {
                    if (type === "teacher")
                    {
                        setTeachers(null); 
                    }
                    else if (type === "student")
                    {
                        setStudents(null); 
                    }
                    else if (type === "proxie")
                    {
                        setProxies(null); 
                    }
                }
            });     
        },
        [setTeachers, setStudents, setProxies],
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
     * useCallback para manejar el cambio de región
     */
    const handleChangeRegionCommune = useCallback(
        async (region) => {
            setCommune("");
            setCommunes([]);

            setRegion(region); 
            let lambda = regions.find(x => x.id === region);

            setCommunes(lambda.communes);
        },
        [regions, setCommune, setCommunes, setRegion],
    );




    const handleFilterUserByRegionCommune  = useCallback(
        async () => {
            if (region === "" || commune === "")
            {
                return showMessage("Complete los campos de busqueda", "info");
            }

            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/filter-region-commune", {
                params: {
                    communeParam: Encrypt(commune),
                    regionParam: Encrypt(region)   
                }
            })
            .then(result => {
                console.log(result);
            })
            .catch(error => {
                console.log(error);
            });
            /* .finally(() => {
                return () => {
                    if (type === "teacher")
                    {
                        setTeachers(null); 
                    }
                    else if (type === "student")
                    {
                        setStudents(null); 
                    }
                    else if (type === "proxie")
                    {
                        setProxies(null); 
                    }
                }
            }); */  
        },
        [region, commune],
    )

    
    // useEffects
    useEffect(() => {
        /**
         * Función para validar el token
         * @returns no retorna nada
         */
        let callQuery = async () => {
            let responseGetAccess = await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/whoami");

            if (await responseGetAccess.data.code === "TOKEN_MISSING" || await responseGetAccess.data.code === "FIREBASE_VERIFY_TOKEN_ERROR" || await responseGetAccess.data.code === "TOKEN_REVOKED" || await responseGetAccess.data.code === "TOKEN_INVALID")
            {
                clearAuthData();
                history.push("/");

                return;
            }

            return;
        };

        return callQuery();
    }, []);

    useEffect(() => {
        /**
         * Funión para obtener a los usuarios
         */
        let callQuery = async () => {
            await handleGetUsers("student");
        }

        callQuery();

        return () => {
            setStudents(null);
        }
    }, [handleGetUsers, setStudents]);

    useEffect(() => {
        let callQuery = () => {
            setRegions(myArrayRegions);
        };

        callQuery();

        return () => {
            setRegions(null);
        };        
    }, [setRegions]);


    return (
        <div> 
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
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                            </div>
                        ) : (
                            students === null ? (
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <CircularProgress style={{ color: "#2074d4" }} />
                                </div>
                            ) : (
                                students.length > 0 ? (
                                    <>
                                    {
                                        students.map(doc => (
                                            <ListItem key={doc.id} button onClick={() => history.push(`/users/${doc.id}`)}>
                                                <ListItemText primary={<Typography>{`${Decrypt(doc.data.name)} ${Decrypt(doc.data.surname)}`}</Typography>} secondary={<Typography>{Decrypt(doc.data.rut)}</Typography>} />
                                            </ListItem>
                                        ))
                                    }

                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                            <Button onClick={() => handleGetUsers("student")} style={{ color: "#2074d4" }}>Recargar Alumnos</Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Typography style={{ textAlign: "center" }}>No existen alumnos aún</Typography>
                                        
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                            <Button onClick={() => handleGetUsers("student")} style={{ color: "#2074d4" }}>Recargar Alumnos</Button>
                                        </div>
                                    </>
                                )
                            )
                        )
                    }
                    </TabPanel>

                    <TabPanel value={value} index={1}>
                    {
                        loadingTeachers === true ? (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                            </div>
                        ) : (
                            teachers === null ? (
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <CircularProgress style={{ color: "#2074d4" }} />
                                </div>
                            ) : (
                                teachers.length > 0 ? (
                                    <>
                                    {
                                        teachers.map(doc => (
                                            <Link key={doc.id} to={`/users/${doc.id}`} style={{ textDecoration: "none", color: "#333" }}>
                                                <ListItem button>
                                                    <ListItemText primary={<Typography>{`${Decrypt(doc.data.name)} ${Decrypt(doc.data.surname)}`}</Typography>} secondary={<Typography>{Decrypt(doc.data.rut)}</Typography>} />
                                                </ListItem>
                                            </Link>
                                        ))
                                    }

                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                            <Button onClick={() => handleGetUsers("teacher")} style={{ color: "#2074d4" }}>Recargar Profesores</Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Typography style={{ textAlign: "center" }}>No existen profesores aún</Typography>
                                        
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                            <Button onClick={() => handleGetUsers("teacher")} style={{ color: "#2074d4" }}>Recargar Profesores</Button>
                                        </div>
                                    </>
                                )
                            )
                        )
                    }
                    </TabPanel>

                    <TabPanel value={value} index={2}>
                    {
                        loadingProxies === true ? (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                            </div>
                        ) : (
                            proxies === null ? (
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <CircularProgress style={{ color: "#2074d4" }} />
                                </div>
                            ) : (
                                proxies.length > 0 ? (
                                    <>
                                    {
                                        proxies.map(doc => (
                                            <Link key={doc.id} to={`/users/${doc.id}`} style={{ textDecoration: "none", color: "#333" }}>
                                                <ListItem button>
                                                    <ListItemText primary={<Typography>{`${Decrypt(doc.data.name)} ${Decrypt(doc.data.surname)}`}</Typography>} secondary={<Typography>{Decrypt(doc.data.rut)}</Typography>} />
                                                </ListItem>
                                            </Link>
                                        ))
                                    }

                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                            <Button onClick={() => handleGetUsers("proxie")} style={{ color: "#2074d4" }}>Recargar Apoderados</Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Typography style={{ textAlign: "center" }}>No existen apoderados aún</Typography>
                                        
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                            <Button onClick={() => handleGetUsers("proxie")} style={{ color: "#2074d4" }}>Recargar Apoderados</Button>
                                        </div>
                                    </>
                                )
                            )
                        )
                    }
                    </TabPanel>
                </CardContent>
            </Card>              
        </div>
    );
};

export default Users;