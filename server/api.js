/**
 * В этом файле мы обрабатываем методы получения и изменения данных (API)
 */

// Это понадобится нам для поиска по user id
const ObjectId = require("mongodb").ObjectId;

/**
 * Указываем тип переменной db для автокомплита
 * @param {import('mongodb').Db} db
 */
module.exports = function (app, db) {
    // обрабатываем запрос на получение значения счётчика
    app.get("/get-count", async (req, res) => {
        // читаем данные из файла data.json
        // так как функция loadData асинхронная, то перед ней нужно написать await
        const data = await loadData(req.session.user._id);

        // говорим, что ответом будут данные в формате JSON
        res.setHeader("Content-Type", "application/json");

        // отправляем данные клиенту
        res.send(data);
    });

    // обрабатываем запрос на изменение значения счётчика. app.post - настраивает запросы на изменение данных
    app.post("/set-count", async (req, res) => {
        // req.body - это тело запроса. Оно имеет формат JSON вида {"count": 0}.
        // Сохраняем полученные данные в базу данных
        // saveData - тоже асинхронная функция, ставим её вызовом ней await
        await saveData(req.session.user._id, req.body);

        // говорим клиенту, что всё прошло без ошибок
        res.send("ok");
    });

    // обрабатываем запрос на отнятие единицы от значения счётчика
    app.post("/minus", async (req, res) => {
        // сначала получаем данные пользователя из базы данных
        const prevData = await loadData(req.session.user._id);
        // затем записываем в базу данных новое значение
        await saveData(req.session.user._id, {
            count: prevData.count - 1,
        });
        res.send("ok");
    });

    // обрабатываем запрос на прибавление единицы к значению счётчика
    app.post("/plus", async (req, res) => {
        const prevData = await loadData(req.session.user._id);
        await saveData(req.session.user._id, {
            count: prevData.count + 1,
        });
        res.send("ok");
    });

    // обрабатываем запрос на сброс значения счётика до нуля
    app.post("/reset", async (req, res) => {
        await saveData(req.session.user._id, { count: 0 });
        res.send("ok");
    });

    // загрузка данных пользователя
    async function loadData(id) {
        // загружать данные будем из коллекции data
        const data = db.collection("data");
        // userId - это не обычная строка, а идентификатор, поэтому мы оборачиваем id в Object(id)
        // чтобы id также стал идентификатором
        return await data.findOne({ userId: ObjectId(id) });
    }

    // сохранение данных пользователя
    async function saveData(id, userData) {
        const data = db.collection("data");
        await data.updateOne({ userId: ObjectId(id) }, { $set: userData });
    }
};
