var IMAGE_FILE_NAME = "improbable_inspector_image_overlay.png"

var onError = function(e) {
  console.log('There was an error', e);
};

function readFile(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();

    reader.onload = function(evt) {
      resolve(reader.result)
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  })
}

function applyMap(dataURLImg) {
  chrome.runtime.sendMessage({
    image: dataURLImg
  }, function(response) { 
    console.log(response) 
  });
}

document.addEventListener("DOMContentLoaded", function(event) {
  (document.querySelector("input[type='file']") as any).onchange = function(e) {
    console.log(e.target.files[0])
    readFile(e.target.files[0]).then((dataURLImg) => {
      applyMap(dataURLImg)
    }).catch((err) => {
      console.error(err)
      applyMap(null)
    })
  };

  (document.querySelector("#clearbutton") as any).onclick = function(e) {
    applyMap(null)
  }
});