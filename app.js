const path = require("path");
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();

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

const home = require('./controllers/home');
const access = require('./controllers/access');
const user = require('./controllers/user');
const blog = require('./controllers/blog');
app.get('/login', access.loginHtml);
app.post('/login', access.login);
app.get('/logout', access.logout);


app.get('/', home.home);
app.get('/getHeader', home.header);

app.get('/user/:id', user.user);
app.post('/setMotto', user.setMotto);

app.get('/newblog', blog.newblog);
app.get('/blog/:blogId', blog.blogHtml);
app.post('/saveArticle', blog.save);
app.post('/publishArticle', blog.publish);
app.get('/getArticle', blog.getArticle);
app.get('/getDetail', blog.getDetail);

const server = app.listen(8081, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log("应用实例，访问地址为 http://%s:%s", host, port);
});
