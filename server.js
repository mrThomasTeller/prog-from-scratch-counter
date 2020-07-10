/**
 * В этом файле мы создаём и запускаем сервер, который будет обрабатывать запросы от клиента.
 */

const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// Настраиваем возможность принимать от клиента данные в формате JSON
app.use(bodyParser.json());

// обрабатываем запрос стартовой страницы. app.get - настраивает запросы на получение на данных
app.get("/", (req, res) => {
    // читаем файл index.html
    const html = fs
        .readFileSync(path.join(__dirname, "assets/index.html"))
        .toString();

    // говорим, что ответом будет документ в формате html
    res.setHeader("Content-Type", "text/html");

    // отсылаем документ клиенту
    res.send(html);
});

// обрабатываем запрос на получение значения счётчика
app.get("/get-count", (req, res) => {
    // читаем данные из файла data.json
    const data = loadData();

    // говорим, что ответом будут данные в формате JSON
    res.setHeader("Content-Type", "application/json");

    // отправляем данные клиенту
    res.send(data);
});

// обрабатываем запрос на изменение значения счётчика. app.post - настраивает запросы на изменение данных
app.post("/set-count", (req, res) => {
    // req.body - это тело запроса. Оно имеет формат JSON вида {"count": 0}.
    // Сохраняем полученные данные в файл
    saveData(req.body);

    // говорим клиенту, что всё прошло без ошибок
    res.send("ok");
});

// обрабатываем запрос на отнятие единицы от значения счётчика
app.post("/minus", (req, res) => {
    saveData({ count: loadData().count - 1 });
    res.send("ok");
});

// обрабатываем запрос на прибавление единицы к значению счётчика
app.post("/plus", (req, res) => {
    saveData({ count: loadData().count + 1 });
    res.send("ok");
});

// обрабатываем запрос на сброс значения счётика до нуля
app.post("/reset", (req, res) => {
    saveData({ count: 0 });
    res.send("ok");
});

// говорим, что статические файлы лежат в папке assets.
// Теперь если клиент обратится за файлами index.js или index.css, то он получи
// те что лежат в папке assets
app.use("/", express.static(path.join(__dirname, "assets")));

// запускаем сервер на 3000 порту
app.listen(3000, () => {
    console.log("http://localhost:3000/");
});

function loadData() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, "data.json")));
}

function saveData(data) {
    fs.writeFileSync(path.join(__dirname, "data.json"), JSON.stringify(data));
}
