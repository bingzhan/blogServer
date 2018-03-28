const path = require("path");
const accessModels = require('../models/access');

exports.loginHtml = (req, res) => {
    if (req.session.userName){
        res.redirect('/user/'+req.session.userId);
        return false;
    }
    res.sendFile(path.join(__dirname, '../page', 'app.html'));
};

exports.login = (req, res) => {
    const { username } = req.body;
    accessModels.checkLogin(req.body, results => {
        if (!results[0]){
            res.send({status: 1,data: false});
            return false;
        }
        req.session.userId = results[0].id;
        req.session.userName = username;
        res.send({status: 1,data: true,session: req.session});
    });
};

exports.logout = (req, res) => {
    req.session.userId = null;
    req.session.userName = null;
    res.send({status: 1,data: true});
};
