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
    margin-top: 50px;
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
            reSendCount: 0,   // 重发计数
            host: null,
            port: null,
            // udp 相关
            reSendFlag: true,   // 重发控制
            reqBuf: null  // 发送buf
        };
    },
    created: function() {
        bus.$on("start", (username, roomId) => {
            this.isStart = true;
            this.socket.on('message', this.messageHandler); // 开始监听消息
            this.sendRequest(); // 该函数重复调用自己，发送reqBuf
        })
    },
    methods: {
        getReady: function(event) {
            console.log("Get Ready!!!");
            this.isAction = true;
            bus.$emit("ready", this.isAction);
            this.socket.on("message", this.messageHandler);
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
            
        },
        sendRequest: function() {
            // 调用一次后就会循环调用，发送this.reqBuf里的东西
            if (this.reqBuf) {
                // reqBuf 不空，则调用send函数
                this.socket.send(this.reqBuf, this.port, this.host, error => {
                    if (error) {
                        console.log("error" + error);
                    } else {
                        // no error
                        console.log(
                            new Date().toLocaleString() +
                                " Message send to " +
                                this.host +
                                ":" +
                                this.port +
                                "STA: " +
                                buf[0].toString() +
                                "REQ: " +
                                buf[1].toString()
                        );
                    }   // no error end
                }); // send end
            }

            // 设置计时器
            if(this.reSendFlag){
                wait(1000).then(() => {
                    this.sendRequest();
                });
            }
        },

    }
};
</script>
