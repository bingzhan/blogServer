const client = require('./connection.js');

exports.checkLogin = (data, callback) => {
    const { username, password } = data;
    const sql = 'SELECT * FROM user WHERE adminname="'+username+'" AND adminpwd="'+password+'"';
    client.query(sql, (err, results) => {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        callback(results);
    });
}
