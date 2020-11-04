module.exports = {
    "verbose": true,
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "vue",
    ],
    "transform": {
        ".*\\.(vue)$": "vue-jest",
        "^.+\\.tsx?$": "ts-jest"
    },
    "testURL": "http://localhost/",
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    "moduleNameMapper": {
        "^@/(.*)$": "<rootDir>/src/$1",
        "threads": "<rootDir>/src/test/mocks/MockThreads",
        "^worker-loader!./Pept2Data.worker.js$": "<rootDir>/src/test/MockPeptideContainerProcessor",
        "html-to-image-no-fonts": "<rootDir>/src/test/mocks/HtmlToImage",
    },
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": [
        "./src/test/init.js",
    ],
    "collectCoverageFrom": [
        "src/business/**/*.{ts,vue}",
        "src/components/**/*.{ts,vue}",
        ",!/node_modules/",
    ],
    "transformIgnorePatterns": ["node_modules/(?!@babel/.*)"]
};
