<template>
  <div class="panel-container">
    <div class="preparation-phase" v-if="!isAction">
      <button class="rotate-btn" @click="rotate">Rotate</button>
      <button class="ready-btn" @click="getReady">Ready</button>
    </div>
    <div class="action-phase" v-else>
      <div class="score-board">
        <span class="round-num">战斗开始！！！回合数：{{roundNum}}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-container {
  text-align: center;
  clear: both;
}
</style>


<script>
import bus from './bus';
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
      this.isAction = true;
      bus.$emit('ready', this.isAction);
    },
    initSocket : function() {
      this.dgram = require('dgram');
      this.socket = this.dgram.createSocket('udp4');
      
    },
    rotate : function() {
      bus.$emit('rotate');
    }
  }
};
</script>
