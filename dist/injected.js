// This script is injected into the Inspector DOM,
// in order to subscribe to window._MAP_OVERLAY_,
// which contains real-time coordinates by which
// the map should be rendered.

function pollUntilOverlayDataReady(done) {
    setTimeout(function() {
       if (window.hasOwnProperty("_MAP_OVERLAY_")) {
           done()
       } else {
           pollUntilOverlayDataReady(done)
       }
    }, 50)
}

pollUntilOverlayDataReady(function() {
    window._MAP_OVERLAY_.addListener(function(newData) {
        window.postMessage(newData, "*")
    })
});
