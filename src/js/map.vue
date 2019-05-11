<template>
    <div class="map-container container" v-show="showMap">
        <!--这里的canvas不能使用css调整大小，会导致绘图尺寸错误-->
        <canvas
            ref="mapLayer"
            id="mapLayer"
            width="800px"
            height="500px"
        ></canvas>
        <canvas
            ref="planeLayer"
            id="planeLayer"
            width="800px"
            height="500px"
            v-show="!showEnemy"
            @mousedown="mouseDownHandler"
            @mousemove="mouseMoveHandler"
            @mouseup="mouseUpHandler"
        ></canvas>
        <canvas
            ref="enemyLayer"
            id="enemyLayer"
            v-if="showEnemy"
            width="800px"
            height="500px"
            @mousedown="mouseClickHandler"
        ></canvas>
    </div>
</template>

<style scoped>
.map-container {
    position: relative;
    height: 500px;
    min-width: 800px;
}

.map-container canvas {
    display: block;
    position: absolute;
    margin: 30px auto;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
}

/* #mapLayer {
    box-shadow: -1px -1px 1px #f3f2f2, 5px 5px 5px #6f6767;
} */
</style>

<script>
import bus from "./bus";
export default {
    name: "map",
    data: function() {
        return {
            planes: [],
            gridSize: 50,
            pickedPlane: null,
            offset: { x: 0, y: 0 },
            originalPos: { x: 0, y: 0 },
            showEnemy: false,
            showMap: false,
            isBattle: false, // 对战阶段屏蔽用户对自己棋盘的操作

            enemyOps: [] // 保存对手操作  [2]为null表示画飞机
        };
    },
    created: function() {
        // panel事件处理
        bus.$on('rotate', this.rotateHandler);
        bus.$on('ready', () => {
            this.isBattle = true;
        });
        bus.$on('unready', () => {
            this.isBattle = false;
        });
        bus.$on('show-enemy', () => {
            console.log('show-enemy');
            this.showEnemy = true;

            for(var i = 0; i < this.enemyOps.length; i++) {
                if(this.enemyOps[i][0] == true) {
                    this.fillPlane(this.enemyOps[i][1], this.enemyOps[i][2], this.enemyOps[i][3], true);
                } else {
                    this.fillGrid(this.enemyOps[i][1], this.enemyOps[i][2], this.enemyOps[i][3], true);
                }
            }
        });
        bus.$on('show-user', () => {
            console.log('show-user');
            this.showEnemy = false;
        });
        bus.$on('start', username => {
            this.showMap = true;
            this.enemyOps = [];
        })
        bus.$on('fill', (x, y, type, isEnemy) => { 
            if(isEnemy)
                this.enemyOps.push([false , x, y, type, isEnemy]);
            
            this.fillGrid(x, y, type, isEnemy);
            });
        bus.$on('fill-plane', (x, y, direct, isEnemy) => {
            if(isEnemy)
                this.enemyOps.push([true, x, y, direct, isEnemy]);            
            
            this.fillPlane(x, y, direct, isEnemy);
            });
        bus.$on('init', () => {
            this.planes = [];
            this.enemyOps = [];
            this.isBattle = false;
            this.init();
            this.repaintPlane();
        });
    },
    mounted: function() {
        this.init();
    },
    methods: {
        init: function() {
            this.drawBoard();
            // 初始化飞机
            var color = ["#39C5BB", "#66CCFF", "#FFBFCB"];
            var offset = this.gridSize / 2;
            for (var i = 0; i < 3; i++) {
                var p = new this.Plane(
                    525 + offset * i,
                    225 + offset * i,
                    "left",
                    color[i],
                    i
                );
                this.planes.push(p);
                this.drawPlane(p);
            }
        },
        mouseDownHandler: function(e) {
            if(this.isBattle)
                return;
            var canvas = this.$refs.planeLayer;
            var mouse = {
                x: e.clientX - canvas.getBoundingClientRect().left,
                y: e.clientY - canvas.getBoundingClientRect().top
            };
            var picked = -1;
            var flag = false;   //是否选中飞机
            // 判断点击的图形，获取该对象，并放置在栈顶
            // 从最上面的图形开始判断
            for (var i = this.planes.length - 1; i >= 0; i--) {
                let p = this.planes[i];
                let direct = p.direct;
                let gridSize = this.gridSize;
                switch (direct) {
                    case "left":
                        if (
                            mouse.x > p.posX &&
                            mouse.x < p.posX + 4 * gridSize &&
                            mouse.y > p.posY - gridSize &&
                            mouse.y < p.posY
                        ) {
                            // 机身
                            flag = true;
                        } else if (
                            mouse.x > p.posX + 1 * gridSize &&
                            mouse.x < p.posX + 2 * gridSize &&
                            mouse.y > p.posY - 3 * gridSize &&
                            mouse.y < p.posY + 2 * gridSize
                        ) {
                            // 前翼
                            flag = true;
                        } else if (
                            mouse.x > p.posX + 3 * gridSize &&
                            mouse.x < p.posX + 4 * gridSize &&
                            mouse.y > p.posY - 2 * gridSize &&
                            mouse.y < p.posY + 1 * gridSize
                        ) {
                            // 尾翼
                            flag = true;
                        }

                        break;
                    case "right":
                        if (
                            mouse.x < p.posX + gridSize &&
                            mouse.x > p.posX - 3 * gridSize &&
                            mouse.y > p.posY - gridSize &&
                            mouse.y < p.posY
                        ) {
                            // 机身
                            flag = true;
                        } else if (
                            mouse.x < p.posX&&
                            mouse.x > p.posX - 1 * gridSize &&
                            mouse.y > p.posY - 3 * gridSize &&
                            mouse.y < p.posY + 2 * gridSize
                        ) {
                            // 前翼
                            flag = true;
                        } else if (
                            mouse.x < p.posX - 2 * gridSize &&
                            mouse.x > p.posX - 3 * gridSize &&
                            mouse.y > p.posY - 2 * gridSize &&
                            mouse.y < p.posY + 1 * gridSize
                        ) {
                            // 尾翼
                            flag = true;
                        }

                        break;
                    case "up":
                        if (
                            mouse.x > p.posX &&
                            mouse.x < p.posX + 1 * gridSize &&
                            mouse.y > p.posY - gridSize &&
                            mouse.y < p.posY + 3 * gridSize
                        ) {
                            // 机身
                            flag = true;
                        } else if (
                            mouse.x > p.posX - 2 * gridSize &&
                            mouse.x < p.posX + 3 * gridSize &&
                            mouse.y > p.posY &&
                            mouse.y < p.posY + gridSize
                        ) {
                            // 前翼
                            flag = true;
                        } else if (
                            mouse.x > p.posX - 1 * gridSize &&
                            mouse.x < p.posX + 2 * gridSize &&
                            mouse.y > p.posY + 2 * gridSize &&
                            mouse.y < p.posY + 3 * gridSize
                        ) {
                            // 尾翼
                            flag = true;
                        }

                        break;
                    case "down":
                        if (
                            mouse.x > p.posX &&
                            mouse.x < p.posX + 1 * gridSize &&
                            mouse.y < p.posY &&
                            mouse.y > p.posY - 4 * gridSize
                        ) {
                            // 机身
                            flag = true;
                        } else if (
                            mouse.x > p.posX - 2 * gridSize &&
                            mouse.x < p.posX + 3 * gridSize &&
                            mouse.y < p.posY - 1 * gridSize &&
                            mouse.y > p.posY - 2 * gridSize
                        ) {
                            // 前翼
                            flag = true;
                        } else if (
                            mouse.x > p.posX - 1 * gridSize &&
                            mouse.x < p.posX + 2 * gridSize &&
                            mouse.y < p.posY - 3 * gridSize &&
                            mouse.y > p.posY - 4 * gridSize
                        ) {
                            // 尾翼
                            flag = true;
                        }

                        break;
                    default:
                        console.log(`Direction error: ${direct}.`);
                }

                if (flag == true) {
                    picked = i;
                    break;
                }
            }
            if (flag == false || picked < 0) return; // 未选中飞机

            this.pickedPlane = this.planes[picked];
            // 记录一下原始坐标
            this.originalPos.x = this.pickedPlane.posX;
            this.originalPos.y = this.pickedPlane.posY;

            // 调整选中飞机到最上层
            if (picked < this.planes.length - 1) {
                this.planes.splice(picked, 1);
                this.planes.push(this.pickedPlane);
            }

            this.offset = {
                x: mouse.x - this.pickedPlane.posX,
                y: mouse.y - this.pickedPlane.posY
            };
        },
        mouseMoveHandler: function(e) {
            if (this.isBattle || this.pickedPlane == null) {
                return;
            }

            var canvas = this.$refs.planeLayer;
            var mouse = {
                x: e.clientX - canvas.getBoundingClientRect().left,
                y: e.clientY - canvas.getBoundingClientRect().top
            };

            this.pickedPlane.posX = mouse.x - this.offset.x;
            this.pickedPlane.posY = mouse.y - this.offset.y;

            // 重新绘制
            this.repaintPlane();
        },
        mouseUpHandler: function(e) {
            if (this.isBattle || this.pickedPlane == null) {
                return;
            }
            var canvas = this.$refs.planeLayer;
            var ctx = canvas.getContext("2d");

            // 吸附棋盘
            var p = this.pickedPlane;
            var direct = p.direct;
            var gridSize = this.gridSize;
            switch (direct) {
                case "left":
                    if (p.posX < 10 * gridSize && p.posY < 14 * gridSize) {
                        let dx = p.posX % gridSize;
                        let dy = p.posY % gridSize;
                        let boundary = gridSize / 2;
                        p.posX -= dx;
                        p.posY -= dy;

                        if (p.posX < 0) p.posX = 0;
                        else if (p.posX > 6 * gridSize) p.posX = 6 * gridSize;
                        else if (dx >= boundary && p.posX < 6 * gridSize) {
                            p.posX += gridSize;
                        }

                        if (p.posY < 3 * gridSize) p.posY = 3 * gridSize;
                        else if (p.posY > 8 * gridSize) p.posY = 8 * gridSize;
                        else if (dy >= boundary && p.posY < 8 * gridSize) {
                            p.posY += gridSize;
                        }
                    }
                    break;
                case "right":
                    if (p.posX < 12 * gridSize && p.posY < 14 * gridSize) {
                        let dx = p.posX % gridSize;
                        let dy = p.posY % gridSize;
                        let boundary = gridSize / 2;
                        p.posX -= dx;
                        p.posY -= dy;

                        if (p.posX < 3 * gridSize) p.posX = 3 * gridSize;
                        else if (p.posX > 9 * gridSize) p.posX = 9 * gridSize;
                        else if (dx >= boundary && p.posX < 9 * gridSize) {
                            p.posX += gridSize;
                        }

                        if (p.posY < 3 * gridSize) p.posY = 3 * gridSize;
                        else if (p.posY > 8 * gridSize) p.posY = 8 * gridSize;
                        else if (dy >= boundary && p.posY < 8 * gridSize) {
                            p.posY += gridSize;
                        }
                    }
                    break;
                case "up":
                    if (p.posX < 14 * gridSize && p.posY < 11 * gridSize) {
                        let dx = p.posX % gridSize;
                        let dy = p.posY % gridSize;
                        let boundary = gridSize / 2;
                        p.posX -= dx;
                        p.posY -= dy;

                        if (p.posX < 2 * gridSize) p.posX = 2 * gridSize;
                        else if (p.posX > 7 * gridSize) p.posX = 7 * gridSize;
                        else if (dx >= boundary && p.posX < 7 * gridSize) {
                            p.posX += gridSize;
                        }

                        if (p.posY < gridSize) p.posY = gridSize;
                        else if (p.posY > 7 * gridSize) p.posY = 7 * gridSize;
                        else if (dy >= boundary && p.posY < 7 * gridSize) {
                            p.posY += gridSize;
                        }
                    }
                    break;
                case "down":
                    if (p.posX < 12 * gridSize && p.posY < 14 * gridSize) {
                        let dx = p.posX % gridSize;
                        let dy = p.posY % gridSize;
                        let boundary = gridSize / 2;
                        p.posX -= dx;
                        p.posY -= dy;

                        if (p.posX < 2 * gridSize) p.posX = 2 * gridSize;
                        else if (p.posX > 7 * gridSize) p.posX = 7 * gridSize;
                        else if (dx >= boundary && p.posX < 7 * gridSize) {
                            p.posX += gridSize;
                        }

                        if (p.posY < 4 * gridSize) p.posY = 4 * gridSize;
                        else if (p.posY > 10 * gridSize) p.posY = 10 * gridSize;
                        else if (dy >= boundary && p.posY < 10 * gridSize) {
                            p.posY += gridSize;
                        }
                    }
                    break;
                default:
                    console.log(`Direction error: ${direct}`);
                    return;
            }

            if(this.isCover()){
                p.posX = this.originalPos.x;
                p.posY = this.originalPos.y;
            }

            this.repaintPlane();
            let [x, y] = this.posTransform(this.pickedPlane.posX, this.pickedPlane.posY);
            y -= 1;

            if(x >= 0 && y >= 0)  // 位置合法
                bus.$emit('plane-pos', [this.pickedPlane.no, x, y, this.pickedPlane.direct]); // 更新一下控制模块的飞机位置
            else    // 位置不合法
                bus.$emit('plane-pos', [this.pickedPlane.no]); // 更新一下控制模块的飞机位置

            this.pickedPlane = null;

        },
        isCover: function() {
            var planes = [];

            for(var i = 0; i < this.planes.length; i++) {
                let [x, y] = this.posTransform(this.planes[i].posX, this.planes[i].posY);
                y -= 1;     // 飞机坐标用左下角坐标代替
                if(x!=-1 && y!=-1)
                    planes.push([x, y, this.planes[i].direct]);
            }
           
            var planes_postion =[]

            for(var i = 0; i < planes.length; i++) {
                var pos=[]
                let [x, y, direct] = planes[i];
                pos.push([x,y])
                if (direct == "left") {
                    pos.push([x+1,y])
                    pos.push([x+2,y])
                    pos.push([x+3,y])
                    pos.push([x+1,y-1])
                    pos.push([x+1,y-2])
                    pos.push([x+1,y+1])
                    pos.push([x+1,y+2])
                    pos.push([x+3,y-1])
                    pos.push([x+3,y+1])

                } else if (direct == "right") {
                    pos.push([x-1,y])
                    pos.push([x-2,y])
                    pos.push([x-3,y])
                    pos.push([x-1,y-1])
                    pos.push([x-1,y-2])
                    pos.push([x-1,y+1])
                    pos.push([x-1,y+2])
                    pos.push([x-3,y-1])
                    pos.push([x-3,y+1])
                } else if (direct == "up") {
                    pos.push([x,y+1])
                    pos.push([x,y+2])
                    pos.push([x,y+3])
                    pos.push([x+1,y+1])
                    pos.push([x+2,y+1])
                    pos.push([x-1,y+1])
                    pos.push([x-2,y+1])
                    pos.push([x-1,y+3])
                    pos.push([x+1,y+3])
                } else if (direct == "down") {
                    pos.push([x,y-1])
                    pos.push([x,y-2])
                    pos.push([x,y-3])
                    pos.push([x+1,y-1])
                    pos.push([x+2,y-1])
                    pos.push([x-1,y-1])
                    pos.push([x-2,y-1])
                    pos.push([x-1,y-3])
                    pos.push([x+1,y-3])
                }
                planes_postion.push(pos)
            }
            for(var i = 0; i < planes.length; i++) {
                for(var j = i+1; j < planes.length; j++)
                    for(var k=0; k<10;k++)
                        for(var m=0; m<10;m++)
                        {
                            let [x1, y1] = planes_postion[i][k];
                            let [x2, y2] = planes_postion[j][m];
                            if(x1==x2&&y1==y2)
                                return true
                        }
            }
            return false;
        },
        // 用于游戏阶段点击对手棋盘的格子
        mouseClickHandler: function(e){
            var canvas = this.$refs.enemyLayer;
            var mouse = {
                x: e.clientX - canvas.getBoundingClientRect().left,
                y: e.clientY - canvas.getBoundingClientRect().top
            };

            var [x, y] = this.posTransform(mouse.x, mouse.y);
            bus.$emit('click', x, y);
        },
        // 将鼠标点击坐标返回为棋盘位置坐标，不合法返回[-1，-1]
        posTransform: function(posX, posY) {
            var x = Math.floor(posX / this.gridSize);
            var y = Math.floor(posY / this.gridSize);
            
            if(x < 0 || x > 9 || y < 0 || y > 9) {
                return [-1, -1];
            }

            return [x, y];
        },
        // 绘图
        repaintPlane: function() {
            var canvas = this.$refs.planeLayer;
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (var i = 0; i < this.planes.length; i++) {
                this.drawPlane(this.planes[i]);
            }
        },
        fillGrid: function(x, y, type, isEnemy = true){
            console.log('fill');

            if(isEnemy)
                var canvas = this.$refs.enemyLayer;
            else
                var canvas = this.$refs.planeLayer;

            var ctx = canvas.getContext("2d");
            var size = this.gridSize;
            
            if(type == 'head') { // 机头
                var color = '#CC0099';
            }
            else if(type == 'none') { // 空
                var color = '#909399'
            }
            else if(type == 'body'){ // 机身
                var color = "#F56C6C";
            }
            else if(type == 'clicked'){  // clicked
                var color = '#000000'
            }
            else{  // blank
                var color = '#FFFFFF'
            }
            
            ctx.strokeStyle = color; //"#D6D1D1"
            ctx.beginPath();
            ctx.rect(x * this.gridSize + 1, y * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2);
            
            // ctx.stroke();
            ctx.fillStyle = color;
            ctx.fill();
        },
        fillPlane: function(x, y, direct, isEnemy = true){
            console.log('fill-plane');
            var [posX, posY] = [x * this.gridSize, (y + 1) * this.gridSize];
            console.log('posX, posY:'+ posX + ' ' + posY);
            var p = new this.Plane(posX, posY, direct,'#F56C6C', 0);

            this.drawPlane(p, isEnemy);
        },
        drawBoard: function() {
            var canvas = this.$refs.mapLayer;
            var ctx = canvas.getContext("2d");
            var size = this.gridSize;

            for (var i = 0; i < 11; i++) {
                ctx.strokeStyle = "#000000"; //"#D6D1D1"
                ctx.beginPath();
                ctx.moveTo(i * size, 0);
                ctx.lineTo(i * size, size * 10);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * size);
                ctx.lineTo(size * 10, i * size);
                ctx.stroke();
            }
        },
        drawPlane: function(plane, isEnemy = false) {
            if(isEnemy)
                var canvas = this.$refs.enemyLayer;
            else
                var canvas = this.$refs.planeLayer;
            var ctx = canvas.getContext("2d");
            var [sx, sy] = [plane.posX, plane.posY];
            var size = this.gridSize;

            ctx.beginPath();
            ctx.moveTo(sx, sy);
            if (plane.direct == "left") {
                ctx.lineTo(sx + size, sy);
                ctx.lineTo(sx + size, sy + size * 2);
                ctx.lineTo(sx + size * 2, sy + size * 2);
                ctx.lineTo(sx + size * 2, sy);
                ctx.lineTo(sx + size * 3, sy);
                ctx.lineTo(sx + size * 3, sy + size);
                ctx.lineTo(sx + size * 4, sy + size);
                ctx.lineTo(sx + size * 4, sy - size * 2);
                ctx.lineTo(sx + size * 3, sy - size * 2);
                ctx.lineTo(sx + size * 3, sy - size);
                ctx.lineTo(sx + size * 2, sy - size);
                ctx.lineTo(sx + size * 2, sy - size * 3);
                ctx.lineTo(sx + size, sy - size * 3);
                ctx.lineTo(sx + size, sy - size);
                ctx.lineTo(sx, sy - size);
                ctx.closePath();
            } else if (plane.direct == "right") {
                ctx.lineTo(sx, sy + size * 2);
                ctx.lineTo(sx - size, sy + size * 2);
                ctx.lineTo(sx - size, sy);
                ctx.lineTo(sx - size * 2, sy);
                ctx.lineTo(sx - size * 2, sy + size);
                ctx.lineTo(sx - size * 3, sy + size);
                ctx.lineTo(sx - size * 3, sy - size * 2);
                ctx.lineTo(sx - size * 2, sy - size * 2);
                ctx.lineTo(sx - size * 2, sy - size);
                ctx.lineTo(sx - size * 1, sy - size);
                ctx.lineTo(sx - size * 1, sy - size * 3);
                ctx.lineTo(sx, sy - size * 3);
                ctx.lineTo(sx, sy - size);
                ctx.lineTo(sx + size, sy - size);
                ctx.lineTo(sx + size, sy);
                ctx.closePath();
            } else if (plane.direct == "up") {
                ctx.lineTo(sx, sy - size);                
                ctx.lineTo(sx + size, sy - size);
                ctx.lineTo(sx + size, sy);
                ctx.lineTo(sx + size * 3, sy);
                ctx.lineTo(sx + size * 3, sy + size);
                ctx.lineTo(sx + size * 1, sy + size * 1);
                ctx.lineTo(sx + size * 1, sy + size * 2);
                ctx.lineTo(sx + size * 2, sy + size * 2);
                ctx.lineTo(sx + size * 2, sy + size * 3);
                ctx.lineTo(sx - size, sy + size * 3);
                ctx.lineTo(sx - size, sy + size * 2);
                ctx.lineTo(sx, sy + size * 2);
                ctx.lineTo(sx, sy + size * 1);
                ctx.lineTo(sx - size * 2, sy + size);
                ctx.lineTo(sx - size * 2, sy);
                ctx.closePath();
            } else if (plane.direct == "down") {
                ctx.lineTo(sx + size, sy);
                ctx.lineTo(sx + size, sy - size);
                ctx.lineTo(sx + size * 3, sy - size);
                ctx.lineTo(sx + size * 3, sy - size * 2);
                ctx.lineTo(sx + size * 1, sy - size * 2);
                ctx.lineTo(sx + size * 1, sy - size * 3);
                ctx.lineTo(sx + size * 2, sy - size * 3);
                ctx.lineTo(sx + size * 2, sy - size * 4);
                ctx.lineTo(sx - size, sy - size * 4);
                ctx.lineTo(sx - size, sy - size * 3);
                ctx.lineTo(sx, sy - size * 3);
                ctx.lineTo(sx, sy - size * 2);
                ctx.lineTo(sx - size * 2, sy - size * 2);
                ctx.lineTo(sx - size * 2, sy - size);
                ctx.lineTo(sx, sy - size);
                ctx.closePath();
            }
            
            ctx.fillStyle = plane.color;
            ctx.fill();
            ctx.stroke();

        },
        rotateHandler: function() {
            var canvas = this.$refs.planeLayer;
            var ctx = canvas.getContext("2d");
            var picked = this.planes[this.planes.length - 1];

            var direct = picked.direct;
            switch (direct) {
                case "left":
                    picked.direct = "up";
                    break;
                case "right":
                    picked.direct = "down";
                    break;
                case "up":
                    picked.direct = "right";
                    break;
                case "down":
                    picked.direct = "left";
                    break;
                default:
                    console.log(`Rotate error: ${direct}`);
                    return;
            }
            this.repaintPlane();
            
            let [x, y] = this.posTransform(picked.posX, picked.posY);
            y -= 1;     // 飞机坐标用左下角坐标代替
            
            if(x >= 0 && y >= 0)  // 位置合法
                bus.$emit('plane-pos', [picked.no, x, y, picked.direct]); // 更新一下控制模块的飞机位置
            else    // 位置不合法
                bus.$emit('plane-pos', [picked.no]); // 更新一下控制模块的飞机位置
        },
        // 飞机对象
        Plane: function(x, y, direct, color, no) {
            this.posX = x;
            this.posY = y;
            this.direct = direct; // left right up down
            this.color = color;
            this.no = no;
        }
    }
};
</script>

