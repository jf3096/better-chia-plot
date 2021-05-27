const calTimeElapse = (ms) => {
	const sec = ms / 1000;
	const min = sec / 60;
	const floorMin = Math.floor(min);
	const floorSec = Math.floor((min - floorMin) * 60);
	const minString = floorMin < 10 ? `0${floorMin}` : floorMin;
	const secString = floorMin < 10 ? `0${floorSec}` : floorSec;
	return `${minString}:${secString}`;
};

module.exports = calTimeElapse;