/* eslint-disable no-self-compare */
function isNaN(number) {
	return !(number === number);
}
/* eslint-enable no-self-compare */

function isInteger(input) {
	if (typeof input !== "number") {
		return false;
	}
	return input === parseInt(input, 10);
}

function isPositive(number) {
	return number > 0;
}

module.exports = {
	isNaN,
	isInteger,
	isPositive,
};
