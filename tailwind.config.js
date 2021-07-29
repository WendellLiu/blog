const isProduction = process.env.NODE_ENV === 'production'

const config = {
  variants: {},
  plugins: [],
  theme: {
    extend: {
      colors: {
        main: {
          DEFAULT: '#5DAC81',
        },
        cwhite: {
          DEFAULT: '#FFFFFB',
        },
        second: {
          DEFAULT: '#A0674B',
        },
        highlight: {
          DEFAULT: '#D5E5F2',
        },
      },
    },
  },
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
