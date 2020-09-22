const path = require('path');
const globImporter = require('node-sass-glob-importer');
const glob = require('glob');

module.exports = (env) => {
  const isDevelopment = env === 'development';

  const config = {
    entry: './src/module/quest',
    mode: env,
    devtool: 'inline-source-map',
    stats: 'minimal',
    output: {
      path: path.resolve(__dirname, 'dist/module'),
      filename: 'quest.js'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
      rules: [
        {
          test: /\.[tj]s$/,
          exclude: /node_modules/,
          use: ['ts-loader', 'source-map-loader']
        },
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                sourceMap: isDevelopment,
                url: false
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: isDevelopment,
                sassOptions: {
                  importer: globImporter()
                }
              }
            }
          ]
        }
      ]
    }
  };

  return config;
};
