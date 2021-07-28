const plugins = [
  require('tailwindcss/nesting'),
  require(`tailwindcss`)(`./tailwind.config.js`),
  require(`autoprefixer`),
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(require('cssnano')({ preset: 'default' }))
}

module.exports = {
  plugins,
}
