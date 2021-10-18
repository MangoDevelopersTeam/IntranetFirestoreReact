import React from 'react';

import { Paper, Typography } from '@material-ui/core';
import { ErrorOutline } from '@material-ui/icons';

const Error = ({ elem, reason }) => {
    return (
        <div>
            <Paper variant="outlined" style={{ padding: 20, margin: "auto" }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography variant="h2" color="secondary">
                        Error Inesperado
                    </Typography>
                    <Typography style={{ marginTop: 10, marginLeft: 25 }} color="textSecondary">
                        <ErrorOutline fontSize="large" color="secondary" />
                    </Typography>
                </div>
                <Typography variant="h5" color="secondary" style={{ marginLeft: 5, marginTop: 15 }}>
                    {`${elem} no existe, asegurese de que haya ingresado bien el id ${reason}`} 
                </Typography>
            </Paper>
        </div>
    )
}

export default Error;