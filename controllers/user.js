const path = require("path");
const userModels = require('../models/user');

exports.user = (req, res) => {
    const { userId:id, userName:name } = req.session;
    if (id && name){
        res.sendFile(path.join(__dirname, 'page', 'app.html'));
        return false;
    }
    res.redirect('/');
};

exports.setMotto = (req, res) => {
    const { userId:id, userName:name } = req.session;
    const { text } = req.body;
    userModels.saveMotto({
        text, id, name
    }, results => {
        res.send({status: 1,data: true});
    });
};
