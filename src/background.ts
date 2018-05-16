import {storeImage} from "./utils/storage";

(function() {
  chrome.runtime.onMessage.addListener(onNewImageSelected);
})();

function onNewImageSelected(request, sender, sendResponse) {
  const imageDataUri = request.image;
  storeImage(imageDataUri).then(() => {
    triggerImageRerender();
  })
}

function triggerImageRerender() {
  chrome.tabs.query({}, function(tabs) {
    tabs.forEach(function(tab) {
      chrome.tabs.sendMessage(tab.id, {action: "render"}, null)
    })
  })
}