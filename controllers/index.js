const path = require("path");
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    console.log(999, req.session.userName);
    res.sendFile(path.join(__dirname, '../page', 'app.html'));
});

router.get('/logout', (req, res) => {
    req.session.userId = null;
    req.session.userName = null;
    res.send({status: 1,data: true});
});

module.exports = router;
