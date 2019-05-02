<template>
  <h2>Hello from {{ text }}</h2>
</template>

<script>
export default {
  name: "test",
  data() {
    return {
      text: "Electron Forge with Vue.js!!!"
    };
  }
};
</script>
