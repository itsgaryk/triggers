const fetch = require("node-fetch");
const AbortController = require("abort-controller");

module.exports = async (n) => {
	const controller = new AbortController();
	const signal  = controller.signal
	const timeout = setTimeout(() => controller.abort(), 1500);
	const res = await fetch(n, {signal: controller.signal})
    return res;
}