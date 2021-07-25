const isProduction = process.env.NODE_ENV === 'production'

const config = {
  variants: {},
  plugins: [],
}

if (isProduction) {
  Object.assign(config, {
    purge: {
      enabled: true,
      content: ['_site/**/*.html'],
    },
  })
}

module.exports = config
