/* Общие скрипты: версия для печати и год в подвале. */

function initPrintVersion() {
	const mainStyles = document.getElementById("mainStyles");
	const printStyles = document.getElementById("printStyles");
	const buttons = document.querySelectorAll("[data-print-toggle]");

	if (!mainStyles || !printStyles || buttons.length === 0) {
		return;
	}

	buttons.forEach(function (button) {
		button.addEventListener("click", function () {
			const printOn = printStyles.media === "not all";
			printStyles.media = printOn ? "all" : "not all";
			mainStyles.media = printOn ? "not all" : "all";
			buttons.forEach(function (item) {
				item.textContent = printOn ? "Обычная версия" : "Версия для печати";
			});
		});
	});
}

function initYear() {
	const year = document.getElementById("currentYear");
	if (year) {
		year.textContent = new Date().getFullYear();
	}
}

initPrintVersion();
initYear();
