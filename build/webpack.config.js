const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const config = require('./config');

const inProduction = process.env.NODE_ENV === 'production';
const styleHash = inProduction ? '.[contenthash]' : '';
const scriptHash = inProduction ? '.[chunkhash]' : '';

// LOADER HELPERS
const extractCss = {
  loader: MiniCssExtractPlugin.loader,
  options: {
    publicPath: `${config.assetsPath}static/css/`,
  },
};

const cssLoader = {
  loader: 'css-loader',
  options: {
    importLoaders: 1,
    sourceMap: true,
  },
};

const images = [
  {
    loader: 'file-loader',
    options: {
      name: '[name].[ext]',
      outputPath: 'images/',
      publicPath: `${config.assetsPath}static/images/`,
    },
  },
];

if (inProduction) {
  images.push('image-webpack-loader');
}

module.exports = {
  entry: {
    scripts: './resources/assets/js/main.js',
    styles: './resources/assets/sass/main.sass',
    login: './resources/assets/sass/login.sass',
    admin: './resources/assets/sass/admin.sass',
    vendor: ['jquery', 'vue'],
  },
  output: {
    path: path.resolve(__dirname, '../static/'),
    filename: `js/[name]${scriptHash}.js`,
  },

  watchOptions: {
    ignored: /node_modules/,
  },

  devtool: false,

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', extractCss, cssLoader, 'postcss-loader'],
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          'vue-style-loader',
          extractCss,
          cssLoader,
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: [
                path.resolve(__dirname, '../resources/assets/sass'),
              ],
              data: '@import "shared-with-vue";',
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.sass$/,
        exclude: /node_modules/,
        use: [
          'vue-style-loader',
          extractCss,
          cssLoader,
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              indentedSyntax: true,
              includePaths: [
                path.resolve(__dirname, '../resources/assets/sass'),
              ],
              data: '@import "shared-with-vue";',
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: images,
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name].[hash:7].[ext]',
          outputPath: 'fonts/',
          publicPath: `${config.assetsPath}static/fonts/`,
        },
      },
    ],
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'all',
          name: 'vendor',
          test: 'vendor',
          enforce: true,
        },
      },
    },
  },

  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      images: path.join(__dirname, '../resources/assets/images'),
    },
    extensions: ['*', '.js', '.vue', '.json'],
  },

  plugins: [
    new VueLoaderPlugin(),

    new CleanWebpackPlugin(['static'], {
      root: path.join(__dirname, '../'),
      watch: false,
    }),

    new FixStyleOnlyEntriesPlugin({ extensions: ['less', 'scss', 'css', 'sass'] }),

    new MiniCssExtractPlugin({
      filename: `css/[name]${styleHash}.css`,
    }),

    new ManifestPlugin(),


    new BrowserSyncPlugin({
      host: 'localhost',
      port: 3000,
      proxy: config.devUrl, // YOUR DEV-SERVER URL
      files: ['./*.php', './resources/views/**/*.twig', './static/css/*.*', './static/js/*.*'],
    },
    {
      reload: false,
      injectCss: true,
    }),
  ],
};

if (!inProduction) {
  module.exports.plugins.push(
    new webpack.SourceMapDevToolPlugin({}),
  );
}

if (inProduction) {
  module.exports.plugins.push(
    new PurgecssPlugin({
      paths: () => glob.sync(path.join(__dirname, '../resources/**/*'), { nodir: true }),
      only: ['styles', 'scripts'],
      whitelist: config.whitelist,
    }),
  );
}
