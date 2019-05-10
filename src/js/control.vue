<template>
    <div class="panel-container" v-show="showPanel">
        <div class="preparation-phase" v-show="!isBattle">
            <div v-show="isEnemyReady">Your opponent is ready</div>
            <div class="btn" @click="rotate_btn">Rotate</div>
            <div :class="[btn, isReady ? 'selected' : null]" @click="ready_btn">Ready</div>
        </div>
        <div class="action-phase" v-show="isBattle">
            <div class="score-board">
                <span class="round-num">Game start！！！{{ isUserTurn ? 'Your turn' : 'Not your turn'}}</span>
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

const ipcRenderer = require('electron').ipcRenderer;

export default {
    name: "control",
    data: function() {
        return {
            isBattle: false,    // 是否在对战状态
            showPanel: false,
            isReady: false,     // 是否在准备状态，准备按钮被按下
            isEnemyReady: false,     // 对手是否在准备状态            
            isUserTurn: null,   // 回合标志
            status: STATUS.READY,   // 当前状态
            request: REQ_TYPE.WAIT, // 空包
            planes: [],   // 保存飞机位置
            isLocate: false,    // 是否为确认飞机的状态
            locateClickCount: 0,    // 定位飞机时点击坐标个数
            clickPos: {x: null, y: null},     // 当前用户点击的坐标
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
            this.showPanel = true;
            this.socket.on('message', this.messageHandler); // 开始监听消息
            this.sendUserStatus();
            this.sendRequest(); // 该函数重复调用自己，发送reqBuf
        })
        bus.$on('click', this.userClick);
        bus.$on('plane-pos', this.addPlane);
    },
    methods: {
        ready_btn: function(event) {
            if(!this.planes[0] || !this.planes[0] || !this.planes[0] ) {
                // 有飞机未摆放正确
                // 弹个窗
                ipcRenderer.send('open-plane-error-dialog', user);
                return;
            }
            console.log("Get Ready!!!");
            this.isReady = !this.isReady;
            if(this.isReady)
                bus.$emit('ready');
            else
                bus.$emit('unready');

            this.sendUserStatus();  // 发送一下新的状态
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
                    this.isEnemyReady = message[2];
                    break;
                case EVT_TYPE.READY:    // 准备开始，发送飞机位置
                    this.sendPlanePos();
                    break;
                case EVT_TYPE.START:    // 正式开始
                    // 决定先手后手
                    this.isUserTurn = message[2];
                    if(this.isUserTurn)
                        bus.$emit("show-user");    // 显示用户棋盘                    
                    else
                        bus.$emit("show-enemy");    // 显示对手棋盘
                    this.isBattle = true;
                    break;
                // battle
                case EVT_TYPE.CLICK:    // 点击结果
                    // 显示结果
                    if(message[2] == 1)
                        bus.$emit('fill', this.clickPos.x, this.clickPos.y, 'none');
                    else if(message[2] == 2)
                        bus.$emit('fill', this.clickPos.x, this.clickPos.y, 'body');
                    else if(message[2] == 3)
                        bus.$emit('fill', this.clickPos.x, this.clickPos.y, 'head');
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
            // this.reqBuf = null;
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
        // 处理用户的单击敌方地图
        userClick: function(x, y) {
            bus.$emit('fill', x, y, 'clicked');
            if(!this.isLocate) {
                this.clickPos.x = x;
                this.clickPos.y = y;
                // 发包
                var buf = new Buffer.alloc(2 + 2);
                buf[0] = STATUS.BATTLE;
                buf[1] = REQ_TYPE.CLICK;
                buf[2] = x;
                buf[3] = y;
                this.reqBuf = buf;
                this.isUserTurn = false;
            } else {
                this.locateClickCount++
                if(this.locateClickCount == 1) {
                    this.clickPos.x = x;
                    this.clickPos.y = y;
                }
                else if(this.locateClickCount == 2) {
                    // 发包
                    var buf = new Buffer.alloc(2 + 4);
                    buf[0] = STATUS.BATTLE;
                    buf[1] = REQ_TYPE.CLICK;
                    buf[2] = this.clickPos.x;
                    buf[3] = this.clickPos.y;
                    buf[4] = x;
                    buf[5] = y;
                    this.reqBuf = buf;
                    this.locateClickCount = 0;
                    this.isUserTurn = false;
                }
            }
        },
        addPlane: function(plane){
            // 收到一架飞机的位置时更新飞机数组
            if(plane[1])
                this.planes[plane[0]] = [plane[1], plane[2], plane[3]]; // 后面三项作为飞机信息放入planes数组中
            else
                this.planes[plane[0]] = null; // 不合法飞机清空

        },
        sendPlanePos: function() {
            var buf = new Buffer.alloc(2 + 12);
            this.status = STATUS.READY;
            this.request = REQ_TYPE.SEND_POS;
            buf[0] = STATUS.READY;
            buf[1] = REQ_TYPE.SEND_POS;
            var planes = this.planes;
            for(var i = 0; i < 3; i++) {
                let tailPosX = planes[i][0];
                let tailPosY = planes[i][1];

                if(planes[i][2] == 'left')
                    tailPosX += 3;
                else if(planes[i][2] == 'right')
                    tailPosX -= 3;
                else if(planes[i][2] == 'up')
                    tailPosY += 3;
                else if(planes[i][2] == 'down')
                    tailPosY -= 3;
                else
                    console.log("SendPlanePos Error!!!");

                buf[2 + i * 4] = planes[i][0];
                buf[3 + i * 4] = planes[i][1];
                buf[4 + i * 4] = tailPosX;
                buf[5 + i * 4] = tailPosY;
            }
        
            this.reqBuf = buf;
        },
        sendUserStatus: function() {
            var buf = new Buffer.alloc(3);
            this.status = STATUS.READY;
            this.request = REQ_TYPE.READY;
            buf[0] = STATUS.READY;
            buf[1] = REQ_TYPE.READY;
            buf[2] = this.isReady;

            this.reqBuf = buf;
        }
    }
};
</script>
