/**
 * В этом файле мы обрабатываем перемещение пользователя по страницам приложения, а также авторизацию и регистрацию
 */

const fs = require("fs");
const path = require("path");

/**
 * @param {import('mongodb').Db} db
 */
module.exports = function (app, db) {
    // обрабатываем запрос стартовой страницы. app.get - настраивает запросы на получение на данных
    app.get("/", (req, res) => {
        // проверяем авторизован ли пользователь
        if (!req.session.user) {
            // если нет - редиректим на страницу входа
            res.redirect("/login/");
            return;
        }

        // читаем файл index.html
        const html = fs
            .readFileSync(path.join(__dirname, "../assets/index.html"))
            .toString()
            // показываем логин пользователя на странице входа
            .replace("{{login}}", req.session.user.login);

        // говорим, что ответом будет документ в формате html
        res.setHeader("Content-Type", "text/html");

        // отсылаем документ клиенту
        res.send(html);
    });

    // страница входа
    app.get("/login/", (req, res) => {
        let html = fs
            .readFileSync(path.join(__dirname, "../assets/login/index.html"))
            .toString();

        // если пользователь ввёл неправильный логин или пароль
        if (req.session.invalidLoginPassword) {
            // флаг неправильного логина и пароля больше нам не нужен
            delete req.session.invalidLoginPassword;
            // вставляем в html соответствующее сообщение
            html = html.replace(
                "{{message}}",
                '<div class="row invalid">Неправильный логин или пароль</div>'
            );
        } else {
            html = html.replace("{{message}}", "");
        }

        res.setHeader("Content-Type", "text/html");

        res.send(html);
    });

    // обрабатываем отправку формы входа
    app.post("/login/", async (req, res) => {
        const login = req.body.login;
        const password = req.body.password;

        // берём коллекцию users (если таковой нет, она будет создана автоматически)
        const users = db.collection("users");

        // ищем пользователя с соответствующим логином и паролем
        const user = await users.findOne({ login: login, password: password });

        // если такой пользователь существует
        if (user) {
            // ассоциируем сессию с введённым логином (теперь мы будем узнавать пользователя)
            req.session.user = user;
            res.redirect("/");
        } else {
            // если такого пользователя нет - помечаем, что он ввёл неправильные логин и пароль (чтобы показать соответствующее сообщение)
            req.session.invalidLoginPassword = true;
            // и отправляем обратно на страницу входа
            res.redirect("/login/");
        }
    });

    // страница регистрации
    app.get("/register/", (req, res) => {
        let html = fs
            .readFileSync(path.join(__dirname, "../assets/register/index.html"))
            .toString();

        // сообщения об ошибках регистрации
        if (req.session.passwordsMissmatch) {
            delete req.session.passwordsMissmatch;
            html = html.replace(
                "{{message}}",
                '<div class="row invalid">Пароли не совпадают</div>'
            );
        } else if (req.session.existingUser) {
            delete req.session.existingUser;
            html = html.replace(
                "{{message}}",
                '<div class="row invalid">Пользователь с таким логином уже существует</div>'
            );
        } else if (req.session.emptyLoginPassword) {
            delete req.session.emptyLoginPassword;
            html = html.replace(
                "{{message}}",
                '<div class="row invalid">Не указан логин или пароль</div>'
            );
        } else {
            html = html.replace("{{message}}", "");
        }

        res.setHeader("Content-Type", "text/html");

        res.send(html);
    });

    // обрабатываем отправку формы регистрации
    app.post("/register/", async (req, res) => {
        const login = req.body.login;
        const password = req.body.password;
        const passwordRepeat = req.body["password-repeat"];

        const users = db.collection("users");
        const user = await users.findOne({ login: login });

        // проверяем ошибки регистрации:
        if (password !== passwordRepeat) {
            // несовподающие пароли
            req.session.passwordsMissmatch = true;
            res.redirect("/register/");
        } else if (user) {
            // такой пользователь уже существует
            req.session.existingUser = true;
            res.redirect("/register/");
        } else if (!login || !password) {
            // пустые поля логина или пароля
            req.session.emptyLoginPassword = true;
            res.redirect("/register/");
        } else {
            // если ошибок нет - создаём нового пользователя
            const result = await users.insertOne({
                login: login,
                password: password,
            });
            const user = result.ops[0];

            // создаём данные пользователя
            const data = db.collection("data");
            await data.insertOne({
                count: 0,
                userId: user._id,
            });

            // помечаем, что пользователь авторизован
            req.session.user = user;

            // редиректим на стартоую страницу
            res.redirect("/");
        }
    });

    // обрабатываем запрос на выход
    app.post("/logout/", (req, res) => {
        delete req.session.user;
        res.redirect("/login/");
    });
};
