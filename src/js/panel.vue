<template>
  <div class="panel-container">
    <div class="preparation-phase" v-if="!isAction">
      <button ref="rotateBtn" class="rotate-btn">Rotate</button>
      <button class="ready-btn" @click="getReady">Ready</button>
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
      isAction : false,
      dgram : null,
      socket : null
    };
  },
  methods: {
    getReady : function(event) {
      console.log("Get Ready!!!");
    },
    initSocket : function() {
      this.dgram = require('dgram');
      this.socket = this.dgram.createSocket('udp4');
      
    }
  }
};
</script>

<style scoped>

</style>
