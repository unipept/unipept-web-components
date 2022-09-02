import Example from "./Example.vue";

export default {
  component: Example,
};

export const Primary = () => ({
  components: {
    Example,
  },
  template: `<example color="primary" />`,
});

export const Secondary = () => ({
  components: {
    Example,
  },
  template: `<example color="secondary" />`,
});