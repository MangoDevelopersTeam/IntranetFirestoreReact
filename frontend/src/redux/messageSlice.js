import { createSlice } from '@reduxjs/toolkit';

/**
 * initialState que contendrá el estao inicial de los datos de redux
 */
const initialState = {
    content: "",
    open: false,
    severity: "info"
};

/**
 * createSlice para crear el slice que contiene el nombre del slice, el estado inicial, y los reducers que la conforman
 */
const messageSlice = createSlice({
    name: "message",
    initialState,
    reducers: {
        SET_CONTENT: (state, action) => {
            state.content = action.payload;
        },
        CLEAR_CONTENT: (state) => {
            state.content = "";
        }, 
        SET_OPEN: (state) => {
            state.open = true;
        },
        CLEAR_OPEN: (state) => {
            state.open = false;
        },
        SET_SEVERITY: (state, action) => {
            state.severity = action.payload;
        },
        CLEAR_SEVERITY: (state) => {
            state.severity = "info";
        }
    }
});

export const { SET_CONTENT, CLEAR_CONTENT, SET_OPEN, CLEAR_OPEN, SET_SEVERITY, CLEAR_SEVERITY } = messageSlice.actions;

export const SELECT_CONTENT = state => state.message.content;
export const SELECT_OPEN = state => state.message.open;
export const SELECT_SEVERITY = state => state.message.severity;

export default messageSlice.reducer;