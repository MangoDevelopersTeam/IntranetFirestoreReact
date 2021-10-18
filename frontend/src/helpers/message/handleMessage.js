// Store para acceder a la tienda de redux
import { store } from './../../app/store';

// Slice de mensajes
import { SET_CONTENT, SET_OPEN, SET_SEVERITY, CLEAR_OPEN } from './../../redux/messageSlice';

/**
 * Función que muestra el mensaje informativo
 * @param {String} content contenido del mensaje
 * @param {String} severity Tipo de severidad del mensaje, ya sea success, danger, warning o info
 */
export const showMessage = (content, severity) => {
    store.dispatch(SET_CONTENT(content));
    store.dispatch(SET_SEVERITY(severity));
    store.dispatch(SET_OPEN());
};

/**
 * Función que cierra el mensaje informativo
 */
export const hideMessage = () => {
    store.dispatch(CLEAR_OPEN());
};