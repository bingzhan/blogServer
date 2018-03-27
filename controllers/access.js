const path = require("path");
const express = require('express');
const router = express.Router();

const client = require('../lib/connection.js');
const TEST_TABLE = 'user';

router.get('/', (req, res) => {
    if (req.session.userName){
        res.redirect('/user/'+req.session.userId);
        return false;
    }
    res.sendFile(path.join(__dirname, '../page', 'app.html'));
})
.post('/', (req, res) => {
    const { username, password } = req.body;
    const sql_select = 'SELECT * FROM '+TEST_TABLE+' WHERE adminname="'+username+'" AND adminpwd="'+password+'"';
    client.query(sql_select, (err, results) => {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        if (!results[0]){
            res.send({status: 1,data: false});
            return false;
        }
        req.session.userId = results[0].id;
        req.session.userName = username;
        res.send({status: 1,data: true,session: req.session});
    });
});


module.exports = router;
