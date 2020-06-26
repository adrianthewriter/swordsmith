const path = require('path')
const pkg = require(path.resolve(process.cwd(), 'package.json'))
const { when, whenDev, whenProd, whenTest } = require('@craco/craco')
const CracoAlias = require('craco-alias')

const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const {
  getLocalIdent,
  DisableWebpackOutputPlugin,
  PostrenderHtmlPlugin,
  RenderScriptsPlugin,
} = require('../toolbox')

const swordsmithPath = path.resolve(
  process.cwd(),
  'node_modules/@adrianthewriter/swordsmith'
)

module.exports = {
  style: {
    css: {
      loaderOptions: {
        modules: {
          getLocalIdent: getLocalIdent,
        },
      },
    },
    postcss: {
      plugins: [
        require('postcss-prefix-selector')({
          prefix: '.root',
          exclude: ['.root'],
          transform: (prefix, selector, prefixedSelector) => {
            // console.log(selector)
            if (selector.includes('.root')) {
              return selector
            } else if (selector === '*') {
              return selector
            } else if (selector.includes('.charsheet')) {
              return selector
            } else {
              return prefixedSelector
            }
          },
        }),
      ],
      env: {
        stage: 3,
        features: {
          'nesting-rules': true,
        },
      },
    },
  },
  webpack: {
    plugins: [
      new DisableWebpackOutputPlugin(),
      new PostrenderHtmlPlugin(),
      new RenderScriptsPlugin(),
    ],
    configure: (webpackConfig, { env, paths }) => {
      // Change the CRA paths first
      paths.appHtml =
        env === 'production'
          ? `${swordsmithPath}/lib/templates/index.prod.html`
          : `${swordsmithPath}/lib/templates/index.dev.html`
      paths.appPublic = 'src/assets'

      // Set output path
      webpackConfig.output.path = path.resolve(process.cwd(), paths.appBuild)

      // Disable dev tooling in production to prevent source maps
      if (env === 'production') delete webpackConfig.devtool

      // Remove problematic plugins
      webpackConfig.plugins = webpackConfig.plugins.filter(function (plugin) {
        return (
          // plugin.constructor.name !== 'MiniCssExtractPlugin' && // this may not be needed...
          plugin.constructor.name !== 'HtmlWebpackPlugin' &&
          plugin.constructor.name !== 'ManifestPlugin' &&
          plugin.constructor.name !== 'GenerateSW'
        )
      })

      // Tell webpack to also resolve loaders from swordsmith
      webpackConfig.resolveLoader.modules = [
        'node_modules',
        `${swordsmithPath}/node_modules`,
      ]

      // Reaply HtmlWebpackPlugin and MiniCssExtractPlugin
      webpackConfig.plugins.push(
        ...whenProd(
          () => [
            new HtmlWebpackPlugin({
              inject: false,
              filename: `${pkg.name}.html`,
              template: `!!prerender-loader?string!${swordsmithPath}/lib/templates/index.prod.html`,
              excludeChunks: ['templates'],
            }),
            new MiniCssExtractPlugin({
              filename: `${pkg.name}.css`,
            }),
          ],
          []
        ),
        ...whenDev(
          () => [
            new HtmlWebpackPlugin({
              inject: true,
              template: `${swordsmithPath}/lib/templates/index.dev.html`,
            }),
          ],
          []
        )
      )

      webpackConfig.optimization = {
        minimizer: [new OptimizeCssAssetsPlugin({})],
        splitChunks: {
          cacheGroups: {
            // Configure to output CSS as a single file
            styles: {
              name: false,
              test: /\.css$/,
              chunks: 'all',
              enforce: false,
            },
          },
        },
      }

      // Return the config object.
      return webpackConfig
    },
  },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        baseUrl: './src',
        source: 'jsconfig',
      },
    },
  ],
}

function filterByEntryPoint(entry) {
  return function (module, chunks) {
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      if (chunk.groupsIterable) {
        for (const group of chunk.groupsIterable) {
          if (group.getParents()[0] && group.getParents()[0].name === entry) {
            return true
          }
        }
      }
    }
    return false
  }
}
