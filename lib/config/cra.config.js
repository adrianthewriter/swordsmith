const fs = require('fs')
const path = require('path')
const pkg = require(path.resolve(process.cwd(), 'package.json'))
const { when, whenDev, whenProd, whenTest } = require('@craco/craco')
const CracoAlias = require('craco-alias')

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
        import: false, // Keeps quotes around @import url("...")
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
            if (selector === ':root') {
              return '.root'
            } else if (selector === '.root') {
              return selector
            } else if (selector.includes('.root')) {
              return `.charsheet ${selector}`
            } else {
              return prefixedSelector
            }
          },
        }),
        require('cssnano')({
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
              minifyFontValues: { removeQuotes: false },
            },
          ],
        }),
      ],
      env: {
        stage: 3,
        features: {
          'nesting-rules': true,
        },
        // preserve: false,
        // importFrom: path.resolve(process.cwd(), 'src/vars.css'),
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

      // Create an alias for 'swordsmith' package
      webpackConfig.resolve.alias.swordsmith = path.resolve(
        process.cwd(),
        'node_modules/@adrianthewriter/swordsmith/'
      )

      // Disable dev tooling in production to prevent source maps
      if (env === 'production') delete webpackConfig.devtool

      // Remove problematic plugins
      webpackConfig.plugins = webpackConfig.plugins.filter(function (plugin) {
        return (
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
              minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: false,
              },
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

      webpackConfig.module.rules.push({
        test: /\.jsx?$/,
        include: [
          path.join(swordsmithPath, 'lib/components'),
          path.join(process.cwd(), 'src'),
        ],
        // exclude: /node_modules/, //! Breaks
        use: {
          loader: 'babel-loader',
          options: {
            sourceType: 'unambiguous',
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      })

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
