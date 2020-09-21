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
        plugins: [],
        output: {
            globalObject: "this"
        },
        externals: {
            vuex: "vuex",
            vue: "vue"
        }
    }
};
