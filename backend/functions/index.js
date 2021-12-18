// Importaciones
const functions = require("firebase-functions");
const indexApp = require("./routes/index.routes");

// Export API function
exports.api = functions.https._onRequestWithOptions(indexApp, {
    memory: "8GB",
    maxInstances: 200
});