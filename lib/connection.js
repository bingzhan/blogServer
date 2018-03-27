const mysql = require('mysql');

 const client = mysql.createConnection({
    host: 'http://mysql.hy01.cn/',
    user: 'lbz',
    password: 'Lz@20188',
    database: 'lbz'
});

client.connect();

module.exports = client;
