<template>
    <div class="login-container" v-show="isLogin">
        <img class="loading-img" src="img/JJNB!.png" alt="" v-show="isLoading" />
        <div class="login-form container" v-show="isLogin && !isLoading">
            <div v-text="errorMessages" class="errorMessages"></div>
            <div class="input-box">
                <span class="iconfont">&#xe7ae;</span
                ><input
                    type="text"
                    ref="username"
                    class="username input-line"
                    placeholder="Username"
                    v-model="username"
                    :change="inputLimit()"
                />
            </div>
            <div class="input-box">
                <span class="iconfont">&#xe7e1;</span
                ><input
                    type="password"
                    class="password input-line"
                    placeholder="Password"
                    v-model="password"
                />
            </div>
            <div ref="login_btn" class="login-btn btn" :style="btnLoadingSyle" @click="!isBtnLoading && login()">
                {{isBtnLoading ? 'Logining...' : 'Login'}}
            </div>
        </div>
    </div>
</template>

<style scoped>
@font-face {
    font-family: "iconfont";
    src: url("iconfont.eot?t=1557132641355"); /* IE9 */
    src: url("iconfont.eot?t=1557132641355#iefix") format("embedded-opentype"),
        /* IE6-IE8 */
            url("data:application/x-font-woff2;charset=utf-8;base64,d09GMgABAAAAAAOQAAsAAAAAB3gAAANBAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHEIGVgCDBgqCZIJbATYCJAMMCwgABCAFhG0HNBufBhHVmyfI/pLAqYw9sQO8isWkVfOqykbcKHylHgyjW608rphb/9Podc5wWnGCx8TDw2F7f9xtGm2QKbg0jMI2JRaVWIil0fT04Hk41/uxqquiSCpqoeOxHPFGxtWRnW5KVALcrGd1SSwF8Dq7soAr+/7nhnnIRyizuEebdSzO70/8/m1AyATA/F/zwqr5/PQs17zG2Sba/XxvWOJpPwBnUbyWoOCB9cEpSbsTT3p5ToUK5mW7/P/BsdSPEsyzt3fpCsAXfLCuRdHINpAB+Yaxmwga4mMCplZEgCeu3QWIObAqIB6LbBwQZ9S8ITfERFhxsMkrQZzP1AVe+O/Hn0sgkIICNl5cG1KA79fh9gau/qtRBMGZzgjjGAqOATTiqtJ8yaLwMbDUE3tz6pATOpXvf872peFG//EUMQSy58C+LMqL4mAaga/PL0iggCE0PMGbLF8Nna6HMofYPuRhOsxkRQC41lDhpZ640tlVc4MBYRGK6ZlrULl/Ot+u7VwcLB7Ptqqbp7vtVquqUJyjNHdJT6sCx5u9ZbM4EI3fvQj5d2ABAelwpMsGQHqTFMusjgT8lmakt/9BjggWOkN+xeVeeYC1l035lExt2lsMp3bOnEVRCzEYIxZLcbmcj1zmHfF3m/iM32tbhCq13YKqjhXZ3l2XrUslHxfJIX0KQ1K5nrWf38anS9swIIMmUK/PzDWEiGqlO4LBmjLToQXW2XdZ8iib0tJv+hu+dpmU+PlDHBv4+Dci2bnmRDcrwPgmLIGfwuk40D4PaKpdNmaH1vIYaEzITFPiV+TDwvNw6UbnbEJsmECKLKHE1sjGnmEgc4Oh2AemTkzHZ/pKjPQEDk0lELUNUKUOTO0I6dgnCIy8Q6gOMKR+0b8wsw2sOFiEEWMK8Q+KpGsF0vFB5N4xG+uI0jxOfCPJwge6ouVjHrZIU2yRU2YwCxDUNeBKT8O67qCnrsSElZy5N1VVVH2TknTN7DCzCCPGFOIfFEnXCjqeD4Wfv2M21hE1tPTo30iymBx0ReuA9MRtp5Zb+YqcMoNZgKCuAVcyYg3DHfTV80pMWMkHBHtTVUaJrmJleWnzAllGB+AWm6uYOKtRIi0r/M1mAAAA")
            format("woff2"),
        url("iconfont.woff?t=1557132641355") format("woff"),
        url("iconfont.ttf?t=1557132641355") format("truetype"),
        /* chrome, firefox, opera, Safari, Android, iOS 4.2+ */
            url("iconfont.svg?t=1557132641355#iconfont") format("svg"); /* iOS 4.1- */
}

.iconfont {
    display: inline-block;
    font-family: "iconfont" !important;
    font-size: 30px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.login-container {
    display: flex;
    width: 100%;
    text-align: center;
    align-items: center;
    height: 80vh;
}

.loading-img {
    width: 30%;
    max-width: 200px;
    max-height: 200px;
    margin: 0 auto;
    animation: rotate 6s infinite linear;
}

.login-form {
    min-width: 420px;
}

@keyframes rotate {
    0% {
        transform: rotate(0deg);
        -webkit-transform: rotate(0deg);
        -moz-transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
        -webkit-transform: rotate(360deg);
        -moz-transform: rotate(360deg);
    }
}

.input-box {
    position: relative;
    width: 80%;
    min-width: 300px;
    margin: 20px auto;
    border-radius: 20px;
}

.input-line {
    display: inline-block;
    height: 30px;
    margin: 0px 10px;
    border-radius: 20px;
    border: 2px solid #515151;
    font-size: 20px;
    padding-left: 10px;
}

.errorMessages {
    display: inline-block;
    height: 30px;
    width: 300px;
    overflow: hidden;
    border-radius: 10px;
    color: #ff9900;
    font-size: 20px;
    padding-left: 10px;
}
</style>

<script>
import bus from "./bus";
import { setInterval, clearInterval } from 'timers';
export default {
    name: "login",
    data: function() {
        return {
            isLogin: true,
            isLoading: true,
            isConnecting: false,
            socket: null,
            host: null,
            port: null,
            username: "",
            password: "",
            btnLoadingSyle: "",
            errorMessages: "",
            timer: null,    // 计时器对象
            count: 0    // 重发计数器
        };
    },
    created: function() {
        var bgColorArr = [
            "#caad9f",
            "#f0c869",
            "#6abce0",
            "#9ac4bd",
            "#fad0c4",
            "#9ec6cd",
            "#39c5bb"
        ];
        document.body.style.backgroundColor =
            bgColorArr[Math.floor(Math.random() * bgColorArr.length)];
    },
    mounted: function() {
        var that = this;

        this.loadContent(function() {
            setTimeout(() => {
                that.isLoading = false;
                that = null;
            }, 2000);
        });
    },
    methods: {
        loadContent: function(callback) {
            // 在这里判断图片资源是否加载完毕
            if (typeof callback === "function") {
                callback();
            }
        },
        initSocket: function(socket, host, port) {
            this.socket = socket;
            this.host = host;
            this.port = port;
            
            this.socket.on('message', this.messageHandler);
        },
        login: function(event) {
            var that = this;

            // 检查输入
            if (this.checkInput()) {
                console.log(this.username + ' ' + this.password);
            } else {
                return;
            }
            
            this.isBtnLoading = true;
            this.btnLoadingSyle = {
                'background-color': "#515151",
                'color': "#ffffff"
            }

            var buf = Buffer.from(`${this.username} ${this.password}`);
            var count = 0;
            // 每秒发包
            console.log("begin");
            this.timer = setInterval(() => {
                this.sendRequest()
            }, 1000);
        },
        checkInput: function(){
            // 只检查输入长度
            if(this.username == "") {
                this.alertMessage("Please input username.");
                return false;
            } else if (this.password == "") {
                this.alertMessage("Please input password.");
                return false;
            } else if (this.username.length > 20) {
                this.alertMessage("Username is too long!");
                return false;
            } else if (this.password.length > 20) {
                this.alertMessage("Password is too long!");
                return false;
            }
            return true;
        },
        sendRequest: function(){
            var that = this;
            this.socket.send(buf, this.port, this.host, error => {
                console.log("Send start");
                if (error) {
                    throw error;
                } else {
                    // 发送成功，等待返回消息
                    console.log("Message send to " + this.host + ":" + this.port + " try " + count + " time(s)");
                    // 超时设置
                    if(that.isLogin == true) {
                        // 仍是登陆状态
                        this.count++
                    }
                    else {
                        // 若已经登陆，清除计时器
                        if(that.timer)
                            clearInterval(that.timer);  // 清除计时器
                        that = null;
                        that.count = null;
                    }
                    if(count >= 5){ // 超时
                        console.log('Reponse time out.');
                        that.isBtnLoading = false;
                        that.btnLoadingSyle = "";
                        if(that.timer)
                            clearInterval(that.timer);  // 清除计时器
                        that = null;
                        count = null;
                    }
                }
            })
        },
        alertMessage: function(message) {
            this.errorMessages = message;
            var that = this;
            setTimeout(() => {
                that.errorMessages = "";
                that = null;
            }, 1500);
        },
        inputLimit: function() {
            this.username = this.username.replace(/[^\a-\z\A-\Z0-9]/g, '');
        },
        messageHandler: function(message, remote) {
            if (message == `${this.username} ${this.password}`) {
                console.log("login success!!!");
                this.isLogin = false;
                this.socket.removeListener('message', this.messageHandler);
                bus.$emit("start", this.username);
            } else {
                console.log("login failed!!!");
                this.isBtnLoading = false;
                this.btnLoadingSyle = "";
            }
        }
    }
};
</script>