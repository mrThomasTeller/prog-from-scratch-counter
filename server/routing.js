const fs = require("fs");
const path = require("path");

module.exports = function (app) {
    // обрабатываем запрос стартовой страницы. app.get - настраивает запросы на получение на данных
    app.get("/", (req, res) => {
        // читаем файл index.html
        const html = fs
            .readFileSync(path.join(__dirname, "../assets/index.html"))
            .toString();

        // говорим, что ответом будет документ в формате html
        res.setHeader("Content-Type", "text/html");

        // отсылаем документ клиенту
        res.send(html);
    });

    // страница входа
    app.get("/login/", (req, res) => {
        const html = fs
            .readFileSync(path.join(__dirname, "../assets/login/index.html"))
            .toString();

        // говорим, что ответом будет документ в формате html
        res.setHeader("Content-Type", "text/html");

        // отсылаем документ клиенту
        res.send(html);
    });
};
