const admin = require("firebase-admin");
const methods = {};

methods.testing = async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    if (req.method == 'OPTIONS')
    {
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    } 
    else
    {
        if (req.method != 'GET')
        {
            return res.status(405).send({ data: "Method not allowed" });
        }

        await admin.firestore().collection("courses").get()
        .then(response => {
            let array = [];

            if (response.size > 0)
            {
                response.forEach(doc => {
                    array.push({
                        id: doc.id,
                        data: doc.data()
                    });
                });
            }

            return res.status(200).send({ data: array });
        })
        .catch(error => {
            return res.status(200).send({ data: null, error: error.code });
        })
    }
};

module.exports = methods;