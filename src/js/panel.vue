<template>
  <div class="panel-container">
    <div class="preparation-phase" v-if="!isAction">
      <button class="rotate-btn">Rotate</button>
      <button class="ready-btn">Ready</button>
    </div>
    <div class="action-phase" v-else>
      <div class="score-board">
        <span class="round-num">回合数：{{roundNum}}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "panel",
  data: function() {
    return {
      roundNum : 0,
      isAction : false
    };
  },
  methods: {
    rotatePlane : function() {

    },
    getReady : function() {
      
    }
  }
};
</script>

<style scoped>

</style>
