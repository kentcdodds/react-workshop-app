const {addAfterLoader, loaderByName} = require('@craco/craco')

module.exports = {
  webpack: {
    configure: webpackConfig => {
      addAfterLoader(webpackConfig, loaderByName('babel-loader'), {
        test: /\.(md|mdx)$/,
        loader: require.resolve('@mdx-js/loader'),
        options: {
          rehypePlugins: [require('@mapbox/rehype-prism')],
        },
      })

      return webpackConfig
    },
  },
}
