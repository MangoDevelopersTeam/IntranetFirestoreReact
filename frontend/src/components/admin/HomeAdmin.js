import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Skeleton } from '@material-ui/lab';
import { NavigateNext } from '@material-ui/icons';
import { Breadcrumbs, Button, Paper, Typography } from '@material-ui/core';

import { Decrypt } from '../../helpers/cipher/cipher';
import { showNewAdminDialog, showNewUserDialog } from '../../helpers/dialogs/handleDialogs';

import { SELECT_USER } from '../../redux/userSlice';

const HomeAdmin = () => {
    // uses
    const user = useSelector(SELECT_USER);

    return (
        <div>
        {
            user !== null ? (
                <React.Fragment>
                    <Paper style={{ padding: 20, marginBottom: 20 }} variant="outlined">
                        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                            <Typography style={{ color: "#2074d4" }}>Home</Typography>
                        </Breadcrumbs>
                    </Paper>

                    <Paper style={{ padding: 20 }} variant="outlined">
                        <Typography>Bienvenido Nuevamente Admin. {Decrypt(Decrypt(user).displayName)}</Typography>
                    </Paper>
                        
                    <Paper style={{ padding: 20, marginTop: 20, marginBottom: 20, display: "flex", alignItems: "center" }} variant="outlined">                      
                        <Link to="/profile" style={{ textDecoration: "none", color: "#000" }}>
                            <Button>Ir a mi Perfil</Button>
                        </Link>
                        <Button onClick={showNewUserDialog} style={{ marginLeft: 15, color: "#2074d4" }}>
                            Crear a un Nuevo Usuario
                        </Button>
                        <Button onClick={showNewAdminDialog} style={{ marginLeft: 15, color: "#2074d4" }}>
                            Crear a un Nuevo Administrador
                        </Button>
                    </Paper>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <Paper style={{ padding: 20, marginBottom: 20 }} variant="outlined">
                        <Skeleton variant="text" width={130} />
                    </Paper>

                    <Paper style={{ padding: 20 }} variant="outlined">
                        <Skeleton variant="text" width={260} />
                    </Paper>

                    <Paper style={{ padding: 20, marginTop: 20, marginBottom: 20, display: "flex", alignItems: "center" }} variant="outlined">
                        <Skeleton variant="rect" width={120} />
                        <Skeleton variant="rect" width={120} style={{ marginLeft: 15 }} />
                    </Paper> 
                </React.Fragment>
            )
        }
        </div>
    );
};

export default HomeAdmin;