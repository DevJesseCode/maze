const shuffle = (iterable) => {
	let counter = iterable.length;
	const string = typeof iterable === "string" ? true : false;
	iterable = new Array(...iterable);
	while (counter > 0) {
		const index = Math.floor(Math.random() * counter);
		counter--;
		const temp = iterable[counter];
		iterable[counter] = iterable[index];
		iterable[index] = temp;
	}
	return string ? iterable.join("") : iterable;
};

const average = (...arguments) => {
	const sum = arguments.reduce((prev, current) => {
		return Number(current) + prev;
	}, 0);
	return sum / arguments.length;
};

const reload = () => {
	const meta = document.createElement("meta");
	meta.setAttribute("http-equiv", "refresh");
	meta.setAttribute("content", "2");
	document.head.appendChild(meta);
};
