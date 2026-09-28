const groups = [
	{ key: "platform", title: "Платформа" },
	{ key: "country", title: "Страна" },
	{ key: "nominal", title: "Номинал" }
];

const selected = {
	platform: [],
	country: [],
	nominal: []
};

let maxPrice = MAX_PRICE;
let sortMode = "popular";

/* Возвращает красивую подпись значения: "playstation" -> "PlayStation". */
function valueTitle(value) {
	if (VALUE_TITLES[value]) {
		return VALUE_TITLES[value];
	}
	return value;
}

/* Собирает все возможные значения характеристики из товаров. */
function valuesOf(key) {
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

/* Склоняет слово «товар»: 1 товар, 2 товара, 12 товаров. */
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

/* Проверяет, подходит ли товар набору галочек и ползунку цены. */
function isSuitable(product, check) {
	for (let i = 0; i < groups.length; i++) {
		const key = groups[i].key;
		const selectedValues = check[key];

		if (selectedValues.length === 0) {
			continue;
		}

		if (selectedValues.indexOf(product[key]) === -1) {
			return false;
		}
	}

	if (product.price > maxPrice) {
		return false;
	}

	return true;
}

/* Возвращает список товаров, подходящих фильтру, в нужном порядке. */
function filteredProducts() {
	const result = [];
	for (let i = 0; i < products.length; i++) {
		if (isSuitable(products[i], selected)) {
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

/* Строит панель фильтра: чекбоксы по группам и ползунок цены. */
function renderFilters() {
	const box = document.getElementById("filters");
	if (!box) {
		return;
	}

	let html = "";

	for (let i = 0; i < groups.length; i++) {
		const group = groups[i];
		const values = valuesOf(group.key);
		const checkedValues = selected[group.key];

		html = html + '<div class="filter-group">';
		html = html + '<h3 class="filter-group__title">' + group.title + '</h3>';

		for (let j = 0; j < values.length; j++) {
			const value = values[j];

			let checked = "";
			if (checkedValues.indexOf(value) !== -1) {
				checked = " checked";
			}

			html = html + '<label class="checkbox">';
			html = html + '<input type="checkbox" name="' + group.key + '" value="' + value + '"' + checked + '>';
			html = html + '<span>' + valueTitle(value) + '</span>';
			html = html + '</label>';
		}

		html = html + '</div>';
	}

	html = html + '<div class="filter-group">';
	html = html + '<h3 class="filter-group__title">Цена, до <span id="priceValue">' + formatPrice(maxPrice) + '</span></h3>';
	html = html + '<input class="range" type="range" id="priceRange" min="500" max="' + MAX_PRICE + '" step="100" value="' + maxPrice + '">';
	html = html + '</div>';

	box.innerHTML = html;
}

/* Читает отмеченные галочки со страницы в объект selected. */
function collectFilters() {
	for (let i = 0; i < groups.length; i++) {
		const key = groups[i].key;
		const boxes = document.querySelectorAll('#filters input[name="' + key + '"]:checked');

		const values = [];
		for (let j = 0; j < boxes.length; j++) {
			values.push(boxes[j].value);
		}

		selected[key] = values;
	}
}

/* Умный фильтр: выключает галочки, которые дадут пустой результат. */
function updateAvailability() {
	for (let i = 0; i < groups.length; i++) {
		const group = groups[i];
		const boxes = document.querySelectorAll('#filters input[name="' + group.key + '"]');

		for (let j = 0; j < boxes.length; j++) {
			const box = boxes[j];

			const test = {
				platform: selected.platform.slice(),
				country: selected.country.slice(),
				nominal: selected.nominal.slice()
			};
			test[group.key] = [box.value];

			let hasResult = false;
			for (let k = 0; k < products.length; k++) {
				if (isSuitable(products[k], test)) {
					hasResult = true;
				}
			}

			let isSteam = false;
			if (group.key === "platform" && box.value === "steam") {
				isSteam = true;
			}

			const needDisable = (hasResult === false) && (box.checked === false) && (isSteam === false);

			if (needDisable) {
				box.disabled = true;
				box.parentNode.classList.add("checkbox_disabled");
			} else {
				box.disabled = false;
				box.parentNode.classList.remove("checkbox_disabled");
			}
		}
	}
}

/* Собирает HTML одной карточки товара. */
function productCard(product) {
	let html = '<article class="product-card">';
	html = html + '<div class="product-card__media">';
	html = html + '<img src="' + product.image + '" alt="' + product.name + '">';
	html = html + '</div>';
	html = html + '<div class="product-card__body">';
	html = html + '<h3 class="product-card__name">' + product.name + '</h3>';
	html = html + '<p class="product-card__description">' + product.description + '</p>';
	html = html + '<ul class="product-card__meta">';
	html = html + '<li>' + valueTitle(product.platform) + '</li>';
	html = html + '<li>' + valueTitle(product.country) + '</li>';
	html = html + '<li>' + product.nominal + '</li>';
	html = html + '</ul>';
	html = html + '<p class="product-card__rating">★ ' + product.rating.toFixed(1) + '</p>';
	html = html + '<div class="product-card__bottom">';
	html = html + '<p class="price">' + formatPrice(product.price);

	if (product.oldPrice) {
		html = html + ' <s class="price__old">' + formatPrice(product.oldPrice) + '</s>';
	}

	html = html + '</p>';
	html = html + '<button class="button button_small" type="button" onclick="addToCart(\'' + product.id + '\')">В корзину</button>';
	html = html + '</div>';
	html = html + '</div>';
	html = html + '</article>';
	return html;
}

/* Выводит все подходящие товары и обновляет счётчик, блок Steam и сообщение о пустоте. */
function renderProducts() {
	const box = document.getElementById("catalogItems");
	const list = filteredProducts();

	let html = "";
	for (let i = 0; i < list.length; i++) {
		html = html + productCard(list[i]);
	}
	box.innerHTML = html;

	const steamSelected = selected.platform.indexOf("steam") !== -1;
	const onlySteam = steamSelected && selected.platform.length === 1;

	const steamBlock = document.getElementById("steamBlock");
	steamBlock.hidden = !steamSelected;

	const counter = document.getElementById("catalogCount");
	if (onlySteam) {
		counter.textContent = "Пополнение Steam";
	} else {
		counter.textContent = productsTitle(list.length);
	}

	const empty = document.getElementById("catalogEmpty");
	if (list.length === 0 && onlySteam === false) {
		empty.hidden = false;
	} else {
		empty.hidden = true;
	}
}

/* Обрабатывает форму пополнения Steam. */
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

		success.textContent = "Заявка принята: пополним аккаунт " + login +
			" на " + amount + " ₽ после подтверждения заказа.";
		success.hidden = false;

		form.reset();
	});
}

/* Читает параметры из адреса (?platform=apple) и ставит галочки. */
function readUrlParams() {
	const params = new URLSearchParams(window.location.search);

	for (let i = 0; i < groups.length; i++) {
		const key = groups[i].key;
		const value = params.get(key);
		if (value) {
			selected[key] = [value];
		}
	}
}

/* Запускает каталог: строит фильтр, товары и подключает обработчики. */
function initCatalog() {
	const items = document.getElementById("catalogItems");
	if (!items) {
		return;
	}

	readUrlParams();
	renderFilters();
	renderProducts();
	updateAvailability();

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
		selected.platform = [];
		selected.country = [];
		selected.nominal = [];
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
