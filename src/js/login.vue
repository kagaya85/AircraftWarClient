<template>
    <div class="login-container" v-show="isLogin">
        <img class="loading-img" src="../img/JJNB.png" alt="" />
        <div class="login-form" v-show="isLogin && !isloading">
            <input type="text" placeholder="用户名" v-model="username">
            <input type="text" placeholder="用户名" v-model="username">
            <button class="login_btn" type="primary" @click="login">登陆</button>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    display: flex;
    width: 100%;
    text-align: center;
    align-items: center;
    height: 100vh;
}

.loading-img {
    width: 30%;
    max-width: 200px;
    max-height: 200px;
    margin: 0 auto;
    animation: rotate 6s infinite linear;
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
</style>

<script>
import bus from "./bus";
export default {
    name: "login",
    data: function() {
        return {
            isLogin : true,
            isloading : true,
            isBtnLoading : false,
            socket : null,
            host : null,
            port : null,
            username : "",
            password : ""
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

        this.loadContent(function () {
           setTimeout(() => {
                that.isloading = false;
            }, 1000);
        });
    },
    methods: {
        loadContent : function(callback) {
            // 在这里判断图片资源是否加载完毕
            if (typeof callback === "function") {
                callback();
            }
        },
        initSocket: function(socket, host, port) {
            this.socket = socket;
            this.host = host;
            this.port = port;
        },
        login : function(event) {
            this.isBtnLoading = true;
            console.log(this.username);
            console.log(this.password);
        }
    }
};
</script>