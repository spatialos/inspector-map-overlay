import {getImage} from "./utils/storage";

const PAGE_SCRIPT_URL = chrome.extension.getURL('injected.js');

function inject(url) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  (document.head || document.documentElement).appendChild(script);
}

inject(PAGE_SCRIPT_URL);

let visCanvas;
let mapCanvas = document.createElement("canvas");
mapCanvas.style.cssText = "position: absolute; opacity: 0.6;";

let mapPosition;
let mapImage: HTMLImageElement;

// Return the scaling factor of the display,
// in order to correctly render the overlay
// on high-res (retina) displays.
function backingScale(context) {
    if ('devicePixelRatio' in window) {
        if (window.devicePixelRatio > 1) {
            return window.devicePixelRatio;
        }
    }
    return 1;
}

// Re-renders the overlay using mapPosition and mapImage.
function render() {
  // Ensure map canvas matches vis canvas in dimensions.
  if (visCanvas && (mapCanvas.width !== visCanvas.width || mapCanvas.height !== visCanvas.height)) {
    console.log("Resizing")
    mapCanvas.width = visCanvas.width;
    mapCanvas.height = visCanvas.height
  }

  // Re-render the map
  const ctx = mapCanvas.getContext("2d")
  ctx.clearRect(0,0,mapCanvas.width, mapCanvas.height)
  if (mapPosition && mapImage) {
    const bl = mapPosition.bottomLeft
    const tr = mapPosition.topRight
    const w = mapCanvas.width / backingScale(ctx);
    const h = mapCanvas.height / backingScale(ctx)

    ctx.clearRect(0,0,mapCanvas.width, mapCanvas.height)
    ctx.drawImage(
      mapImage,
      bl.x * w,
      (1 - bl.y - (tr.y - bl.y)) * h,
      (tr.x - bl.x) * w,
      (tr.y - bl.y) * h
    )
  }
}

// Retrieve the latest map from the storage
// and re-render it on the screen.
function loadAndRenderMap(): Promise<void> {
  return new Promise((resolve, reject) => {
    getImage().then((image) => {
      if (image === null) {
        mapImage = null;
        render()
        resolve()
      } else {
        const img = new Image();
        img.onload = () => {
          mapImage = img;
          render();
          resolve()
        };
        img.src = image
      }
    });
  })
}

function initMap() {
  return new Promise((resolve, reject) => {
    const canvasContainer = document.querySelector('[data-test-id="world-visualisation-canvas"]');
    canvasContainer.insertBefore(mapCanvas, canvasContainer.firstChild);
    loadAndRenderMap().then(() => {
      resolve()
    })
  })
}

function waitUntilCanvasIsRendered(done) {
  setTimeout(() => {
    const canvas = document.querySelector('[data-test-id="world-visualisation-canvas"] canvas');
    if (canvas !== null) {
      done(canvas)
    } else {
      waitUntilCanvasIsRendered(done)
    }
  }, 50)
}

function subscribeToMapImageUpdates() {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "render") {
      loadAndRenderMap().then(() => {
        sendResponse("done")
      })
    }
  });
}

function subscribeToMapPositionUpdates() {
  window.addEventListener('message', function(event) {
    mapPosition = event.data;
    render()
  });
}

waitUntilCanvasIsRendered((canvas) => {
  mapCanvas.width = canvas.width;
  mapCanvas.height = canvas.height;
  visCanvas = canvas;

  initMap().then(() => {
    subscribeToMapImageUpdates();
    subscribeToMapPositionUpdates()
  });
});



