// Plugins
import vue from "@vitejs/plugin-vue"
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify"

// Utilities
import { defineConfig } from "vite"
import { resolve } from "path";
import { fileURLToPath, URL } from "node:url"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue({
            template: { transformAssetUrls }
        }),
        // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
        vuetify({
            autoImport: true,
        }),
    ],
    define: { "process.env": {} },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url))
        },
        extensions: [
            ".js",
            ".json",
            ".jsx",
            ".mjs",
            ".ts",
            ".tsx",
            ".vue",
        ],
    },
    server: {
        port: 3000,
    },
    build: {
        lib: {
            // src/indext.ts is where we have exported the component(s)
            entry: resolve(__dirname, "src/index.ts"),
            name: "unipept-web-components",
            // the name of the output files when the build is run
            fileName: "unipept-web-components",
        },
        rollupOptions: {
            // make sure to externalize deps that shouldn't be bundled
            // into your library
            external: ["vue"],
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    vue: "Vue",
                },
            },
        },
    }
});
