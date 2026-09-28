/* Корзина товаров. Всё храним в localStorage. */

const CART_KEY = "gamecard_cart";

/* ---------- чтение и запись корзины ---------- */

function getCart() {
	try {
		const text = localStorage.getItem(CART_KEY);
		if (text) {
			return JSON.parse(text);
		}
	} catch (error) {
		/* браузер запретил localStorage — корзина работать не будет */
	}
	return {};
}

function saveCart(cart) {
	try {
		localStorage.setItem(CART_KEY, JSON.stringify(cart));
	} catch (error) {
		alert("Браузер запрещает сохранять корзину. Открой сайт через Live Server (http), а не двойным щелчком по файлу.");
	}
}

/* ---------- что можно делать с корзиной ---------- */

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

function changeQuantity(id, delta) {
	const cart = getCart();
	cart[id] = cart[id] + delta;
	if (cart[id] <= 0) {
		delete cart[id];
	}
	saveCart(cart);
}

function removeFromCart(id) {
	const cart = getCart();
	delete cart[id];
	saveCart(cart);
}

function clearCart() {
	saveCart({});
}

/* ---------- вспомогательные ---------- */

function findProduct(id) {
	for (let i = 0; i < products.length; i++) {
		if (products[i].id === id) {
			return products[i];
		}
	}
	return null;
}

function formatPrice(value) {
	return value.toLocaleString("ru-RU") + " ₽";
}

/* ---------- вывод корзины на cart.html ---------- */

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

function cartTotal() {
	const items = cartItems();
	let total = 0;
	for (let i = 0; i < items.length; i++) {
		total = total + items[i].sum;
	}
	return total;
}

function cartItemHtml(item) {
	let html = '<li class="cart-item">';
	html += '<img class="cart-item__image" src="' + item.product.image + '" alt="' + item.product.name + '">';
	html += '<div class="cart-item__info">';
	html += '<h3 class="cart-item__name">' + item.product.name + '</h3>';
	html += '<p class="cart-item__meta">' + PLATFORMS[item.product.platform] + ' • ' +
		COUNTRIES[item.product.country] + ' • ' + item.product.nominal + '</p>';
	html += '<p class="cart-item__price">' + formatPrice(item.product.price) + '</p>';
	html += '</div>';
	html += '<div class="cart-item__controls">';
	html += '<button class="qty-button" type="button" data-minus="' + item.product.id + '">−</button>';
	html += '<span class="cart-item__count">' + item.count + '</span>';
	html += '<button class="qty-button" type="button" data-plus="' + item.product.id + '">+</button>';
	html += '</div>';
	html += '<p class="cart-item__sum">' + formatPrice(item.sum) + '</p>';
	html += '<button class="cart-item__remove" type="button" data-remove="' + item.product.id + '">Удалить</button>';
	html += '</li>';
	return html;
}

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
		if (empty) empty.hidden = false;
		if (orderBlock) orderBlock.hidden = true;
		return;
	}

	if (empty) empty.hidden = true;
	if (orderBlock) orderBlock.hidden = false;

	let html = "";
	for (let i = 0; i < items.length; i++) {
		html += cartItemHtml(items[i]);
	}
	list.innerHTML = html;
}

/* ---------- кнопки на странице корзины ---------- */

function initCartButtons() {
	const list = document.getElementById("cartItems");
	if (!list) {
		return;
	}

	list.addEventListener("click", function (event) {
		const minus = event.target.closest("[data-minus]");
		const plus = event.target.closest("[data-plus]");
		const remove = event.target.closest("[data-remove]");

		if (minus) {
			changeQuantity(minus.dataset.minus, -1);
			renderCart();
		}
		if (plus) {
			changeQuantity(plus.dataset.plus, 1);
			renderCart();
		}
		if (remove) {
			removeFromCart(remove.dataset.remove);
			renderCart();
		}
	});
}

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
		if (success) {
			success.textContent = "Спасибо, " + name + "! Заказ №" + number +
				" принят — код активации отправим в течение 5 минут.";
			success.hidden = false;
		}

		form.reset();
	});
}

/* ---------- запуск ---------- */

renderCart();
initCartButtons();
initOrderForm();
