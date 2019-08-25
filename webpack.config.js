const path = require('path');
const src = path.join(__dirname, '/client/src');
const dist = path.join(__dirname, 'client/dist');

module.exports = {
  entry: `${src}/canvas.jsx`,
  output: {
    filename: 'bundle.js',
    path: dist
  },
  module : {
    rules : [
      {
        test : /\.jsx?/,
        include : src,
        use: {
            loader : 'babel-loader',
            query: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};