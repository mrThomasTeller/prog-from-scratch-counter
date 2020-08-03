/**
 * В этом файле мы обрабатываем методы получения и изменения данных (API)
 */

const fs = require("fs");
const path = require("path");

/**
 * @param {import('mongodb').Db} db
 */
module.exports = function (app, db) {
    // обрабатываем запрос на получение значения счётчика
    app.get("/get-count", (req, res) => {
        // читаем данные из файла data.json
        const data = loadData(req.session.user._id);

        // говорим, что ответом будут данные в формате JSON
        res.setHeader("Content-Type", "application/json");

        // отправляем данные клиенту
        res.send(data);
    });

    // обрабатываем запрос на изменение значения счётчика. app.post - настраивает запросы на изменение данных
    app.post("/set-count", (req, res) => {
        // req.body - это тело запроса. Оно имеет формат JSON вида {"count": 0}.
        // Сохраняем полученные данные в файл
        saveData(req.session.user._id, req.body);

        // говорим клиенту, что всё прошло без ошибок
        res.send("ok");
    });

    // обрабатываем запрос на отнятие единицы от значения счётчика
    app.post("/minus", (req, res) => {
        saveData(req.session.user._id, {
            count: loadData(req.session.user._id).count - 1,
        });
        res.send("ok");
    });

    // обрабатываем запрос на прибавление единицы к значению счётчика
    app.post("/plus", (req, res) => {
        saveData(req.session.user._id, {
            count: loadData(req.session.user._id).count + 1,
        });
        res.send("ok");
    });

    // обрабатываем запрос на сброс значения счётика до нуля
    app.post("/reset", (req, res) => {
        saveData(req.session.user._id, { count: 0 });
        res.send("ok");
    });

    // загрузка данных пользователя
    async function loadData(id) {
        const data = db.collection("data");
        console.log(id, await data.findOne({ userId: id }));
        return await data.findOne({ userId: id });
    }

    // сохранение данных пользователя
    async function saveData(id, userData) {
        const data = db.collection("data");
        await data.updateOne({ userId: id }, userData);
    }
};
