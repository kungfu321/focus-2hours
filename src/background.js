global.browser = require('webextension-polyfill')
defaultOptions();
var timerBG = null;

function defaultOptions() {
	const settings = localStorage.getItem("settings");
	if (!settings) {
		console.log(settings);
		const dataJson = JSON.stringify({
			startonClick: true,
			audioPlay: true,
			timerDuration: 120,
			unblockDuration: 15,
		});

		localStorage.setItem("settings", dataJson);
	}
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (tab.url && !tab.url.includes("chrome://")) {
		const blockList = JSON.parse(localStorage.getItem("blockList"));
		if (blockList) {
			const rootDomain = getHostName(tab.url);
			const onPlay = localStorage.play;
			if (onPlay === 'true' && blockList && blockList.includes(rootDomain)) {
				chrome.tabs.executeScript(tabId, {
					code: 'document.location.replace("https://focus-2-hours.kien.pro")',
				});
			}
		}
	}
});

function getHostName(url) {
	const match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
	if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
		return match[2];
	}
	else {
		return null;
	}
}

function checkTimeRemain() {
	let endTime = localStorage.endTime123;
	const settings = JSON.parse(localStorage.getItem("settings"));
	console.log("OKOK", endTime);
	if (endTime !== undefined) {
		endTime = Number(endTime);
	} else {
		clearInterval(timerBG);
		timerBG = null;
		return;
	}
	const now = new Date().getTime();
	if (now >= endTime) {
		localStorage.play = false;
		localStorage.removeItem("endTime123");
		clearInterval(timerBG);
		timerBG = null;
		chrome.notifications.clear('notify1');
		const opt = {
			iconUrl: "./icons/congrats48.png",
			type: 'basic',
			title: 'Congratulations!',
			message: 'You made it! Take a break...',
		};
		chrome.notifications.create('notify1', opt, function () { console.log('created notifications!'); })
		if (settings.audioPlay) {
			console.log('audioPlay', settings)
			const audio = new Audio('./audio/notification.mp3');
			audio.play();
		}
	}
}

chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		if (request.command === "startTimer") {
			startTimer();
		}

		if (request.command === "stopTimer") {
			clearInterval(timerBG);
			timerBG = null;
		}
	});

function startTimer() {
	timerBG = setInterval(checkTimeRemain, 1000);
}