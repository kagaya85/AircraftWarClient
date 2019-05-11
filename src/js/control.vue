<template>
    <div class="panel-container" v-show="showPanel">
        <div class="preparation-phase" v-show="!isBattle">
            <div v-show="isEnemyReady">Your opponent is ready</div>
            <div class="btn" @click="rotate_btn">Rotate</div>
            <div :class="['btn', isReady ? 'selected' : null]" @click="ready_btn">Ready</div>
        </div>
        <div class="action-phase" v-show="isBattle">
            <div class="score-board">
                <div class="" data-control="BOX" id="Box_points_switch">
                    <label v-show="isUserTurn">Locate Aircraft<input class="mui-switch mui-switch-anim" type="checkbox" v-model="isLocate" id="switch"></label>
                </div>
                <span class="info" v-show="!isEnd">Game start！！！{{ isUserTurn ? 'Your turn' : 'Not your turn'}}</span>
                <span class="info" v-show="isEnd">Game end！！！{{ gameResult }}</span>
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

.selected {
    background-color: #515151;
    color: #ffffff;
}
</style>

<style scoped src="../css/button.css">
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
            isEnd: false,       // 是否结束
            isEnemyReady: false,     // 对手是否在准备状态            
            isUserTurn: false,   // 回合标志
            gameResult: null,   // 对局结束结果字符串

            status: STATUS.READY,   // 当前状态
            request: REQ_TYPE.READY, // 当前请求
            waitfor: EVT_TYPE.OPPONENT_STA, // 期待回复
            
            planes: [],   // 保存飞机位置
            isLocate: false,    // 是否为确认飞机的状态
            locateClickCount: 0,    // 定位飞机时点击坐标个数
            clickPos: {x: null, y: null},     // 当前用户点击的坐标
            clickPos2: {x: null, y: null},
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
            this.username = username;
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
                ipcRenderer.send('open-plane-error-dialog');
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
            if (message[0] != STATUS.SPECIAL && message[0] != this.status)  {
                // 不是本阶段的包全部忽略 或 不是期待的事件
                console.log('ignored');
                return;
            }
            switch(message[1]) {
                // ready
                case EVT_TYPE.OPPONENT_STA:  // 对手状态
                    this.isEnemyReady = message[2];
                    break;
                case EVT_TYPE.READY:    // 准备开始，发送飞机位置
                    if(!this.planes[0] || !this.planes[0] || !this.planes[0]) 
                        return;
                    this.sendPlanePos();
                    break;
                case EVT_TYPE.START:    // 正式开始
                    // 决定先手后手
                    this.status = STATUS.BATTLE;
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
                    
                    wait(1000).then(bus.$emit("show-user"));
                    break;
                case EVT_TYPE.LOCATE:   // 定位飞机结果
                    var direct = 'left';
                    if(message[2] == 0){    // 猜错，恢复点击过的地方
                        bus.$emit('fill', this.clickPos.x, this.clickPos.y, 'blank');
                        bus.$emit('fill', this.clickPos2.x, this.clickPos2.y, 'blank');                    
                    }
                    else if(message[2] == 1){ // 猜对
                        if(clickPos2.x == clickPos.x) {
                            if(clickPos2.y > clickPos.y)
                                direct = 'up';
                            else
                                direct = 'down';
                        }
                        else {
                            if(clickPos2.x > clickPos.x)
                                direct = 'left';
                            else
                                direct = 'right';
                        }
                        bus.$emit('fillPlane', this.clickPos.x, this.clickPos.y, direct);
                        
                        // 判断游戏是否继续
                        if(message[3] == 1) {
                            // 游戏结束 win
                            this.isEnd = true;
                            this.gameResult = "You Win!"
                        }
                    }
                    wait(1000).then(bus.$emit("show-user"));
                    break;
                case EVT_TYPE.OPCLICK:{  // 对手点击
                    let [x, y] = [message[2], message[3]];
                    if(message[4] == 1)
                        bus.$emit('fill', x, y, 'none', false);
                    else if(message[4] == 2)
                        bus.$emit('fill', x, y, 'body', false);
                    else if(message[4] == 3)
                        bus.$emit('fill', x, y, 'head', false);
                    
                    this.isUserTurn = true;
                    wait(1000).then(bus.$emit("show-enmey"));
                    break;
                }
                case EVT_TYPE.LOCATE: {   // 对手定位飞机
                    let [x, y] = [message[2], message[3]];
                    if (message[4] == 1){
                        // 对手猜中
                        bus.$emit('fillPlane', x, y, null, false);
                    }
                    else {
                        // 对手猜错
                        console.log("对手猜飞机猜错");
                    }
                    
                    this.isUserTurn = true;
                    wait(1000).then(bus.$emit("show-enmey"));
                    break;
                }
                // special
                case EVT_TYPE.OPLEAVE:  // 对手离开，退出房间
                    this.isBattle = true;
                    this.isEnd = true;
                    this.gameResult = "Enemy leaved, You Win!"
                    break;
                case EVT_TYPE.WAIT:     // ACK
                    if(this.request == REQ_TYPE.LOGOUT || this.request == REQ_TYPE.ENFORCE_LGOT){
                        console.log("logout!!!");
                        this.logout();
                    }
                    break;
                case EVT_TYPE.ENFORCE_LGOT:
                    console.log('Enforce logout');
                    var buf = new Buffer.alloc(2 + UnameLen + 1);
                    this.request = REQ_TYPE.ENFORCE_LGOT;
                    this.waitfor = EVT_TYPE.WAIT;

                    buf[0] = STATUS.SPECIAL;
                    buf[1] = REQ_TYPE.ENFORCE_LGOT;
                    buf.write(this.username, 2, 20, 'ascii');
                
                    this.reqBuf = buf;
                    break;
            }

            // 已处理完请求
        
            this.reSendCount = 0;   // 计数器置零
        },
        sendRequest: function() {
            // 调用一次后就会循环调用，发送this.reqBuf里的东西
            if (this.reqBuf && this.showPanel) {
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
                                this.reqBuf[0].toString() +
                                "REQ: " +
                                this.reqBuf[1].toString()
                        );
                    }   // no error end
                }); // send end
            }

            if(this.reSendCount > 5) {
                this.logout();
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
                var buf = new Buffer.alloc(2 + UnameLen + 2);
                
                this.request = REQ_TYPE.CLICK;
                this.waitfor = EVT_TYPE.CLICK;
                
                buf[0] = STATUS.BATTLE;
                buf[1] = REQ_TYPE.CLICK;
                buf.write(this.username, 2, 20, 'ascii');
                buf[22] = x;
                buf[23] = y;
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
                    // 记录第二次点击位置
                    this.clickPos2.x = x;
                    this.clickPos2.y = y;
                    var buf = new Buffer.alloc(2 + UnameLen + 4);
                   
                    this.request = REQ_TYPE.LOCATE;
                    this.waitfor = EVT_TYPE.LOCATE;

                    buf[0] = STATUS.BATTLE;
                    buf[1] = REQ_TYPE.CLICK;
                    buf.write(this.username, 2, 20, 'ascii');
                    buf[22] = this.clickPos.x;
                    buf[23] = this.clickPos.y;
                    buf[24] = x;
                    buf[25] = y;
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
            var buf = new Buffer.alloc(2 + UnameLen + 12);
            this.request = REQ_TYPE.SEND_POS;
            this.waitfor = EVT_TYPE.START;
            
            buf[0] = STATUS.READY;
            buf[1] = REQ_TYPE.SEND_POS;
            buf.write(this.username, 2, 20, 'ascii');

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

                buf[2 + UnameLen + i * 4] = planes[i][0];
                buf[3 + UnameLen + i * 4] = planes[i][1];
                buf[4 + UnameLen + i * 4] = tailPosX;
                buf[5 + UnameLen + i * 4] = tailPosY;
            }
        
            this.reqBuf = buf;
        },
        sendUserStatus: function() {
            var buf = new Buffer.alloc(2 + UnameLen + 1);
            this.request = REQ_TYPE.READY;
            this.waitfor = EVT_TYPE.OPPONENT_STA;

            buf[0] = STATUS.READY;
            buf[1] = REQ_TYPE.READY;
            buf.write(this.username, 2, 20, 'ascii');
            buf[22] = this.isReady;

            this.reqBuf = buf;
        },
        logout: function() {
            this.reSendFlag = false;
            this.reqBuf = null;
            this.showPanel = false;
            this.socket.removeListener("message", this.messageHandler);
            bus.$emit("logout");
        },
    }
};
</script>
