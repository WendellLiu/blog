const access = require('fs/promises').access
const constants = require('fs').constants
const sharp = require('sharp')

const widths = [1920, 1280, 640, 320]

const extensionMap = {
  jpeg: 'jpg',
  webp: 'webp',
  avif: 'avif',
}

const qualityMap = {
  avif: 40,
  default: 60,
}

module.exports = async function srcset(filename, format) {
  const nameInfoList = await Promise.all(widths.map(width => resize(filename, width, format)))
  return {
    srcset: nameInfoList.map(({ name, width }) => `${name} ${width}w`).join(', '),
    fallback: nameInfoList[0].name,
  }
}

async function resize(filename, width, format) {
  const out = sizedName(filename, width, format)

  try {
    await access('_site' + out)
  } catch {
    try {
      await sharp('_site' + filename)
        .resize(width)
        [format]({
          quality: qualityMap[format] || qualityMap.default,
          reductionEffort: 6,
        })
        .toFile('_site' + out)
    } catch (e) {
      console.error('error: ', e)
      console.error({
        filename,
        width,
        format,
      })
      throw e
    }
  }
  return {
    width,
    name: out,
  }
}

function sizedName(filename, width, format) {
  const ext = extensionMap[format]
  if (!ext) {
    throw new Error(`Unknown format ${format}`)
  }
  return filename.replace(/\.\w+$/, _ => '-' + width + 'w' + '.' + ext)
}
