/**
 * В этом файле мы создаём и запускаем сервер, который будет обрабатывать запросы от клиента.
 */

const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const routing = require("./routing.js");
const api = require("./api.js");

const app = express();

// Настраиваем возможность принимать от клиента данные в формате JSON
app.use(bodyParser.json());

// подключаем обработку роутинга и API
routing(app);
api(app);

// говорим, что статические файлы лежат в папке assets.
// Теперь если клиент обратится за файлами index.js или index.css, то он получи
// те что лежат в папке assets
app.use("/", express.static(path.join(__dirname, "../assets")));

// запускаем сервер на 3000 порту
app.listen(3000, () => {
    console.log("http://localhost:3000/");
});
