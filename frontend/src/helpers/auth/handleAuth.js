import { store } from './../../app/store';

import { SET_DATA, CLEAR_DATA } from './../../redux/userSlice';

/**
 * Función para setear un usuario en redux
 * @param {Object} user Objeto json de usuario
 */
export const setUserRedux = (user) => {
    store.dispatch(SET_DATA(user));
};

/**
 * Función para limpiar un usuario en redux
 */
export const clearUserRedux = () => {
    store.dispatch(CLEAR_DATA());
};