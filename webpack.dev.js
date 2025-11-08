const path = require("path");
const common = require("./webpack.common.js");
const { merge } = require("webpack-merge");

module.exports = merge(common, {
  mode: "development",
  devServer: {
    port: 3000,
    open: true,
    hot: false, // matikan HMR — pakai liveReload
    liveReload: true,
    client: {
      webSocketURL: {
        hostname: "localhost",
        port: 3000,
        protocol: "ws",
      },
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
});
