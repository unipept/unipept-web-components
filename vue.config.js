module.exports = {
    css: {
        extract: true
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
