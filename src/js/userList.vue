<template>
    <div class="user-list-container full-screen" v-show="showUserList">
        <div class="container">
            <div class="title">Hello! {{username}}, Who is Online?</div>
            <ul class="user-list">
                <userItem :class="['user-item', selectUser == user ? 'selected' : null]" v-for="(user, index) of userList" :key="index" :username="user" @click.native="select(user)">
                    {{user}}
                </userItem>
            </ul>
            <div class="btn" @click="back_btn()" v-show="showBack">Back</div>
            <div class="btn" @click="invite_btn()">Invite</div>
            <div class="btn" @click="next_btn()" v-show="showNext">Next</div>
        </div>
        <div class="btn logout-btn" @click="logout_btn()">Logout</div>        
    </div>
</template>

<style scoped>
.user-list-container {
    display: flex;
    flex-direction: column;
    justify-content:center;
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

.logout-btn:hover {
    background-color: #F56C6C;
    color: #ffffff;
}

.selected {
    background-color: #515151;
    color: #ffffff;
}

</style>

<script>
import bus from './bus';
import userItem from './userItem';
// import ipcRenderer from 'electron';
const ipcRenderer = require('electron').ipcRenderer;

export default {
    name: "userList",
    components: { userItem },
    data: function() {
        return {
            username: null,
            showUserList: false,
            isLoading: false,
            
            status: STATUS.SELECT,   // 当前状态
            request: REQ_TYPE.USER_LST, // 当前请求
            waitfor: EVT_TYPE.USER_LST, // 期待回复

            // list
            selectUser: null,
            numPerPage: 5,  //每页用户显示个数
            totalUserNum: 0,    // 在线总人数
            pageNum: 0,            
            showBack: false,
            showNext: false,
            listStart: 0,
            userList: [],
            // invitation
            isInvited: false,
            // udp
            socket: null,
            port: null,
            host: null,
            reSendFlag: true,   // 重发控制
            reqBuf: null,  // 发送buf
            reSendCount: 0
        };
    },
    created: function() {
        bus.$on("user", username => {
            this.username = username;
            this.showUserList = true;
            this.isInvited = false;
            this.selectUser = null;
            this.inviteUser = null;
            this.listStart = 0;
            this.numPerPage = 5;
            this.reSendFlag = true;   // 重发控制
            this.reqBuf = null;
            this.totalUserNum = 0;

            this.socket.on('message', this.messageHandler); // 开始监听消息
            this.getUserList(this.listStart, this.numPerPage); 
            this.sendRequest();
        })
        ipcRenderer.on('get-invitation-dialog-selection', (event, index) => {
            this.getInvitationHandler(index);
            });
        // ipcRenderer.on('refused-dialog-selection', this.refusedHandler);
        // ipcRenderer.on('game-ready-dialog-selection', this.gameReadyHandler);
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
            if (this.reqBuf && this.showUserList) {
                // reqBuf 不空，则调用send函数
                this.socket.send(this.reqBuf, this.port, this.host, error => {
                    if (error) {
                        console.log("error" + error);
                    } else {
                        // no error
                        if(this.reqBuf)
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
        getUserList: function(start, number) {            
            var buf = Buffer.alloc(2 + UnameLen + 2);
            
            this.request = REQ_TYPE.USER_LST;                     
            this.waitfor = EVT_TYPE.USER_LST;            
            
            buf[0] = STATUS.SELECT;
            buf[1] = REQ_TYPE.USER_LST;
            buf.write(this.username, 2, 'ascii');
            buf[buf.length - 2] = start;
            buf[buf.length - 1] = number;
         
            this.reqBuf = buf;
        },
        sendInvitation: function(targetUser) {
            var buf = Buffer.alloc(2 + UnameLen * 2);
            
            this.request = REQ_TYPE.BATTLE_IVT;            
            this.waitfor = EVT_TYPE.BATTLE_CHK;

            buf[0] = STATUS.SELECT;
            buf[1] = REQ_TYPE.BATTLE_IVT;
            buf.write(this.username, 2, 'ascii');
            buf.write(targetUser, 22, 'ascii');
        
            this.reqBuf = buf;
            this.isInvited = true;
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
            if (this.isLoading || this.selectUser == null)
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
            console.log(new Date().toLocaleString() + " Message received: " + message[0] + ' ' + message[1]);
            if (message[0] != STATUS.SPECIAL && message[0] != STATUS.SELECT)  {
                // 不是本阶段的包全部忽略
                return;
            }
            switch(message[1]) {
                case EVT_TYPE.USER_LST: // show user list
                    var getNum = message[2];
                    var newList = [];
                    this.totalUserNum = message[3];
                    for(var i = 0; i < getNum; i++) {
                        var offset;
                        for(offset = 4 + i * UnameLen; offset < 4 + (i + 1) * UnameLen; offset++)
                            if(message[offset] == 0)
                                break;
                        if(offset != 4 + i * UnameLen)
                            newList.push(message.toString('ascii', 4 + i * UnameLen, offset));
                    }
                    console.log("Get user list: " + newList);
                    this.userList = newList;
                    // 已处理完请求
                    this.isLoading = false;
                    break;
                case EVT_TYPE.GET_IVT: // handle invitation
                    if(this.isInvited)  // 不能重复邀请
                        break;

                    this.isInvited = true;
                    this.inviteUser = message.toString('ascii', 2);
                    console.log("Get invitation form " + this.inviteUser);
                    // 弹个窗确认
                    ipcRenderer.send('open-get-invitation-dialog', this.inviteUser);
                    this.getUserList(this.listStart, this.numPerPage); 
                    break;
                case EVT_TYPE.BATTLE_CHK:   // game ready
                    var roomId = message.toString('ascii', 2);
                    console.log("Get room id: " + roomId);
                    if(!/^[0-9]*$/.test(roomId)) {
                        // 含非数字，按对手拒绝处理
                        console.log("Target user refused");
                        this.selectUser = null;
                        this.isInvited = false;
                        // 继续拉取用户列表
                        this.getUserList(this.listStart, this.numPerPage); 
                        // 弹个窗
                        ipcRenderer.send('open-refused-dialog');
                    } else {
                        // 进入房间
                        // ipcRenderer.send('open-game-ready-dialog');
                        this.gameReady(roomId);
                    }
                    // 已处理完请求
                    this.isLoading = false;
                    break;
                case EVT_TYPE.WAIT: // wait
                    if(this.request == REQ_TYPE.LOGOUT || this.request == REQ_TYPE.ENFORCE_LGOT){
                        console.log("logout!!!");
                        this.logout();
                    }
                    // this.getUserList(this.listStart, this.numPerPage);
                    break;
                case EVT_TYPE.ENFORCE_LGOT:
                    console.log("Enforce logout");
                    var buf = Buffer.alloc(2 + UnameLen + 1);
                    this.request = REQ_TYPE.ENFORCE_LGOT;
                    
                    buf[0] = STATUS.SPECIAL;
                    buf[1] = REQ_TYPE.LOGOUT;
                    buf.write(this.username, 2, 20, 'ascii');
                
                    this.reqBuf = buf;
                    break;
                default:
                    return;
            }
            this.reSendCount = 0;   // 计数器置零
        },
        getInvitationHandler: function(index) {
            // 窗体返回邀请处理结果
            var result = 0;
            if (index == 1){
                // Accept
                result = 1;
            }
            else {
                // Recject
                result = 0;
            }
            this.request = REQ_TYPE.HANDLE_IVT;
            this.waitfor = EVT_TYPE.BATTLE_CHK;

            var buf = Buffer.alloc(2 + UnameLen * 2 + 1);
            buf[0] = STATUS.SELECT;
            buf[1] = REQ_TYPE.HANDLE_IVT;
            buf.write(this.username, 2, 20, 'ascii');
            buf.write(this.inviteUser, 22, 20, 'ascii');
            buf[buf.length - 1] = result;
            console.log('result: ' + result);
            this.reqBuf = buf;
        },
        // refusedHandler: function() {
        //     // 继续拉取用户列表
        //     this.getUserList(this.listStart, this.numPerPage); 
        // },
        // gameReadyHandler: function() {
        //     // 开始游戏，弹窗确认
        //     // do nothing
        // },
        logout_btn: function() {            
            var buf = Buffer.alloc(2 + UnameLen + 1);
            this.request = REQ_TYPE.LOGOUT;
            this.waitfor = EVT_TYPE.WAIT;

            buf[0] = STATUS.SELECT;
            buf[1] = REQ_TYPE.LOGOUT;
            buf.write(this.username, 2, 20, 'ascii');
        
            this.reqBuf = buf;
        },
        // 进入游戏准备阶段
        logout: function() {
            this.reSendFlag = false;
            this.reqBuf = null;
            this.showUserList = false;
            this.socket.removeListener("message", this.messageHandler);
            bus.$emit("logout");
        },
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