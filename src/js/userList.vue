<template>
    <div class="user-list-container full-screen" v-show="showUserList">
        <div class="container">
            <div class="title">Who is Online?</div>
            <ul class="user-list">
                <userItem :class="['user-item', selectUser == user ? 'selected' : null]" v-for="(user, index) of userList" :key="index" :username="user" @click="select(user)">
                    {{user}}
                </userItem>
            </ul>
            <div class="btn" @click="back_btn()" v-show="showBack">Back</div>
            <div class="btn" @click="invite_btn()">Invite</div>
            <div class="btn" @click="next_btn()" v-show="showNext">Next</div>
        </div>
    </div>
</template>

<style scoped>
.user-list-container {
    display: flex;
    text-align: center;
    align-items: center;
}

.user-item {
    display: block;
    /* border: 2px solid #515151; */
    font-size: 20px;
    padding: 10px 16px;
    margin: 10px;
    border-radius: 30px;
}

.user-item:hover {
    cursor: pointer;
    background-color: #515151;
    color: #ffffff;
}

.selected {
    background-color: #515151;
    color: #ffffff;
}

</style>

<script>
import bus from "./bus";
import userItem from "./userItem"
import { totalmem } from 'os';

export default {
    name: "userList",
    components: { userItem },
    data: function() {
        return {
            username: null,
            showUserList: false,
            isLoading: false,
            // list
            selectUser: null,
            numPerPage: 5,  //每页用户显示个数
            totalUserNum: 4,    // 在线总人数
            pageNum: 0,            
            showBack: false,
            showNext: false,
            listStart: 0,
            userList: ['laoyou', 'xiaoyou', 'kagaya', 'hibiki'],
            // udp
            socket: null,
            port: null,
            host: null,
            reSendFlag: true,   // 重发控制
            reqBuf: null  // 发送buf
        };
    },
    created: function() {
        bus.$on("user", username => {
            this.username = username;
            this.showUserList = true;
            this.socket.on('message', this.messageHandler); // 开始监听消息
            // this.getUserList(0, 5); 
            // this.sendRequest();
        })
    },
    methods: {
        initSocket: function(socket, host, port) {
            this.socket = socket;
            this.host = host;
            this.port = port;
        },
        select: function(user) {
            this.selectUser = user;
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
        getUserList: function(start, number) {            
            var buf = new Buffer.alloc(2 + UnameLen + 2);
            
            buf[0] = STATUS.SELECT;
            buf[1] = REQ_TYPE.USER_LST;
            buf.write(this.username, 2, 'ascii');
            buf[22] = start;
            buf[23] = number;
        
            this.reqBuf = buf;
        },
        sendInvitation: function(targetUser) {
            var buf = new Buffer.alloc(2 + UnameLen);
            
            buf[0] = STATUS.SELECT;
            buf[1] = REQ_TYPE.BATTLE_IVT;
            buf.write(targetUser, 2, 'ascii');
        
            this.reqBuf = buf;
        },
        back_btn: function() {
            if (this.isLoading || this.pageNum <= 0) {
                // 正在加载或页号小于等于0
                return;
            }

            this.pageNum--;

            if(this.pageNum <= 0) {
                this.showBack = false;
            }

            if (this.listStart >= this.numPerPage)
                this.listStart -= this.numPerPage;

            this.getUserList(this.listStart, this.numPerPage);
            this.isLoading = true;
        },
        invite_btn: function() {
            if (this.isLoading)
                return;

            this.sendInvitation(this.selectUser);
            this.isLoading = true;
        },
        next_btn: function() {
            if (this.isLoading || this.listStart + this.numPerPage > this.totalUserNum) {
                // 已是最后一页或正在加载
                return;
            }

            if(this.pageNum <= 0) {
                this.showBack = false;
            }

            this.pageNum++;
            this.listStart += this.numPerPage;
            this.getUserList(this.listStart, this.numPerPage);
            this.isLoading = true;

            if (this.listStart + this.numPerPage > this.totalUserNum) {
                // 如果已经是最后一页
                this.showNext = false;
            }
        },
        messageHandler: function(message, remote) {
            console.log(new Date().toLocaleString() + " Message received: " + message);
            if (message[0] != STATUS.SELECT || this.isLoading == false)  {
                // 不是本阶段的包全部忽略 或 未请求
                return;
            }
            switch(message[1]) {
                case EVT_TYPE.USER_LST: // show user list
                    var getNum = message[2];
                    var newList = [];
                    this.totalUserNum = message[3];
                    for(var i = 0; i < getNum; i++) {
                        newList.push(message.toString('ascii', 4 + i * UnameLen, 4 + (i + 1) * UnameLen));
                    }
                    console.log("Get user list: " + newList);
                    this.userList = newList;
                    break;
                case EVT_TYPE.GET_IVT: // handle invitation
                    var user = message.toString('ascii', 2);
                    console.log("Get invitation form " + user);
                    // 弹个窗确认
                    
                    
                    break;
                case EVT_TYPE.BATTLE_CHK:   // game ready
                    var roomId = message.toString('ascii', 2);
                    console.log("Get room id: " + roomId);
                    if(!/^[0-9]*$/.test(roomId)) {
                        // 含非数字，按对手拒绝处理
                        console.log("Target user refused");
                        // 弹个窗

                   
                    } else {
                        // 进入房间
                        this.gameReady(roomId);
                    }
                    break;
                case EVT_TYPE.WAIT: // wait
                    break;
                default:
                    return;
            }

            // 已处理完请求
            this.isLoading = false;
            this.reqBuf = null;
        },
        // 进入游戏准备阶段
        gameReady: function(roomId) {
            // 该阶段收尾
            console.log("Game ready!!!");
            this.reSendFlag = false;
            this.reqBuf = null;
            this.showUserList = false;
            this.socket.removeListener("message", this.messageHandler);
            bus.$emit("start", this.username, roomId);
        }
    }
}
</script>