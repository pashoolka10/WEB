/* Данные каталога. Всё хранится в обычном JS-массиве (вариант 2 из лабораторной работы N3). */

const PLATFORMS = {
	playstation: "PlayStation Store",
	apple: "Apple Gift Card",
	steam: "Steam",
	games: "Игры"
};

const COUNTRIES = {
	india: "Индия",
	turkey: "Турция",
	usa: "США",
	canada: "Канада",
	russia: "Россия"
};

/* Steam пополняется по логину, карт пополнения у него нет,
   но платформа должна быть в фильтре. */
const STEAM_PLATFORM = "steam";
const PLATFORM_VALUES = ["playstation", "apple", "steam", "games"];

const products = [
	{
		id: "ps-in-1000",
		name: "PlayStation Store Индия 1000 INR",
		platform: "playstation",
		country: "india",
		nominal: "1000 INR",
		price: 1190,
		oldPrice: 1490,
		rating: 4.9,
		popular: 100,
		image: "images/ps-india-1000.jpg",
		description: "Карта пополнения кошелька PSN для индийского региона. Подходит для покупки игр, подписок PS Plus и дополнений."
	},
	{
		id: "ps-in-2000",
		name: "PlayStation Store Индия 2000 INR",
		platform: "playstation",
		country: "india",
		nominal: "2000 INR",
		price: 2290,
		oldPrice: 2690,
		rating: 4.9,
		popular: 92,
		image: "images/ps-india-2000.jpg",
		description: "Увеличенный номинал для индийского аккаунта. Хватает на крупную игру или несколько месяцев подписки."
	},
	{
		id: "ps-tr-500",
		name: "PlayStation Store Турция 500 TRY",
		platform: "playstation",
		country: "turkey",
		nominal: "500 TRY",
		price: 1490,
		rating: 4.8,
		popular: 88,
		image: "images/ps-turkey-500.svg",
		description: "Турецкий регион PSN — один из самых дешёвых. Код приходит на e-mail и активируется в турецком аккаунте."
	},
	{
		id: "ps-tr-1000",
		name: "PlayStation Store Турция 1000 TRY",
		platform: "playstation",
		country: "turkey",
		nominal: "1000 TRY",
		price: 2790,
		rating: 4.8,
		popular: 84,
		image: "images/ps-turkey-1000.svg",
		description: "Пополнение турецкого кошелька PSN на крупную сумму. Активация занимает не больше пары минут."
	},
	{
		id: "ap-us-25",
		name: "Apple Gift Card США 25 USD",
		platform: "apple",
		country: "usa",
		nominal: "25 USD",
		price: 2690,
		rating: 4.9,
		popular: 95,
		image: "images/apple-usa-25.jpg",
		description: "Карта для американского Apple ID: App Store, iCloud, Apple Music, подписки и покупки внутри приложений."
	},
	{
		id: "ap-us-100",
		name: "Apple Gift Card США 100 USD",
		platform: "apple",
		country: "usa",
		nominal: "100 USD",
		price: 9890,
		oldPrice: 10490,
		rating: 4.9,
		popular: 90,
		image: "images/apple-usa-100.jpg",
		description: "Большой номинал для американского аккаунта Apple. Удобно, если покупаете технику или платите за подписки на год."
	},
	{
		id: "ap-ca-15",
		name: "Apple Gift Card Канада 15 CAD",
		platform: "apple",
		country: "canada",
		nominal: "15 CAD",
		price: 1190,
		rating: 4.7,
		popular: 70,
		image: "images/apple-canada-15.jpg",
		description: "Небольшая карта пополнения для канадского Apple ID. Подходит для подписок и покупок в App Store."
	},
	{
		id: "ap-ca-100",
		name: "Apple Gift Card Канада 100 CAD",
		platform: "apple",
		country: "canada",
		nominal: "100 CAD",
		price: 7190,
		rating: 4.7,
		popular: 66,
		image: "images/apple-canada-100.jpg",
		description: "Максимальный номинал для канадского региона. Подходит для годовых подписок и крупных покупок."
	},
	{
		id: "game-gta6-std",
		name: "GTA VI (PS5). Стандартное издание",
		platform: "games",
		country: "russia",
		nominal: "Стандартное издание",
		price: 8990,
		oldPrice: 9490,
		rating: 5.0,
		popular: 98,
		image: "images/gta6.jpg",
		description: "Ключ активации Grand Theft Auto VI для PlayStation 5. Предзаказ: ключ приходит в день выхода игры."
	},
	{
		id: "game-gta6-deluxe",
		name: "GTA VI (PS5). Deluxe Edition",
		platform: "games",
		country: "russia",
		nominal: "Deluxe издание",
		price: 11490,
		rating: 5.0,
		popular: 74,
		image: "images/gta6.jpg",
		description: "Расширенное издание GTA VI: базовая игра, бонусные наборы и внутриигровая валюта для онлайн-режима."
	}
];

/* Группы фильтра. Порядок групп — это порядок блоков в боковой панели каталога. */
const filterConfig = [
	{ key: "platform", title: "Платформа" },
	{ key: "country", title: "Страна" },
	{ key: "nominal", title: "Номинал" }
];

/* Красивые подписи для значений фильтра. */
const VALUE_TITLES = {
	playstation: "PlayStation",
	apple: "Apple",
	steam: "Steam",
	games: "Игры",
	india: "Индия",
	turkey: "Турция",
	usa: "США",
	canada: "Канада",
	russia: "Россия"
};

/* Максимальная цена для ползунка «Цена». */
const MAX_PRICE = 12000;
