const client = require('./connection.js');

exports.saveMotto = (data, callback) => {
    const { text, id, name } = data;
    const sql = 'UPDATE user SET motto="'+text+'" WHERE id="'+id+'"';
    client.query(sql, (err, results) => {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        callback(results);
    });
}
