import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { NavigateNext } from '@material-ui/icons';
import { Breadcrumbs, Button, CircularProgress, Paper, Typography } from '@material-ui/core';

import { Decrypt } from '../../helpers/cipher/cipher';

import { SELECT_USER } from '../../redux/userSlice';

const HomeTeacher = () => {
    // uses
    const user = useSelector(SELECT_USER);

    return (
        <Paper elevation={0}>
        {
            user !== null ? (
                <React.Fragment>
                    <Paper style={{ padding: 20, marginBottom: 20 }} variant="outlined">
                        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                            <Typography style={{ color: "#2074d4" }}>Home</Typography>
                        </Breadcrumbs>
                    </Paper>

                    <Paper style={{ padding: 20 }} variant="outlined">
                        <Typography>Bienvenido Nuevamente Profesor { user !== null ? Decrypt(Decrypt(user).displayName) : "" }</Typography>
                    </Paper>
                                
                    <Paper style={{ padding: 20, marginTop: 20, marginBottom: 20, display: "flex", alignItems: "center" }} variant="outlined">                      
                        <Link to="/profile" style={{ textDecoration: "none", color: "#000" }}>
                            <Button>Ir a mi Perfil</Button>
                        </Link>
                    </Paper>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 200 }}>
                        <CircularProgress style={{ color: "#2074d4" }} />
                        <Typography style={{ marginTop: 15 }}>Cargando Usuario</Typography>
                    </Paper>
                </React.Fragment>
            )
        }           
        </Paper>
    );
};

export default HomeTeacher;