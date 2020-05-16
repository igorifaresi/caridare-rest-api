const express = require('express');
const app = express();
const service = require('./service.js');
const bodyParser = require('body-parser');

service.initServer();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('The API in ON!');
});

app.post('/institution/create', (req, res) => {
    if (req.body.login != null) {
        service.checkLogin(req.body.login).then((exists) => {
            if (!exists) {
                service.createInstitution(req.body).then((s) => {
                    if (s) {
                        res.send('New institution created with success');
                    } else {
                        res.status(400).send('Invalid instituion data');
                    }
                });
            } else {
                res.status(400).send('This login already exists');
            }
        });        
    } else {
        res.status(400).send('Login required');
    }    
});

app.post('/institution/update', (req, res) => {
    if (req.body.login != null
    &&  req.body.token != null) {
        service.checkCredentials(req.body.login, req.body.token).then((s) => {
            if (s) {
                service.updateInstitutionData(
                    req.body.login,
                    req.body.token,
                    req.body.obj
                ).then((s) => {
                    if (s) {
                        res.send('Institution updated with success');
                    } else {
                        res.status(400).send('Error in institution update');
                    }
                });
            } else {
                res.status(400).send('Invalid credentials');
            }
        });
    } else {
        res.status(400).send('Credentials required');
    }
});

app.post('/institution/query', (req, res) => {
    service.queryInstitutions(req.body).then((result) => {
        res.send(result);
    });
});

app.post('/institution/get', (req, res) => {
    if (req.body.number != null && typeof req.body.number === 'number') {
        service.getInstitutionByNumber(req.body.number).then((result) => {
            res.send(result);
        });
    } else {
        res.status(400).send('Institution number required');
    }
});

//start listening the server
app.listen(process.env.PORT);