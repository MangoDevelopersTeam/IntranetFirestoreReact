const functions = require("firebase-functions");
const indexApp = require("./routes/index.routes");
const restApp = require("./routes/rest.routes");

exports.api = functions.https._onRequestWithOptions(indexApp, {
    memory: "8GB",
    maxInstances: 200
});

exports.restAPI = functions.https.onRequest(restApp);