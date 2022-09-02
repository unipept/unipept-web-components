module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  core: {
    builder: "webpack5",
  },
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-links"
  ]
}