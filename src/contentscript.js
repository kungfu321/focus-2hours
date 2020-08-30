chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === "clicked_browser_action") {
            var baseURL = "https://vomanhkien.com";
            chrome.runtime.sendMessage({ "message": "open_new_tab", "url": baseURL });
        }
    }
);