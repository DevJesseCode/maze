const shuffle = (iterable) => {
	let counter = iterable.length;
	const string = typeof iterable === "string" ? true : false;
	const iterableArray = new Array(...iterable);
	while (counter > 0) {
		const index = Math.floor(Math.random() * counter);
		counter--;
		const temp = iterableArray[counter];
		iterableArray[counter] = iterableArray[index];
		iterableArray[index] = temp;
	}
	return string ? iterableArray.join("") : iterableArray;
};

const average = (...arguments) => {
	const sum = arguments.reduce((total, current) => Number(current) + total, 0);
	return sum / arguments.length;
};

const reload = (clearStorage) => {
	if (clearStorage) localStorage.clear();
	const meta = document.createElement("meta");
	meta.setAttribute("http-equiv", "refresh");
	meta.setAttribute("content", "0.5");
	document.head.appendChild(meta);
};
