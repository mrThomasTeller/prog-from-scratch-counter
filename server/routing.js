/**
 * В этом файле мы обрабатываем перемещение пользователя по страницам приложения, а также авторизацию и регистрацию
 */

const fs = require("fs");
const path = require("path");

module.exports = function (app) {
    // обрабатываем запрос стартовой страницы. app.get - настраивает запросы на получение на данных
    app.get("/", (req, res) => {
        // проверяем авторизован ли пользователь
        if (!req.session.login) {
            // если нет - редиректим на страницу входа
            res.redirect("/login/");
            return;
        }

        // читаем файл index.html
        const html = fs
            .readFileSync(path.join(__dirname, "../assets/index.html"))
            .toString()
            // показываем логин пользователя на странице входа
            .replace("{{login}}", req.session.login);

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
    app.post("/login/", (req, res) => {
        const login = req.body.login;
        const password = req.body.password;

        const users = JSON.parse(
            fs.readFileSync(path.join(__dirname, "users.json"))
        );
        // ищем пользователя с соответствующим логином и паролем
        const user = users.find(
            (x) => x.login === login && x.password === password
        );

        // если такой пользователь существует
        if (user) {
            // ассоциируем сессию с введённым логином (теперь мы будем узнавать пользователя)
            req.session.login = login;
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
    app.post("/register/", (req, res) => {
        const login = req.body.login;
        const password = req.body.password;
        const passwordRepeat = req.body["password-repeat"];

        const users = JSON.parse(
            fs.readFileSync(path.join(__dirname, "users.json"))
        );

        // проверяем ошибки регистрации:
        if (password !== passwordRepeat) {
            // несовподающие пароли
            req.session.passwordsMissmatch = true;
            res.redirect("/register/");
        } else if (users.some((x) => x.login === login)) {
            // такой пользователь уже существует
            req.session.existingUser = true;
            res.redirect("/register/");
        } else if (!login || !password) {
            // пустые поля логина или пароля
            req.session.emptyLoginPassword = true;
            res.redirect("/register/");
        } else {
            // если ошибок нет - создаём нового пользователя
            users.push({ login: login, password: password });
            fs.writeFileSync(
                path.join(__dirname, "users.json"),
                JSON.stringify(users)
            );

            // создаём файл с данными пользователя
            fs.writeFileSync(
                path.join(__dirname, `data/${login}.json`),
                JSON.stringify({ count: 0 })
            );

            // помечаем, что пользователь авторизован
            req.session.login = login;

            // редиректим на стартоую страницу
            res.redirect("/");
        }
    });

    // обрабатываем запрос на выход
    app.post("/logout/", (req, res) => {
        delete req.session.login;
        res.redirect("/login/");
    });
};
