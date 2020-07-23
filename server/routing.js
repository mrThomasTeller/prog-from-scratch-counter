const fs = require("fs");
const path = require("path");

module.exports = function (app) {
    // обрабатываем запрос стартовой страницы. app.get - настраивает запросы на получение на данных
    app.get("/", (req, res) => {
        if (!req.session.login) {
            res.redirect("/login/");
            return;
        }

        // читаем файл index.html
        const html = fs
            .readFileSync(path.join(__dirname, "../assets/index.html"))
            .toString()
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

        if (req.session.invalidLoginPassword) {
            req.session.invalidLoginPassword = false;
            html = html.replace(
                "{{message}}",
                '<div class="row invalid">Неправильный логин или пароль</div>'
            );
        } else {
            html = html.replace("{{message}}", "");
        }

        // говорим, что ответом будет документ в формате html
        res.setHeader("Content-Type", "text/html");

        // отсылаем документ клиенту
        res.send(html);
    });

    app.post("/login/", (req, res) => {
        const login = req.body.login;
        const password = req.body.password;

        const users = JSON.parse(
            fs.readFileSync(path.join(__dirname, "users.json"))
        );
        const user = users.find(
            (x) => x.login === login && x.password === password
        );

        if (user) {
            req.session.login = login;
            res.redirect("/");
        } else {
            delete req.session.invalidLoginPassword;
            res.redirect("/login/");
        }
    });

    // страница регистрации
    app.get("/register/", (req, res) => {
        let html = fs
            .readFileSync(path.join(__dirname, "../assets/register/index.html"))
            .toString();

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

        // говорим, что ответом будет документ в формате html
        res.setHeader("Content-Type", "text/html");

        // отсылаем документ клиенту
        res.send(html);
    });

    app.post("/register/", (req, res) => {
        const login = req.body.login;
        const password = req.body.password;
        const passwordRepeat = req.body["password-repeat"];

        const users = JSON.parse(
            fs.readFileSync(path.join(__dirname, "users.json"))
        );

        if (password !== passwordRepeat) {
            req.session.passwordsMissmatch = true;
            res.redirect("/register/");
        } else if (users.some((x) => x.login === login)) {
            req.session.existingUser = true;
            res.redirect("/register/");
        } else if (!login || !password) {
            req.session.emptyLoginPassword = true;
            res.redirect("/register/");
        } else {
            users.push({ login: login, password: password });
            fs.writeFileSync(
                path.join(__dirname, "users.json"),
                JSON.stringify(users)
            );
            fs.writeFileSync(
                path.join(__dirname, `data/${login}.json`),
                JSON.stringify({ count: 0 })
            );
            req.session.login = login;
            res.redirect("/");
        }
    });

    app.post("/logout/", (req, res) => {
        delete req.session.login;
        res.redirect("/login/");
    });
};
