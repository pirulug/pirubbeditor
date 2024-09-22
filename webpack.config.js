const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { BannerPlugin } = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: { pirubbeditor: "./src/js/PiruBbEditor.js" },
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "dist"),
    // library: "PirubbEditor",
    // libraryTarget: "umd",
    // globalObject: "this",
  },
  // mode: "development",
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false, // Elimina otros comentarios
            preamble: `/*! 
    * PiruBbEditor (https://github.com/pirulug)
    * Copyright 2024 Pirulug (https://github.com/pirulug)
    * Licensed under MIT
    */`,
          },
        },
        extractComments: false,
      }),
    ],
  },
  plugins: [
    // DELETE
    new CleanWebpackPlugin(),

    // Banner
    new BannerPlugin({
      banner: `/*!
  * PiruBbEditor (https://github.com/pirulug)
  * Copyright 2024 Pirulug (https://github.com/pirulug)
  * Licensed under MIT
  */`,
      raw: true,
      entryOnly: false,
    }),

    // CSS
    new MiniCssExtractPlugin({
      filename: "css/[name].css", // Nombre del archivo CSS
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader, //asd
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.svg$/,
        use: "svg-inline-loader",
      },
    ],
  },
};
