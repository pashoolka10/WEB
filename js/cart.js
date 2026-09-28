const CART_KEY = "gamecard_cart";

/* Читает корзину из localStorage. Если её нет — возвращает пустой объект. */
function getCart() {
	const text = localStorage.getItem(CART_KEY);
	if (!text) {
		return {};
	}
	return JSON.parse(text);
}

/* Записывает корзину в localStorage. */
function saveCart(cart) {
	const text = JSON.stringify(cart);
	localStorage.setItem(CART_KEY, text);
}

/* Добавляет товар по id. Если уже был — увеличивает количество на 1. */
function addToCart(id) {
	const cart = getCart();
	if (cart[id]) {
		cart[id] = cart[id] + 1;
	} else {
		cart[id] = 1;
	}
	saveCart(cart);
	alert("Товар добавлен в корзину");
}

/* Меняет количество товара на +1 или -1. Если стало 0 — удаляет товар. */
function changeQuantity(id, delta) {
	const cart = getCart();
	cart[id] = cart[id] + delta;
	if (cart[id] <= 0) {
		delete cart[id];
	}
	saveCart(cart);
}

/* Удаляет товар по id. */
function removeFromCart(id) {
	const cart = getCart();
	delete cart[id];
	saveCart(cart);
}

/* Полностью очищает корзину. */
function clearCart() {
	saveCart({});
}

/* Ищет товар по id в массиве products из data.js. */
function findProduct(id) {
	for (let i = 0; i < products.length; i++) {
		if (products[i].id === id) {
			return products[i];
		}
	}
	return null;
}

/* Превращает число в строку вида «1 190 ₽». */
function formatPrice(value) {
	return value.toLocaleString("ru-RU") + " ₽";
}

/* Собирает список позиций корзины: товар, количество, сумма. */
function cartItems() {
	const cart = getCart();
	const items = [];
	for (const id in cart) {
		const product = findProduct(id);
		if (product) {
			items.push({
				product: product,
				count: cart[id],
				sum: product.price * cart[id]
			});
		}
	}
	return items;
}

/* Считает общую сумму заказа. */
function cartTotal() {
	const items = cartItems();
	let total = 0;
	for (let i = 0; i < items.length; i++) {
		total = total + items[i].sum;
	}
	return total;
}

/* Собирает HTML одной строки корзины. */
function cartItemHtml(item) {
	let html = '<li class="cart-item">';
	html = html + '<img class="cart-item__image" src="' + item.product.image + '" alt="' + item.product.name + '">';
	html = html + '<div class="cart-item__info">';
	html = html + '<h3 class="cart-item__name">' + item.product.name + '</h3>';
	html = html + '<p class="cart-item__meta">' + PLATFORMS[item.product.platform] +
		' • ' + COUNTRIES[item.product.country] +
		' • ' + item.product.nominal + '</p>';
	html = html + '<p class="cart-item__price">' + formatPrice(item.product.price) + '</p>';
	html = html + '</div>';
	html = html + '<div class="cart-item__controls">';
	html = html + '<button class="qty-button" type="button" onclick="minusClick(\'' + item.product.id + '\')">−</button>';
	html = html + '<span>' + item.count + '</span>';
	html = html + '<button class="qty-button" type="button" onclick="plusClick(\'' + item.product.id + '\')">+</button>';
	html = html + '</div>';
	html = html + '<p class="cart-item__sum">' + formatPrice(item.sum) + '</p>';
	html = html + '<button class="cart-item__remove" type="button" onclick="deleteClick(\'' + item.product.id + '\')">Удалить</button>';
	html = html + '</li>';
	return html;
}

/* Рисует корзину на странице: список товаров, итог, сообщение о пустоте. */
function renderCart() {
	const list = document.getElementById("cartItems");
	if (!list) {
		return;
	}

	const items = cartItems();
	const empty = document.getElementById("cartEmpty");
	const orderBlock = document.getElementById("orderBlock");

	const totals = document.querySelectorAll("[data-cart-total]");
	for (let i = 0; i < totals.length; i++) {
		totals[i].textContent = formatPrice(cartTotal());
	}

	if (items.length === 0) {
		list.innerHTML = "";
		empty.hidden = false;
		orderBlock.hidden = true;
		return;
	}

	empty.hidden = true;
	orderBlock.hidden = false;

	let html = "";
	for (let i = 0; i < items.length; i++) {
		html = html + cartItemHtml(items[i]);
	}
	list.innerHTML = html;
}

/* Обработчики кнопок «−», «+» и «Удалить» внутри корзины. */
function minusClick(id) {
	changeQuantity(id, -1);
	renderCart();
}

function plusClick(id) {
	changeQuantity(id, 1);
	renderCart();
}

function deleteClick(id) {
	removeFromCart(id);
	renderCart();
}

/* Обрабатывает отправку формы заказа: очищает корзину и показывает сообщение. */
function initOrderForm() {
	const form = document.getElementById("orderForm");
	if (!form) {
		return;
	}

	form.addEventListener("submit", function (event) {
		event.preventDefault();

		if (form.checkValidity() === false) {
			form.reportValidity();
			return;
		}

		const name = document.getElementById("orderName").value;
		const number = 1000 + Math.floor(Math.random() * 9000);

		clearCart();
		renderCart();

		const success = document.getElementById("orderSuccess");
		success.textContent = "Спасибо, " + name + "! Заказ №" + number +
			" принят — код активации отправим в течение 5 минут.";
		success.hidden = false;

		form.reset();
	});
}

renderCart();
initOrderForm();
