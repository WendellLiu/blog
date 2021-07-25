const { JSDOM } = require('jsdom')
const path = require('path')
const sizeOf = require('image-size')

const retrieveSrcset = require('./retrieveSrcset')

const SITE_PATH = './_site/'
const IGNORE_IMG_TYPE = ['svg', 'gif']

const checkIsExternalURL = srcPath => /^(https?\:\/\/|\/\/)/i.test(srcPath)
const checkIsRelativeURL = srcPath => /^\.+\//.test(src)

const processImage = async (img, outputPath) => {
  let src = img.getAttribute('src')

  if (checkIsExternalURL(src)) {
    return
  }

  if (checkIsRelativeURL) {
    src = '/' + path.relative(SITE_PATH, path.resolve(path.dirname(outputPath), src))
    if (path.sep == '\\') {
      src = src.replace(/\\/g, '/')
    }
  }

  const dimensions = sizeOf('_site/' + src)

  if (IGNORE_IMG_TYPE.includes(dimensions.type)) return

  if (!img.getAttribute('width')) {
    img.setAttribute('width', dimensions.width)
    img.setAttribute('height', dimensions.height)
  }

  if (img.tagName === 'IMG') {
    img.setAttribute('decoding', 'async')
    img.setAttribute('loading', 'lazy')

    // TODO: blurry placeholder
    //img.setAttribute('style', `background-size:cover;` + `background-image:url("${await blurryPlaceholder(src)}")`)

    const doc = img.ownerDocument
    const picture = doc.createElement('picture')

    const avif = doc.createElement('source')
    const webp = doc.createElement('source')
    const jpeg = doc.createElement('source')

    const fallbackList = await Promise.all(
      [
        ['avif', avif],
        ['webp', webp],
        ['jpeg', jpeg],
      ].map(([format, imgElement]) => setImgElement(imgElement, src, format))
    )
    const fallback = fallbackList.find(o => o.format === 'jpeg').fallback

    picture.appendChild(avif)
    picture.appendChild(webp)
    picture.appendChild(jpeg)

    img.parentElement.replaceChild(picture, img)
    img.setAttribute('src', fallback)
    img.classList.add('h-auto', 'max-w-full')
    picture.appendChild(img)
  }
}

async function setImgElement(imgElement, src, format) {
  const setInfo = await retrieveSrcset(src, format)
  imgElement.setAttribute('srcset', setInfo.srcset)
  imgElement.setAttribute(
    'sizes',
    imgElement.getAttribute('align') ? '(max-width: 608px) 50vw, 187px' : '(max-width: 608px) 100vw, 608px'
  )
  imgElement.setAttribute('type', `image/${format}`)
  return { format, fallback: setInfo.fallback }
}

const internalImages = async (rawContent, outputPath) => {
  let content = rawContent

  if (!outputPath || !outputPath.endsWith('.html')) {
    return content
  }

  const dom = new JSDOM(content)
  const images = [...dom.window.document.querySelectorAll('img')]

  if (images.length > 0) {
    await Promise.all(images.map(i => processImage(i, outputPath)))
    content = dom.serialize()
  }

  return content
}

module.exports = {
  initArguments: {},
  configFunction: async (eleventyConfig, pluginOptions = {}) => {
    eleventyConfig.addTransform('internalImg', internalImages)
  },
}
