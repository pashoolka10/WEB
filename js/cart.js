/* Корзина и оформление заказа.

   Корзина хранится в localStorage — это память браузера, которая
   не пропадает при переходе между страницами.
   Сама корзина выглядит как объект { "ps-in-1000": 2, "ap-us-25": 1 },
   где ключ — это id товара из data.js, а значение — количество. */

const CART_KEY = "gamecard_cart";

/* Копия корзины в памяти страницы. Нужна на случай, если браузер
   запретил localStorage (режим инкогнито, запрет куки и т.п.) */
let cartInMemory = {};

/* Получилось ли сохранить корзину в память браузера */
let cartSaved = true;

/* Цена в виде «1 190 ₽» */
function formatPrice(value) {
	return value.toLocaleString("ru-RU") + " ₽";
}

/* ---------- чтение и запись корзины ---------- */

/* Читаем корзину из памяти браузера */
function readCart() {
	try {
		const saved = localStorage.getItem(CART_KEY);
		if (saved) {
			cartInMemory = JSON.parse(saved);
		}
	} catch (error) {
		/* хранилище запрещено — работаем с копией в памяти */
	}
	return cartInMemory;
}

/* Сохраняем корзину и в память страницы, и в память браузера */
function writeCart(cart) {
	cartInMemory = cart;

	try {
		localStorage.setItem(CART_KEY, JSON.stringify(cart));
		cartSaved = true;
	} catch (error) {
		/* сохранить в браузер не получилось: корзина будет работать
		   только на текущей странице, об этом скажем пользователю */
		cartSaved = false;
	}
}

/* Ищем товар из data.js по его id */
function findProduct(id) {
	for (let i = 0; i < products.length; i++) {
		if (products[i].id === id) {
			return products[i];
		}
	}
	return null;
}

/* ---------- что можно сделать с корзиной ---------- */

/* Добавить товар (кнопка «В корзину») */
function addToCart(id) {
	const cart = readCart();

	if (cart[id]) {
		cart[id] = cart[id] + 1;
	} else {
		cart[id] = 1;
	}

	writeCart(cart);
}

/* Изменить количество на +1 или -1 */
function changeQuantity(id, delta) {
	const cart = readCart();
	cart[id] = cart[id] + delta;

	/* если количество стало 0 — убираем товар совсем */
	if (cart[id] === 0) {
		delete cart[id];
	}

	writeCart(cart);
}

/* Удалить товар из корзины */
function removeFromCart(id) {
	const cart = readCart();
	delete cart[id];
	writeCart(cart);
}

/* Очистить корзину после оформления заказа */
function clearCart() {
	writeCart({});
}

/* ---------- подсчёты для страницы корзины ---------- */

/* Список товаров: сам товар, количество и сумма по нему */
function cartItems() {
	const cart = readCart();
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

/* Сколько всего товаров в корзине */
function cartCount() {
	const items = cartItems();
	let count = 0;

	for (let i = 0; i < items.length; i++) {
		count = count + items[i].count;
	}

	return count;
}

/* Общая сумма заказа */
function cartTotal() {
	const items = cartItems();
	let total = 0;

	for (let i = 0; i < items.length; i++) {
		total = total + items[i].sum;
	}

	return total;
}

/* ---------- вывод корзины на странице ---------- */

/* Одна строка корзины */
function cartItemHtml(item) {
	let html = '<li class="cart-item">';
	html += '<img class="cart-item__image" src="' + item.product.image + '" alt="' + item.product.name + '">';
	html += '<div class="cart-item__info">';
	html += '<h3 class="cart-item__name">' + item.product.name + "</h3>";
	html += '<p class="cart-item__meta">' + PLATFORMS[item.product.platform] + " • " +
		COUNTRIES[item.product.country] + " • " + item.product.nominal + "</p>";
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
	return html;
}

/* Выводим корзину: список товаров, сумму, пустое сообщение */
function renderCart() {
	const list = document.getElementById("cartItems");
	if (!list) {
		return;
	}

	const items = cartItems();
	const empty = document.getElementById("cartEmpty");
	const orderBlock = document.getElementById("orderBlock");

	/* итоговую сумму показываем в подписи data-cart-total */
	const totals = document.querySelectorAll("[data-cart-total]");
	for (let i = 0; i < totals.length; i++) {
		totals[i].textContent = formatPrice(cartTotal());
	}

	/* корзина пустая — показываем сообщение и прячем блок оформления */
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
		html += cartItemHtml(items[i]);
	}
	list.innerHTML = html;
}

/* ---------- кнопки ---------- */

/* Кнопки «В корзину» есть на разных страницах, поэтому ловим клик
   по всему документу и смотрим, не нажали ли на такую кнопку */
function initAddButtons() {
	document.addEventListener("click", function (event) {
		const button = event.target.closest("[data-add]");
		if (button) {
			addToCart(button.dataset.add);

			/* если браузер не разрешил сохранить корзину — предупреждаем,
			   иначе будет непонятно, почему товар не появился в корзине */
			if (cartSaved === false) {
				alert("Браузер не разрешает сохранять корзину. Откройте сайт по ссылке (http), а не двойным щелчком по файлу.");
			}
		}
	});
}

/* Кнопки «+», «−» и «Удалить» внутри корзины */
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

/* ---------- модальное окно оформления заказа ---------- */

function openOrderModal() {
	document.getElementById("orderModal").hidden = false;
}

function closeOrderModal() {
	document.getElementById("orderModal").hidden = true;
}

function initOrderModal() {
	const modal = document.getElementById("orderModal");
	const form = document.getElementById("orderForm");
	if (!modal || !form) {
		return;
	}

	/* «Оформить заказ» открывает окно, «Отмена» закрывает */
	document.getElementById("orderOpen").addEventListener("click", openOrderModal);
	document.getElementById("orderCancel").addEventListener("click", closeOrderModal);

	/* щелчок по тёмному фону вокруг окна тоже закрывает его */
	modal.addEventListener("click", function (event) {
		if (event.target === modal) {
			closeOrderModal();
		}
	});

	/* «Отправить»: проверяем поля, закрываем окно, очищаем корзину */
	form.addEventListener("submit", function (event) {
		event.preventDefault();

		if (form.checkValidity() === false) {
			form.reportValidity();
			return;
		}

		const surname = document.getElementById("orderSurname").value;
		const name = document.getElementById("orderName").value;
		const number = 1000 + Math.floor(Math.random() * 9000);

		closeOrderModal();
		form.reset();

		clearCart();
		renderCart();

		const success = document.getElementById("orderSuccess");
		success.textContent = "Спасибо, " + surname + " " + name +
			"! Заказ №" + number + " принят — код активации отправим в течение 5 минут.";
		success.hidden = false;
	});
}

initAddButtons();
initCartButtons();
initOrderModal();
