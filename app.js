const path = require("path");
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const EventProxy = require('eventproxy');
const app = express();

const client = require('./lib/connection.js');
const TEST_TABLE = 'user';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(session({
    secret :  'secret', // 对session id 相关的cookie 进行签名
    resave : true,
    rolling: true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie : {
        maxAge : 1000 * 60 * 15,
    },
}));

const home = require('./controllers');
const access = require('./controllers/access');

app.use('/', home);
app.use('/login', access);
app.use('/logout', home);



app.get('/getHeader', (req, res) => {
    const { userId:id, userName:name } = req.session;
    if (id && name){
        res.send({status: 1,data: {id, name}});
        return false;
    }
    res.send({status: 1,data: false});
});

app.get('/user/:id', (req, res) => {
    const { userId:id, userName:name } = req.session;
    if (id && name){
        res.sendFile(path.join(__dirname, 'page', 'app.html'));
        return false;
    }
    res.redirect('/');
});

app.get('/newblog', (req, res) => {
    const { userId:id, userName:name } = req.session;
    if (id && name){
        res.sendFile(path.join(__dirname, 'page', 'app.html'));
        return false;
    }
    res.redirect('/');
});

app.get('/blog/:blogId', (req, res) => {
    const { userId:id, userName:name } = req.session;
    if (id && name){
        res.sendFile(path.join(__dirname, 'page', 'app.html'));
        return false;
    }
    res.redirect('/');
});

app.post('/setMotto', (req, res) => {
    const { userId:id, userName:name } = req.session;
    const { text } = req.body;
    const sql_select = 'UPDATE '+TEST_TABLE+' SET motto="'+text+'" WHERE id="'+id+'"';
    client.query(sql_select, (err, results) => {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        res.send({status: 1,data: true});
    });
});

app.post('/saveArticle', (req, res) => {
    const { userId:id } = req.session;
    const { aid, title, content } = req.body;
    if (!id) {
        res.send({status: 1,data: false,info: '登陆过期！'});
        return false;
    }
    if (aid){
        const sql_select = 'UPDATE article SET title="'+escape(title)+'",content="'+escape(content)+'" WHERE artid='+aid;
        handlerDate(sql_select, results => {
            res.send({status: 1,data: true});
        });
        return false;
    }
    const insertData = {
        userid: id,
        title: escape(title),
        content: escape(content),
        create_time: new Date().getTime()
    }
    const key = Object.keys(insertData).join(",");
    let val = '';
    Object.values(insertData).map(unit => {
        if (typeof unit === 'string'){
            val = `${val}, "${unit}"`;
            return true;
        }
        val = `${val}, ${unit}`;
    });
    val = val.slice(1);
    const sql_select = 'INSERT INTO article('+key+') VALUES('+val+')';
    handlerDate(sql_select, results => {
        res.send({status: 1,data: Object.assign({}, insertData, {
            artid: results.insertId
        })});
    });
});

app.post('/publishArticle', (req, res) => {
    const { userId:id } = req.session;
    const { aid, title, content } = req.body;
    if (!id) {
        res.send({status: 1,data: false,info: '登陆过期！'});
        return false;
    }
    const time = new Date().getTime();
    if (aid){
        const sql_select = 'UPDATE article SET publish=1,publish_time='+time+' WHERE artid='+aid;
        handlerDate(sql_select, results => {
            res.send({status: 1,data: true});
        });
        return false;
    }
    const insertData = {
        userid: id,
        title: escape(title),
        content: escape(content),
        publish: 1,
        create_time: time,
        publish_time: time
    }
    const key = Object.keys(insertData).join(",");
    let val = '';
    Object.values(insertData).map(unit => {
        if (typeof unit === 'string'){
            val = `${val}, "${unit}"`;
            return true;
        }
        val = `${val}, ${unit}`;
    });
    val = val.slice(1);
    const sql_select = 'INSERT INTO article('+key+') VALUES('+val+')';
    handlerDate(sql_select, results => {
        res.send({status: 1,data: Object.assign({}, insertData, {
            artid: results.insertId
        })});
    });
});

function handlerDate(sql, callback){
    client.query(sql, (err, results) => {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        callback(results);
    });
}

app.get('/getArticle', (req, res) => {
    const proxy =  new EventProxy();
    const { userId:id } = req.session;
    let { type, start, hasfirst } = req.query;
    start = Number(start);
    const typeWhere = {
        home: 'WHERE publish=1',
        user: `WHERE userid=${id}`,
        publish: `WHERE userid=${id} AND publish=1`,
        draft: `WHERE userid=${id} AND publish=0`,
    };
    const where = typeWhere[type];
    const limit = `${start}, 2`;
    const sql_select = 'SELECT * FROM article '+where+' ORDER BY create_time DESC LIMIT '+limit;
    const sql_count = 'SELECT count(1) FROM article '+where;
    if (hasfirst){
        handlerDate(sql_count, results => {
            proxy.emit("count", results);
        });
        handlerDate(sql_select, results => {
            proxy.emit("select", results);
        });
        proxy.all("select", "count", function(select, count) {
            const entity = {};
            const list = select.map(unit => {
                entity[unit.artid] = unit;
                return unit.artid;
            })
            const data = {
                list, entity
            };
            if (count) data.count = {
                [`${type}Count`]: count[0]['count(1)']
            };
            res.send({status: 1,data});
        });
    } else {
        handlerDate(sql_select, results => {
            const entity = {};
            const list = results.map(unit => {
                entity[unit.artid] = unit;
                return unit.artid;
            });
            res.send({status: 1,data: {list, entity}});
        });
    }
});

app.get('/getDetail', (req, res) => {
    const { userId:id } = req.session;
    let { aid } = req.query;
    aid = Number(aid);
    const sql_select = 'SELECT * FROM article WHERE artid='+aid;
    handlerDate(sql_select, results => {
        res.send({status: 1,data: results[0]});
    });
});

const server = app.listen(8081, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log("应用实例，访问地址为 http://%s:%s", host, port);
});
