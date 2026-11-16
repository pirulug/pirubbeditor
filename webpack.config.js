import path from "node:path";
import { fileURLToPath } from "node:url";
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserPlugin from "terser-webpack-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { BannerPlugin } = webpack;

const BANNER_TEXT = `/*!
 * PiruBbEditor (https://github.com/pirulug)
 * Copyright 2024-2026 Pirulug (https://github.com/pirulug)
 * Licensed under MIT
 */`;

const sharedModuleRules = [
  {
    test: /\.scss$/,
    use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
  },
  {
    test: /\.svg$/,
    type: "asset/source",
  },
];

const createOptimizer = (isModule = false) => ({
  minimize: true,
  minimizer: [
    new TerserPlugin({
      terserOptions: {
        ecma: 2022,
        module: isModule,
        format: {
          comments: false,
          preamble: BANNER_TEXT,
        },
      },
      extractComments: false,
    }),
  ],
});

const umdConfig = {
  name: "umd",
  entry: { pirubbeditor: "./src/js/PiruBbEditor.js" },
  target: ["web", "es2022"],
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
    globalObject: "globalThis",
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
  optimization: createOptimizer(false),
  plugins: [
    new BannerPlugin({
      banner: BANNER_TEXT,
      raw: true,
      entryOnly: false,
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
  ],
  module: {
    rules: sharedModuleRules,
  },
};

const esmConfig = {
  name: "esm",
  entry: { pirubbeditor: "./src/js/PiruBbEditor.js" },
  target: ["web", "es2022"],
  experiments: {
    outputModule: true,
  },
  output: {
    filename: "js/[name].mjs",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/dist/",
    clean: false,
    module: true,
    library: {
      type: "module",
    },
  },
  mode: "production",
  optimization: createOptimizer(true),
  plugins: [
    new BannerPlugin({
      banner: BANNER_TEXT,
      raw: true,
      entryOnly: false,
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
  ],
  module: {
    rules: sharedModuleRules,
  },
};

export default [umdConfig, esmConfig];
