<template>
    <div class="panel-container" v-show="isStart">
        <div class="preparation-phase" v-show="!isAction">
            <div class="btn" @click="rotate">Rotate</div>
            <div class="btn" @click="getReady">Ready</div>
        </div>
        <div class="action-phase" v-show="isAction">
            <div class="score-board">
                <span class="round-num">Game start！！！Round: {{ roundNum }}</span>
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
import bus from "./bus";
export default {
    name: "control",
    data: function() {
        return {
            roundNum: 0,
            isAction: false,
            isStart: false,
            socket: null,
            host : null,
            port : null
        };
    },
    created: function() {
        bus.$on("start", username => {
            this.isStart = true;
            this.socket.on('message', this.messageHandler);
        })
    },
    methods: {
        getReady: function(event) {
            console.log("Get Ready!!!");
            this.isAction = true;
            bus.$emit("ready", this.isAction);
        },
        initSocket: function(socket, host, port) {
            this.socket = socket;
            this.host = host;
            this.port = port;
        },
        rotate: function() {
            bus.$emit("rotate");
        },
        messageHandler: function(message, remote) {

        }
    }
};
</script>
