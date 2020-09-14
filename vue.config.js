const webpack = require("webpack");
const ThreadsPlugin = require("threads-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    css: {
        extract: false,
        // loaderOptions: {
        //     scss: {
        //         additionalData: `@import "@/styles/index.scss";`
        //     }
        // }
    },
    transpileDependencies: ["vuetify"],
    // Disable minifier to get rid of Vue warnings associated with use of reserved keywords
    chainWebpack: (config) => {
        config.optimization.minimize(false);
    },
    configureWebpack: {
        plugins: [
            // Ignore all electron related things, as these are only required for the desktop application.
            new webpack.IgnorePlugin({
                resourceRegExp: /^(electron|fs)/,
                contextRegExp: /.*/
            }),
            new ThreadsPlugin()
        ],
        output: {
            globalObject: "this"
        },
        externals: {
            vuex: "vuex",
            vue: "vue"
        }
    }
};
