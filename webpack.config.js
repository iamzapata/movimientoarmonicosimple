const path = require("path");

module.exports = {
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src/"),
      styles: path.resolve(__dirname, "src/styles/"),
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.html$/,
        loader: "raw-loader",
      },
    ],
  },
};
