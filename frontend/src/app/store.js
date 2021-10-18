import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

import message from './../redux/messageSlice';
import dialogs from './../redux/dialogsSlice';
import user from './../redux/userSlice';

/**
 * Root reducer que contendra a los reducers, si se quiere agregar mas reducer, solo debe importar el slice para alojarlo dentro de combineReducers
 */
const rootReducer = combineReducers({ user, dialogs, message });

/**
 * Configuración que se aplica a la store con persistencia de datos, traen valores como su nombre, el almacen o storage, y las listas blancas y negras, que simbolizan que reducers serán persistidos o no
 */
const persistConfig = {
    key: 'root',
    storage,
    blacklist: ['message', 'dialogs'],
    whilelist: ['user'],
};

/**
 * persistedReducer que es para persistir redux en la aplicación de React, se le debe otorgar la configuración y los reducers
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Configuración de la store para almacenar datos de redux en la tienda, tiene los siguientes parametros, reducer: son los reducers que se usarán en el proyecto, middleware: son funciones que se ejecutarán al momento de cambiar un parametro, devTools: es un boolean que permite o no el uso de redux devTools
 */
const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
    devTools: true
});

/**
 * persistor que será exportado para que la pueda usar PersistGate en index.js
 */
const persistor = persistStore(store);

export { store, persistor };