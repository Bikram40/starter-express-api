const express = require('express')
const decrypt = require('./decrypt')
const app = express()
app.all('/', (req, res) => {
    console.log("Just got a request!")
    res.send('Yo!')
})

app.all("/decrypt", function (req, res) {
    var payload = req.body;
    var object = payload.object;
    var keys = payload.keys;
    object.rawData = Buffer.from(object.rawData);
    let message;
    try {
        message = decrypt(object, keys);
    } catch (error) {
        switch (true) {
            case error.message.includes(
                'Unsupported state or unable to authenticate data'
            ):
            case error.message.includes('crypto-key is missing'):
            case error.message.includes('salt is missing'):
                // NOTE(ibash) Periodically we're unable to decrypt notifications. In
                // all cases we've been able to receive future notifications using the
                // same keys. So, we silently drop this notification.
                console.warn(
                    'Message dropped as it could not be decrypted: ' + error.message
                );
            
                return;
            default: {
                throw error;
            }
        }
    }
    res.send(message);
});

app.listen(process.env.PORT || 3000)