export function storeImage(image: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({image}, () => {
      let error
      if (error = chrome.runtime.lastError) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

export function getImage(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get({image: null}, (values) => {
      let error
      if (error = chrome.runtime.lastError) {
        reject(error)
      } else {
        resolve(values.image)
      }
    })
  })
}
