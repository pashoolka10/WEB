/* Корзина. Товары хранятся в localStorage, чтобы не пропадали при переходе между страницами. */

const CART_KEY = "gamecard_cart";

function formatPrice(value) {
	return value.toLocaleString("ru-RU") + " ₽";
}

function readCart() {
	try {
		return JSON.parse(localStorage.getItem(CART_KEY)) || {};
	} catch (error) {
		return {};
	}
}

function writeCart(cart) {
	try {
		localStorage.setItem(CART_KEY, JSON.stringify(cart));
	} catch (error) {
		/* например, если браузер запрещает localStorage для локальных файлов */
	}
}

function findProduct(id) {
	return products.find(function (item) {
		return item.id === id;
	});
}

function addToCart(id, count) {
	const cart = readCart();
	const amount = count || 1;
	cart[id] = (cart[id] || 0) + amount;
	writeCart(cart);
}

function changeQuantity(id, delta) {
	const cart = readCart();
	if (!cart[id]) {
		return;
	}
	cart[id] = cart[id] + delta;
	if (cart[id] < 1) {
		delete cart[id];
	}
	writeCart(cart);
}

function removeFromCart(id) {
	const cart = readCart();
	delete cart[id];
	writeCart(cart);
}

function clearCart() {
	writeCart({});
}

/* Список товаров в корзине: [{ product, count, sum }] */
function cartItems() {
	const cart = readCart();
	const result = [];
	for (const id in cart) {
		const product = findProduct(id);
		if (product) {
			result.push({ product: product, count: cart[id], sum: product.price * cart[id] });
		}
	}
	return result;
}

function cartCount() {
	let count = 0;
	cartItems().forEach(function (item) {
		count += item.count;
	});
	return count;
}

function cartTotal() {
	let total = 0;
	cartItems().forEach(function (item) {
		total += item.sum;
	});
	return total;
}

/* Отрисовка страницы корзины */
function renderCart() {
	const list = document.getElementById("cartItems");
	if (!list) {
		return;
	}

	const items = cartItems();
	const emptyBlock = document.getElementById("cartEmpty");
	const orderBlock = document.getElementById("orderBlock");
	const totalBlocks = document.querySelectorAll("[data-cart-total]");

	totalBlocks.forEach(function (element) {
		element.textContent = formatPrice(cartTotal());
	});

	if (items.length === 0) {
		list.innerHTML = "";
		emptyBlock.hidden = false;
		orderBlock.hidden = true;
		return;
	}

	emptyBlock.hidden = true;
	orderBlock.hidden = false;

	let html = "";
	items.forEach(function (item) {
		html += '<li class="cart-item">';
		html += '<img class="cart-item__image" src="' + item.product.image + '" alt="' + item.product.name + '">';
		html += '<div class="cart-item__info">';
		html += '<h3 class="cart-item__name">' + item.product.name + "</h3>";
		html += "<p class=\"cart-item__meta\">" + PLATFORMS[item.product.platform] + " • " + COUNTRIES[item.product.country] + " • " + item.product.nominal + "</p>";
		html += '<p class="cart-item__price">' + formatPrice(item.product.price) + "</p>";
		html += "</div>";
		html += '<div class="cart-item__controls">';
		html += '<button class="qty-button" type="button" data-minus="' + item.product.id + '" aria-label="Уменьшить количество">−</button>';
		html += '<span class="cart-item__count">' + item.count + "</span>";
		html += '<button class="qty-button" type="button" data-plus="' + item.product.id + '" aria-label="Увеличить количество">+</button>';
		html += "</div>";
		html += '<p class="cart-item__sum">' + formatPrice(item.sum) + "</p>";
		html += '<button class="cart-item__remove" type="button" data-remove="' + item.product.id + '">Удалить</button>';
		html += "</li>";
	});
	list.innerHTML = html;
}

/* Кнопки «В корзину» на любой странице */
function initAddButtons() {
	document.addEventListener("click", function (event) {
		const button = event.target.closest("[data-add]");
		if (!button) {
			return;
		}
		addToCart(button.dataset.add);
	});
}

/* Кнопки внутри корзины */
function initCartPage() {
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

	const form = document.getElementById("orderForm");
	if (form) {
		form.addEventListener("submit", function (event) {
			event.preventDefault();
			if (!form.checkValidity()) {
				form.reportValidity();
				return;
			}
			const success = document.getElementById("orderSuccess");
			const number = 1000 + Math.floor(Math.random() * 9000);
			success.textContent = "Спасибо! Заказ №" + number + " принят. Код придёт на указанную почту в течение 5 минут.";
			success.hidden = false;
			form.reset();
			clearCart();
			renderCart();
		});
	}
}

initAddButtons();
initCartPage();
