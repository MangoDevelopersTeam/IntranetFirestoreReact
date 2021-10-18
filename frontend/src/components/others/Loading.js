import React from 'react';

import { Paper, Typography } from '@material-ui/core';
import { Loop } from '@material-ui/icons';

const Loading = () => {
    return (
        <div>
            <Paper variant="outlined" style={{ padding: 20, margin: "auto" }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography variant="h2" color="textSecondary">
                        Cargando
                    </Typography>
                    <Typography style={{ marginTop: 10, marginLeft: 25 }} color="textSecondary">
                        <Loop fontSize="large" />
                    </Typography>
                </div>
                <Typography variant="h5" style={{ marginLeft: 5, marginTop: 15 }}>
                    Estamos cargando el contenido para usted, espere un momento porfavor...
                </Typography>
            </Paper>
        </div>
    )
}

export default Loading;