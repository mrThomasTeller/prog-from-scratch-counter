/**
 * В этом файле мы создаём и запускаем сервер, который будет обрабатывать запросы от клиента.
 */

const path = require("path");
const express = require("express");
// сначала усановите модуль npm i body-parser --save
const bodyParser = require("body-parser");
const routing = require("./routing.js");
const api = require("./api.js");
// сначала усановите модуль npm i express-session --save
const session = require("express-session");
const MongoClient = require("mongodb").MongoClient;

// создаем объект MongoClient и передаем ему строку подключения
const mongoClient = new MongoClient("mongodb://localhost:27017/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const app = express();

// настраиваем механизм сессий
app.use(
    session({
        // создайте свой случайный секретный ключ
        secret: "rUNc',oY`{(b",
        saveUninitialized: true,
        resave: false,
    })
);

// Настраиваем возможность принимать от клиента данные в формате JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// созданём соединение с базой данных
let db;
mongoClient.connect((err, client) => {
    if (err) {
        return console.log(err);
    }

    // выбираем нашу базу данных
    db = client.db("counter");

    // подключаем обработку роутинга и API
    routing(app, db);
    api(app, db);

    // говорим, что статические файлы лежат в папке assets.
    // Теперь если клиент обратится за файлами index.js или index.css, то он получи
    // те что лежат в папке assets
    app.use("/", express.static(path.join(__dirname, "../assets")));

    // запускаем сервер на 3000 порту
    app.listen(3000, () => {
        console.log("http://localhost:3000/");
    });
});
