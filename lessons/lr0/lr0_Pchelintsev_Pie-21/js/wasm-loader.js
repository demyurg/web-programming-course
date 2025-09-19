let wasmInstance;

async function preloadWasm() {
	try {
		const response = await fetch('../wasm/calculator.wasm');
		const bytes = await response.arrayBuffer();
		const result = await WebAssembly.instantiate(bytes);
		wasmInstance = result.instance;
		console.log("Экспортированные функции:", Object.keys(wasmInstance.exports));
	} catch (err) {
		console.error("Ошибка загрузки WASM:", err);
		document.getElementById('result').innerText = "WASM не загружен или функция отсутствует.";
	}
}

preloadWasm();

function calculateTotal() {
	const cpu = parseInt(document.getElementById('cpuPrice').value) || 0;
	const gpu = parseInt(document.getElementById('gpuPrice').value) || 0;
	const ram = parseInt(document.getElementById('ramPrice').value) || 0;
	const storage = parseInt(document.getElementById('storagePrice').value) || 0;

	if (!wasmInstance || typeof wasmInstance.exports.calculate !== 'function') {
		document.getElementById('result').innerText = "WASM не загружен или функция отсутствует.";
		return;
	}

	const total = wasmInstance.exports.calculate(cpu, gpu, ram, storage);
	document.getElementById('result').innerText = `Общая стоимость: ${total} ₽`;
}