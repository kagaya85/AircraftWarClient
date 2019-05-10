<template>
    <div class="panel-container" v-show="isStart">
        <div class="preparation-phase" v-show="!isAction">
            <div class="btn" @click="rotate_btn">Rotate</div>
            <div class="btn" @click="ready_btn">Ready</div>
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
            isLocate: false,    // 是否为确认飞机的状态
            status: STATUS.READY,
            planes: null,
            // udp 相关
            host: null,
            port: null,
            socket: null,
            reSendFlag: true,   // 重发控制
            reqBuf: null,  // 发送buf
            reSendCount: 0  // 重发计数
        };
    },
    created: function() {
        bus.$on("start", (username, roomId) => {
            this.isStart = true;
            this.socket.on('message', this.messageHandler); // 开始监听消息
            this.sendRequest(); // 该函数重复调用自己，发送reqBuf
        })
        bus.$on('click', this.getClick);
        bus.$on('plane-pos', (planes) => {
            this.planes = planes;
        });
    },
    methods: {
        ready_btn: function(event) {
            console.log("Get Ready!!!");
            this.isAction = true;
            bus.$emit("ready"); // 获取一下飞机位置
        },
        initSocket: function(socket, host, port) {
            this.socket = socket;
            this.host = host;
            this.port = port;
        },
        rotate_btn: function() {
            bus.$emit("rotate");
        },
        messageHandler: function(message, remote) {
            console.log(new Date().toLocaleString() + " Message received: " + message[0] + message[1]);
            if (message[0] != this.status || this.isLoading == false)  {
                // 不是本阶段的包全部忽略 或 未请求
                return;
            }
            switch(message[1]) {
                // ready
                case EVT_TYPE.OPPONENT_STA:  // 对手状态
                    break;
                case EVT_TYPE.READY:    // 准备开始，发送飞机位置
                    break;
                case EVT_TYPE.START:    // 正式开始
                    break;
                // battle
                case EVT_TYPE.CLICK:    // 点击结果
                    break;
                case EVT_TYPE.LOCATE:   // 定位飞机结果
                    break;
                case EVT_TYPE.OPCLICK:  // 对手点击
                    break;
                case EVT_TYPE.LOCATE:   // 对手定位飞机
                    break;
                // special
                case EVT_TYPE.OPLEAVE:  // 对手离开，退出房间
                    break;
                case EVT_TYPE.WAIT:     // ACK
                    break;
            }

            // 已处理完请求
            this.isLoading = false;
            this.reqBuf = null;
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
                this.reSendCount++;
                wait(1000).then(() => {
                    this.sendRequest();
                });
            }
            else
                this.reSendCount = 0;   // 计数器置零
        },
        getClick: function(x, y) {
            bus.$emit('fill', x, y, 'body');
        }

    }
};
</script>
