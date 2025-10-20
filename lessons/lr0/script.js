function toggleTab(element) {
	let tabId = element.dataset.tab || element.closest('.tab-content').id // определяем нажимаемую вкладку

	let tabContent = document.getElementById(`tab-${tabId}`)

	tabContent.style.display =
		tabContent.style.display === 'block' ? 'none' : 'block' // вкл/выкл вкладки
}
