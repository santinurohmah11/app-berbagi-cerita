const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  entry: {
    app: path.resolve(__dirname, "src/scripts/index.js"),
  },

  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
        generator: {
          filename: "images/[name][ext]",
        },
      },
    ],
  },

  plugins: [
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, "src/index.html"),
    filename: "index.html",
    title: "Berbagi Cerita",
    favicon: path.resolve(__dirname, "src/public/images/favicon.png"),
  }),

  new CopyWebpackPlugin({
    patterns: [
      { from: path.resolve(__dirname, "src/public"), to: path.resolve(__dirname, "dist/public") },
      { from: path.resolve(__dirname, "src/styles"), to: path.resolve(__dirname, "dist/styles") },
      { from: path.resolve(__dirname, "src/manifest.json"), to: path.resolve(__dirname, "dist/manifest.json") },
      // ✅ file service worker di root project, bukan di src
      { from: path.resolve(__dirname, "./src/service-worker.js"), to: path.resolve(__dirname, "dist") },
    ],
  }),

  new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
  }),
],
}