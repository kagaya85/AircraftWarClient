<template>
    <div class="login-container" v-show="isLogin">
        <img class="loading-img" src="img/JJNB.png" alt="" v-show="isLoading" />
        <div class="login-form container" v-show="isLogin && !isLoading">
            <div class="input-box">
                <span class="iconfont">&#xe7ae;</span
                ><input
                    type="text"
                    class="username input-line"
                    placeholder="Username"
                    v-model="username"
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
            <div class="login_btn btn" @click="!isBtnLoading && login()">
                Login
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
    /* min-height: 800px; */
    height: 90vh;
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
</style>

<script>
import bus from "./bus";
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
            password: ""
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
            }, 1000);
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
            this.isBtnLoading = true;
            console.log(this.username);
            console.log(this.password);

            var buf = Buffer.from(`${this.username} ${this.password}`);
            this.socket.send(buf, this.port, this.host, error => {
                if (error) {
                    throw error;
                } else {
                    console.log("Message send to " + this.host + ":" + this.port);
                }
            });
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
            }
        }
    }
};
</script>