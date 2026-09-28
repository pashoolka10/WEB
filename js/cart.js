/* Простая корзина. Всё храним в localStorage. */

const CART_KEY = "gamecard_cart";

/* Взять корзину из памяти браузера.
   Если её там нет — вернём пустой объект {} */
function getCart() {
	const text = localStorage.getItem(CART_KEY);
	if (!text) {
		return {};
	}
	return JSON.parse(text);
}

/* Положить корзину обратно в память браузера */
function saveCart(cart) {
	localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/* Добавить товар по id: если уже был — +1, если нет — станет 1 */
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

/* Найти товар по id (пригодится на странице корзины) */
function findProduct(id) {
	for (let i = 0; i < products.length; i++) {
		if (products[i].id === id) {
			return products[i];
		}
	}
	return null;
}

/* Цена в виде "1 190 ₽" */
function formatPrice(value) {
	return value.toLocaleString("ru-RU") + " ₽";
}
initAddButtons();
initCartButtons();
initOrderModal();
renderCard();
