const path = require("path");

exports.home = (req, res) => {
    console.log(999, req.session.userName);
    res.sendFile(path.join(__dirname, '../page', 'app.html'));
};

exports.header = (req, res) => {
    const { userId:id, userName:name } = req.session;
    if (id && name){
        res.send({status: 1,data: {id, name}});
        return false;
    }
    res.send({status: 1,data: false});
};
