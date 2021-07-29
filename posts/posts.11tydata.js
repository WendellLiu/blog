const WORK_COUNT_LIMITATION = 200

module.exports = {
  eleventyComputed: {
    description: getCustomDescription,
  },
}

function getCustomDescription(data) {
  const customDescription = data.description || data.page.excerpt || data.title
  if (!customDescription) return ''

  return customDescription.slice(0, WORK_COUNT_LIMITATION)
}
