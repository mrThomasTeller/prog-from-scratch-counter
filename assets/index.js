let count = 0;

async function init() {
    // отсылаем запрос на сервер по адресу /get-count, чтоб получить значение счётчика
    const res = await fetch("/get-count");
    const data = res.json();
    // меняем значение счётчика на клиенте
    count = data.count;
    // перерисовываем счётчик с новым значением
    render();

    // при клике на минус - отнимаем от счётчика единицу
    document.querySelector(".minus").addEventListener("click", () => {
        fetch("/minus", {
            // POST - значит изменение данных
            method: "POST",
        });
        --count;
        render();
    });

    // при клике на плюс - прибавляем к счётчику единицу
    document.querySelector(".plus").addEventListener("click", () => {
        fetch("/plus", {
            method: "POST",
        });
        ++count;
        render();
    });

    // при изменении текста в поле нужно менять доступность кнопки "Set Counter"
    document.querySelector(".set-input").addEventListener("input", render);

    // при клике на кнопку "Set Count" меняем значение счётчика на то что записано в поле
    document.querySelector(".set-count").addEventListener("click", () => {
        const input = document.querySelector(".set-input");
        count = parseInt(input.value);
        input.value = "";

        // отправляем запрос на изменение значения счётчика
        fetch("/set-count", {
            // Тело запроса будет содержать новое значение в формате {"count": 0}
            body: JSON.stringify({ count: count }),

            // говорим, что тело запроса будет передано в формате JSON
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            method: "POST",
        });
        render();
    });
}

function render() {
    // Меняем значение счётчика
    document.querySelector(
        ".count"
    ).innerHTML = `<span class="count-number" title="Click to reset counter to 0">${count}</span>`;

    // Кнопка "Set Counter" должна быть доступна только если в поле есть какой-то текст
    document.querySelector(".set-count").disabled =
        document.querySelector(".set-input").value === "";

    // каждый раз когда число счётчика перерисывается - вешаем на него обработчик клика
    document.querySelector(".count-number").addEventListener("click", () => {
        // при клике на число счётчика отсылаем запрос на сервер по адресу /reset
        fetch("/reset", {
            method: "POST",
        });

        // теперь нужно изменить значение счётчика и на клиенте
        count = 0;

        // перерисовываем счётчик с новым значением
        render();
    });
}

init();
