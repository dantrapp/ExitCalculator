//typing.js

(() => {
  const jsTextBlock = document.getElementById('js-text-block')
      , jsTextInput = document.getElementById('js-text-value')

  if ((jsTextInput.value).length === 0) {
    jsTextBlock.innerHTML = 'Empty'
  }

  jsTextInput.addEventListener('input', () => {
    jsTextBlock.setAttribute('data-text', jsTextInput.value)

    jsTextBlock.innerHTML = jsTextBlock.getAttribute('data-text')

    if ((jsTextInput.value).length === 0) {
      jsTextBlock.innerHTML = 'Empty'
    }
  })
  
})()