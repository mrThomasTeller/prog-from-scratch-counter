const fs = require("fs");
const path = require("path");

module.exports = function (app) {
    // обрабатываем запрос на получение значения счётчика
    app.get("/get-count", (req, res) => {
        // читаем данные из файла data.json
        const data = loadData(req.session.login);

        // говорим, что ответом будут данные в формате JSON
        res.setHeader("Content-Type", "application/json");

        // отправляем данные клиенту
        res.send(data);
    });

    // обрабатываем запрос на изменение значения счётчика. app.post - настраивает запросы на изменение данных
    app.post("/set-count", (req, res) => {
        // req.body - это тело запроса. Оно имеет формат JSON вида {"count": 0}.
        // Сохраняем полученные данные в файл
        saveData(req.session.login, req.body);

        // говорим клиенту, что всё прошло без ошибок
        res.send("ok");
    });

    // обрабатываем запрос на отнятие единицы от значения счётчика
    app.post("/minus", (req, res) => {
        saveData(req.session.login, {
            count: loadData(req.session.login).count - 1,
        });
        res.send("ok");
    });

    // обрабатываем запрос на прибавление единицы к значению счётчика
    app.post("/plus", (req, res) => {
        saveData(req.session.login, {
            count: loadData(req.session.login).count + 1,
        });
        res.send("ok");
    });

    // обрабатываем запрос на сброс значения счётика до нуля
    app.post("/reset", (req, res) => {
        saveData(req.session.login, { count: 0 });
        res.send("ok");
    });
};

function loadData(login) {
    return JSON.parse(
        fs.readFileSync(path.join(__dirname, `data/${login}.json`))
    );
}

function saveData(login, data) {
    fs.writeFileSync(
        path.join(__dirname, `data/${login}.json`),
        JSON.stringify(data)
    );
}
