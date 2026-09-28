/* Каталог: вывод товаров, «умный фильтр» и форма пополнения Steam.

   Как работает «умный фильтр»: после каждого изменения мы по очереди
   проверяем каждое значение фильтра. Если вместе с ним не остаётся
   ни одного товара — чекбокс становится недоступным (серым). */

/* Что сейчас отмечено в фильтре */
const filters = {
    platform: [],
    country: [],
    nominal: []
};

/* Положение ползунка «Цена» и выбранная сортировка */
let maxPrice = MAX_PRICE;
let sortMode = "popular";

/* ---------- вспомогательные функции ---------- */

/* Красивая подпись значения: "playstation" -> "PlayStation" */
function valueTitle(value) {
    if (VALUE_TITLES[value]) {
        return VALUE_TITLES[value];
    }
    return value;
}

/* Все значения характеристики, которые встречаются в товарах.
   Для "country" это будут Индия, Турция, США, Канада и Россия. */
function valuesOf(key) {
    /* У Steam товаров нет (его пополняют по логину),
       но платформа должна быть в фильтре */
    if (key === "platform") {
        return PLATFORM_VALUES;
    }

    const values = [];
    for (let i = 0; i < products.length; i++) {
        const value = products[i][key];
        if (values.indexOf(value) === -1) {
            values.push(value);
        }
    }
    return values;
}

/* Подпись «12 товаров / 1 товар / 2 товара» */
function productsTitle(count) {
    const lastTwo = count % 100;
    const last = count % 10;
    let word = "товаров";

    if (lastTwo < 11 || lastTwo > 14) {
        if (last === 1) {
            word = "товар";
        } else if (last >= 2 && last <= 4) {
            word = "товара";
        }
    }

    return count + " " + word;
}

/* Подходит ли товар, если отмечены такие значения.
   Массивы передаём в функцию, чтобы её же можно было спросить:
   «а если отметить ещё вот это значение?» */
function isSuitable(product, checkPlatforms, checkCountries, checkNominals) {
    /* пустой массив = в этой группе ничего не отмечено, условие не мешает */
    if (checkPlatforms.length > 0 && checkPlatforms.indexOf(product.platform) === -1) {
        return false;
    }
    if (checkCountries.length > 0 && checkCountries.indexOf(product.country) === -1) {
        return false;
    }
    if (checkNominals.length > 0 && checkNominals.indexOf(product.nominal) === -1) {
        return false;
    }

    /* цена не должна быть больше той, что выбрана ползунком */
    if (product.price > maxPrice) {
        return false;
    }

    return true;
}

/* Товары, которые подходят фильтру, в нужном порядке */
function filteredProducts() {
    const result = [];

    for (let i = 0; i < products.length; i++) {
        if (isSuitable(products[i], filters.platform, filters.country, filters.nominal)) {
            result.push(products[i]);
        }
    }

    if (sortMode === "price-asc") {
        result.sort(function (a, b) { return a.price - b.price; });
    } else if (sortMode === "price-desc") {
        result.sort(function (a, b) { return b.price - a.price; });
    } else if (sortMode === "rating") {
        result.sort(function (a, b) { return b.rating - a.rating; });
    } else {
        result.sort(function (a, b) { return b.popular - a.popular; });
    }

    return result;
}

/* ---------- фильтр ---------- */

/* Строим чекбоксы и ползунок цены */
function renderFilters() {
    const box = document.getElementById("filters");
    if (!box) {
        return;
    }

    let html = "";

    for (let i = 0; i < filterConfig.length; i++) {
        const group = filterConfig[i];
        const values = valuesOf(group.key);
        const checkedValues = filters[group.key];

        html += '<div class="filter-group">';
        html += '<h3 class="filter-group__title">' + group.title + "</h3>";

        for (let j = 0; j < values.length; j++) {
            const value = values[j];

            let checked = "";
            if (checkedValues.indexOf(value) !== -1) {
                checked = " checked";
            }

            html += '<label class="checkbox">';
            html += '<input type="checkbox" name="' + group.key + '" value="' + value + '"' + checked + ">";
            html += "<span>" + valueTitle(value) + "</span>";
            html += "</label>";
        }

        html += "</div>";
    }

    html += '<div class="filter-group">';
    html += '<h3 class="filter-group__title">Цена, до <span id="priceValue">' + formatPrice(maxPrice) + "</span></h3>";
    html += '<input class="range" type="range" id="priceRange" min="500" max="' + MAX_PRICE + '" step="100" value="' + maxPrice + '">';
    html += "</div>";

    box.innerHTML = html;
}

/* Значения отмеченных галочек одной группы */
function readChecked(name) {
    const boxes = document.querySelectorAll('#filters input[name="' + name + '"]:checked');
    const values = [];

    for (let i = 0; i < boxes.length; i++) {
        values.push(boxes[i].value);
    }

    return values;
}

/* Считываем галочки со страницы в объект filters */
function collectFilters() {
    filters.platform = readChecked("platform");
    filters.country = readChecked("country");
    filters.nominal = readChecked("nominal");
}

/* «Умный фильтр»: значения, которые дадут пустой список товаров,
   становятся недоступными */
function updateAvailability() {
    for (let i = 0; i < filterConfig.length; i++) {
        const group = filterConfig[i];
        const boxes = document.querySelectorAll('#filters input[name="' + group.key + '"]');

        for (let j = 0; j < boxes.length; j++) {
            const box = boxes[j];

            /* Проверяем так: в своей группе отметить только это значение,
               а в остальных оставить то, что уже отмечено */
            let checkPlatforms = filters.platform;
            let checkCountries = filters.country;
            let checkNominals = filters.nominal;

            if (group.key === "platform") {
                checkPlatforms = [box.value];
            }
            if (group.key === "country") {
                checkCountries = [box.value];
            }
            if (group.key === "nominal") {
                checkNominals = [box.value];
            }

            let hasResult = false;
            for (let k = 0; k < products.length; k++) {
                if (isSuitable(products[k], checkPlatforms, checkCountries, checkNominals)) {
                    hasResult = true;
                }
            }

            /* Steam оставляем доступным всегда: его пополняют по логину,
               карт пополнения у него нет */
            let isSteam = false;
            if (group.key === "platform" && box.value === STEAM_PLATFORM) {
                isSteam = true;
            }

            /* уже отмеченную галочку не отключаем — иначе её нельзя снять */
            if (hasResult === false && box.checked === false && isSteam === false) {
                box.disabled = true;
                box.parentNode.classList.add("checkbox_disabled");
            } else {
                box.disabled = false;
                box.parentNode.classList.remove("checkbox_disabled");
            }
        }
    }
}

/* ---------- вывод товаров ---------- */

function productCard(product) {
    let html = '<article class="product-card">';
    html += '<div class="product-card__media">';
    html += '<img src="' + product.image + '" alt="' + product.name + '">';
    html += "</div>";
    html += '<div class="product-card__body">';
    html += '<h3 class="product-card__name">' + product.name + "</h3>";
    html += '<p class="product-card__description">' + product.description + "</p>";
    html += '<ul class="product-card__meta">';
    html += "<li>" + valueTitle(product.platform) + "</li>";
    html += "<li>" + valueTitle(product.country) + "</li>";
    html += "<li>" + product.nominal + "</li>";
    html += "</ul>";
    html += '<p class="product-card__rating">★ ' + product.rating.toFixed(1) + "</p>";
    html += '<div class="product-card__bottom">';
    html += '<p class="price">' + formatPrice(product.price);

    if (product.oldPrice) {
        html += ' <s class="price__old">' + formatPrice(product.oldPrice) + "</s>";
    }

    html += "</p>";
    html += '<button class="button button_small" type="button" data-add="' + product.id + '">В корзину</button>';
    html += "</div>";
    html += "</div>";
    html += "</article>";
    return html;
}

function renderProducts() {
    const box = document.getElementById("catalogItems");
    if (!box) {
        return;
    }

    const list = filteredProducts();

    let html = "";
    for (let i = 0; i < list.length; i++) {
        html += productCard(list[i]);
    }
    box.innerHTML = html;

    /* Steam пополняется по логину: вместо карточек показываем форму */
    const steamSelected = filters.platform.indexOf(STEAM_PLATFORM) !== -1;

    /* выбран только Steam — товаров в списке не будет */
    let onlySteam = false;
    if (steamSelected && filters.platform.length === 1) {
        onlySteam = true;
    }

    const steamBlock = document.getElementById("steamBlock");
    if (steamBlock) {
        steamBlock.hidden = !steamSelected;
    }

    const counter = document.getElementById("catalogCount");
    if (counter) {
        if (onlySteam) {
            counter.textContent = "Пополнение Steam";
        } else {
            counter.textContent = productsTitle(list.length);
        }
    }

    const empty = document.getElementById("catalogEmpty");
    if (empty) {
        if (list.length === 0 && onlySteam === false) {
            empty.hidden = false;
        } else {
            empty.hidden = true;
        }
    }
}

/* Пополнение Steam по логину */
function initSteamForm() {
    const form = document.getElementById("steamForm");
    if (!form) {
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (form.checkValidity() === false) {
            form.reportValidity();
            return;
        }

        const login = document.getElementById("steamLogin").value;
        const amount = document.getElementById("steamAmount").value;
        const success = document.getElementById("steamSuccess");

        success.textContent = "Заявка принята: пополним аккаунт " + login + " на " +
            amount + " ₽ после подтверждения заказа.";
        success.hidden = false;
        form.reset();
    });
}

/* ---------- запуск ---------- */

/* В адресе страницы могут быть параметры, например
   catalog.html?platform=apple — тогда галочка уже стоит */
function readUrlParams() {
    const search = window.location.search; /* строка вида "?platform=apple" */
    if (search.length < 2) {
        return;
    }

    const parts = search.substring(1).split("&");

    for (let i = 0; i < parts.length; i++) {
        const pair = parts[i].split("=");
        const key = pair[0];
        const value = decodeURIComponent(pair[1] || "");

        if (key === "platform" || key === "country" || key === "nominal") {
            filters[key] = [value];
        }
    }
}

function initCatalog() {
    /* если на странице нет каталога — ничего не делаем */
    const items = document.getElementById("catalogItems");
    if (!items) {
        return;
    }

    readUrlParams();
    renderFilters();
    renderProducts();
    updateAvailability();

    /* Галочки и ползунок лежат внутри #filters, поэтому слушаем сам блок:
       при перерисовке фильтра обработчики не теряются. */
    const filtersBox = document.getElementById("filters");

    filtersBox.addEventListener("change", function (event) {
        if (event.target.type === "checkbox") {
            collectFilters();
            renderProducts();
            updateAvailability();
        }
    });

    filtersBox.addEventListener("input", function (event) {
        if (event.target.id !== "priceRange") {
            return;
        }

        maxPrice = Number(event.target.value);
        document.getElementById("priceValue").textContent = formatPrice(maxPrice);
        renderProducts();
        updateAvailability();
    });

    const sort = document.getElementById("sortSelect");
    sort.addEventListener("change", function () {
        sortMode = sort.value;
        renderProducts();
    });

    const reset = document.getElementById("resetFilters");
    reset.addEventListener("click", function () {
        filters.platform = [];
        filters.country = [];
        filters.nominal = [];
        maxPrice = MAX_PRICE;
        sortMode = "popular";
        sort.value = "popular";
        renderFilters();
        renderProducts();
        updateAvailability();
    });
}

initCatalog();
initSteamForm();
