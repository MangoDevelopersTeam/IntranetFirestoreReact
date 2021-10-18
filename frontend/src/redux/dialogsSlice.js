import { createSlice } from '@reduxjs/toolkit';

/**
 * initialState que contendrá el estao inicial de los datos de redux
 */
const initialState = {
    newAdminDialog: false,
    newUserDialog: false,
    newCourseDialog: false
};

/**
 * createSlice para crear el slice que contiene el nombre del slice, el estado inicial, y los reducers que la conforman
 */
const dialogsSlice = createSlice({
    name: "dialogs",
    initialState,
    reducers: {
        SET_NEW_ADMIN_DIALOG: (state) => {
            state.newAdminDialog = true;
        },
        CLEAR_NEW_ADMIN_DIALOG: (state) => {
            state.newAdminDialog = false;
        },
        SET_NEW_USER_DIALOG: (state) => {
            state.newUserDialog = true;
        },
        CLEAR_NEW_USER_DIALOG: (state) => {
            state.newUserDialog = false;
        },
        SET_COURSE_DIALOG: (state) => {
            state.newCourseDialog = true;
        },
        CLEAR_COURSE_DIALOG: (state) => {
            state.newCourseDialog = false
        },
    }
});

export const { SET_NEW_ADMIN_DIALOG, CLEAR_NEW_ADMIN_DIALOG, SET_NEW_USER_DIALOG, CLEAR_NEW_USER_DIALOG, SET_COURSE_DIALOG, CLEAR_COURSE_DIALOG } = dialogsSlice.actions;

export const SELECT_NEW_ADMIN = state => state.dialogs.newAdminDialog;
export const SELECT_NEW_USER = state => state.dialogs.newUserDialog;
export const SELECT_NEW_COURSE = state => state.dialogs.newCourseDialog;

export default dialogsSlice.reducer;