// Importaciones
const express = require("express");
const cors = require("cors");

const mainMethods = require("./../controllers/rest.controllers");

const app = express();

app.use(express.json());
app.get("/testing-route-service", mainMethods.testing);

module.exports = app;