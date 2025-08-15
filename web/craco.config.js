const CracoLessPlugin = require("craco-less");
const path = require("path");
const baseURL = "http://112.28.49.224:31126"; // "http://localhost:8000"

module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: baseURL,
        changeOrigin: true,
      },
      "/swagger": {
        target: baseURL,
        changeOrigin: true,
      },
      "/files": {
        target: baseURL,
        changeOrigin: true,
      },
      "/.well-known/openid-configuration": {
        target: baseURL,
        changeOrigin: true,
      },
      "/cas/serviceValidate": {
        target: baseURL,
        changeOrigin: true,
      },
      "/cas/proxyValidate": {
        target: baseURL,
        changeOrigin: true,
      },
      "/cas/proxy": {
        target: baseURL,
        changeOrigin: true,
      },
      "/cas/validate": {
        target: baseURL,
        changeOrigin: true,
      },
      "/scim": {
        target: baseURL,
        changeOrigin: true,
      }
    },
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {"@primary-color": "rgb(89,54,213)", "@border-radius-base": "5px"},
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      paths.appBuild = path.resolve(__dirname, "build-temp");
      webpackConfig.output.path = path.resolve(__dirname, "build-temp");

      // ignore webpack warnings by source-map-loader
      // https://github.com/facebook/create-react-app/pull/11752#issuecomment-1345231546
      webpackConfig.ignoreWarnings = [
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource.includes("node_modules") &&
            warning.details &&
            warning.details.includes("source-map-loader")
          );
        },
      ];

      // use polyfill Buffer with Webpack 5
      // https://viglucci.io/articles/how-to-polyfill-buffer-with-webpack-5
      // https://craco.js.org/docs/configuration/webpack/
      webpackConfig.resolve.fallback = {
        buffer: require.resolve("buffer/"),
        process: false,
        util: false,
        url: false,
        zlib: false,
        stream: false,
        http: false,
        https: false,
        assert: false,
        crypto: false,
        os: false,
        fs: false,
      };

      return webpackConfig;
    },
  },
};
