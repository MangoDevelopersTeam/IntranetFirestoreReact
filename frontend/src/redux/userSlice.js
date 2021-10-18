import { createSlice } from '@reduxjs/toolkit';

/**
 * initialState que contendrá el estao inicial de los datos de redux
 */
const initialState = {
    data: null
};

/**
 * createSlice para crear el slice que contiene el nombre del slice, el estado inicial, y los reducers que la conforman
 */
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        SET_DATA: (state, action) => {
            state.data = action.payload;
        },
        CLEAR_DATA: (state) => {
            state.data = null;
        }
    }
});

export const { SET_DATA, CLEAR_DATA } = userSlice.actions;

export const SELECT_USER = state => state.user.data; 

export default userSlice.reducer;