// Store para acceder a la tienda de redux
import { store } from './../../app/store';

// Slice de dialogs
import { SET_NEW_ADMIN_DIALOG, CLEAR_NEW_ADMIN_DIALOG, SET_NEW_USER_DIALOG, CLEAR_NEW_USER_DIALOG, SET_COURSE_DIALOG, CLEAR_COURSE_DIALOG } from './../../redux/dialogsSlice';

/**
 * Función que muestra el dialogo crear nuevo administrador
 */
export const showNewAdminDialog = () => {
    store.dispatch(SET_NEW_ADMIN_DIALOG());
};

/**
 * Función que cierra el dialogo crear nuevo administrador
 */
export const hideNewAdminDialog = () => {
    store.dispatch(CLEAR_NEW_ADMIN_DIALOG());
};

/**
 * Función que muestra el dialogo crear nuevo usuario
 */
export const showNewUserDialog = () => {
    store.dispatch(SET_NEW_USER_DIALOG());
};

/**
 * Función que cierra el dialogo crear nuevo usuario
 */
export const hideNewUserDialog = () => {
    store.dispatch(CLEAR_NEW_USER_DIALOG());
};

/**
 * Función que muestra el dialogo crear nueva asignatura
 */
export const showNewCourseDialog = () => {
    store.dispatch(SET_COURSE_DIALOG());
};

/**
 * Función que cierra el dialogo crear nueva asigatura
 */
export const hideNewCourseDialog = () => {
    store.dispatch(CLEAR_COURSE_DIALOG());
};