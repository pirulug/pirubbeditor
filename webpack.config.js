const path = require("path");
const { BannerPlugin } = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: { pirubbeditor: "./src/js/PiruBbEditor.js" },
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/dist/",
    clean: true,
    library: {
      name: "PiruBbEditor",
      type: "umd",
      export: "default",
    },
    globalObject: "this",
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname),
    },
    open: ["/test/index.html"],
    port: 8080,
    hot: true,
    watchFiles: ["src/**/*", "test/**/*"],
    devMiddleware: {
      publicPath: "/dist/",
    },
  },
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
            preamble: `/*! 
    * PiruBbEditor (https://github.com/pirulug)
    * Copyright 2024-2026 Pirulug (https://github.com/pirulug)
    * Licensed under MIT
    */`,
          },
        },
        extractComments: false,
      }),
    ],
  },
  plugins: [
    new BannerPlugin({
      banner: `/*!
  * PiruBbEditor (https://github.com/pirulug)
  * Copyright 2024-2026 Pirulug (https://github.com/pirulug)
  * Licensed under MIT
  */`,
      raw: true,
      entryOnly: false,
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.svg$/,
        type: "asset/source",
      },
    ],
  },
};
