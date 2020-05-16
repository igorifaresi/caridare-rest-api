const mongoose = require('mongoose');
require('dotenv/config');

/*
 * MongoDB models
 */
const InstitutionModel = mongoose.model('InstitutionModel', new mongoose.Schema({
        login: {
                type: String,
                require: true,
        },
        token: {
                type: String,
                require: true,
        },
        num: {
                type: Number,
                require: true,
        },
        name: { 
                type: String,
                require: true,
        },
        description: {
                type: String,
                require: true,
        },
        necessities: {
                type: String,
                require: true,
        },
        created: {
                type: Date,
                require: Date.now,
        },
        lastPush: Date,
        instantNecessities: {
                type: [Boolean],
                require: true
        },
        /*
        phone: String,
        latitude: Number,
        longitude: Number,
        */
        //TODO:
        //phone, localization, coordinates, email
}));

//TODO: type checking

module.exports.initServer = function() {
        let init = (new Date()).getTime();
        mongoose.connect(process.env.DB_CONNECTION, { 
                useNewUrlParser    : true,
                useUnifiedTopology : true,
                useFindAndModify   : false,
        }, () => {
                console.log('Connected to server! in '
                +((new Date()).getTime() - init)/1000+' secs');
        });
}

module.exports.checkLogin = async function(login) {
        let query = InstitutionModel.findOne({ 
                "login" : login 
        });
        return ((await query) != null);
}

module.exports.checkCredentials = async function(login, token) {
        let query = InstitutionModel.findOne({ 
                "login" : login,
                "token" : token,
        });
        return ((await query) != null);
}

module.exports.createInstitution = async function(obj) {
        if (obj.login != null
        &&  obj.token != null 
        &&  obj.name  != null
        &&  obj.description != null
        &&  obj.necessities != null
        &&  obj.instantNecessities != null) {
                let n = {};
                n.login = obj.login;
                n.token = obj.token;
                n.name = obj.name;
                n.description = obj.description;
                n.necessities = obj.necessities;
                n.instantNecessities = obj.instantNecessities;

                n.num = (await InstitutionModel.count());
                n.created = Date.now();

                let s = true;
                await new InstitutionModel(n).save((err) => {
                        if (err) {
                                console.log(err);
                                s = false; 
                        }
                });
                return s;
        } else {
                return false;
        }
}

module.exports.updateInstitutionData = async function(login, token, obj) {
        let tmp = {};
        if (obj.name != null)
                tmp.name = obj.name;
        if (obj.description != null)
                tmp.description = obj.description;
        if (obj.necessities != null)
                tmp.necessities = obj.necessities;
        if (obj.instantNecessities != null)
                tmp.instantNecessities = obj.instantNecessities;

        let status = true;
        await InstitutionModel.findOneAndUpdate({
                "login" : login,
                "token" : token,
        }, tmp, (err, item, res) => {
                if (err) {
                        console.log(err);
                        status = false;
                }
        });
        return status;
}

module.exports.queryInstitutions = async function(obj) {
        let query = {};
        if (obj.name != null) {
                query.name = {
                        $regex: new RegExp(obj.name),
                        $options: 'i',
                };
        }
        if (obj.description != null) {
                query.description = {
                        $regex: new RegExp(obj.description), 
                        $options: 'i',
                };
        }
        if (obj.necessities != null) {
                query.necessities = {
                        $regex: new RegExp(obj.description), 
                        $options: 'i',
                };
        }
        //TODO add instant necessities search and coordinates and other params
        return (await InstitutionModel.find(
                query,
                'num name description necessities created lastPush instantNecessities'
        ));
}

module.exports.getInstitutionByNumber = async function(num) {
        return (await InstitutionModel.findOne(
                { "num" : num },
                'num name description necessities created lastPush instantNecessities'
        ));
}