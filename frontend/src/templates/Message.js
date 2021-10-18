import React from 'react';
import { useSelector } from 'react-redux';

import { Alert } from '@material-ui/lab';
import { Snackbar, Fade } from '@material-ui/core';

import { hideMessage } from './../helpers/message/handleMessage';

import { SELECT_OPEN, SELECT_CONTENT, SELECT_SEVERITY } from './../redux/messageSlice';

const Message = () => {
    // uses
    const open = useSelector(SELECT_OPEN);
    const content = useSelector(SELECT_CONTENT);
    const severity = useSelector(SELECT_SEVERITY);

    // funciones
    /**
     * Función para manejar el cierre del mensaje 
     * @param {e} event evento
     * @param {String} reason razón
     * @returns no retorna acción
     */
    const handleClose = async (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        return hideMessage();
    };

    return (
        <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'left', }} open={open} autoHideDuration={2000} TransitionComponent={Fade} onClose={handleClose}>
            <Alert onClose={handleClose} severity={severity}>
                {content}
            </Alert>
        </Snackbar>
    );
};

export default Message;