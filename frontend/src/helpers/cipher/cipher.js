const CryptoJS = require("crypto-js");

// Codigo para encriptar, ESTE ES PARA MODO DE TESTEO Y PRUEBAS
const CODE_ENCRYPT = "casa123casa123.";

/**
 * Función para cifrar texto
 * @param {String} text Palabra que será cifrada
 * @returns texto cifrado
 */
export const Encrypt = (text) => {
    const encrypt = CryptoJS.AES.encrypt(JSON.stringify(text), CODE_ENCRYPT).toString();
    return encrypt;
};

/**
 * Funcion para descifrar texto
 * @param {String} text Palabra cifrada que se va a descifrar
 * @returns texto descifrado
 */
export const Decrypt = (text) => {
    const decrypt = CryptoJS.AES.decrypt(text, CODE_ENCRYPT).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypt);
};