<template>
  <div class="container">
    <canvas ref="mapLayer" id="mapLayer" width="500px" height="500px"></canvas>
    <canvas
      ref="planeLayer"
      id="planeLayer"
      width="900px"
      height="1000px"
    ></canvas>
  </div>
</template>

<script>
export default {
  name: "map",
  mounted: function() {
    this.init();
  },
  data: function() {
    return {
      planes: [],
      gridSize: 50,
      mouse: { x: 0, y: 0 },
      pickedPlane: null
    };
  },
  methods: {
    init: function() {
      this.drawBoard();
      // 初始化飞机
      for (var i = 0; i < 3; i++) {
        var p = new this.Plane(600, 160 + 300 * i, "left", "#39C5BB");
        this.planes.push(p);
        this.drawPlane(p);
      }
      var canvas = this.$refs.planeLayer;
      canvas.addEventListener("mousedown", mouseDownHandler);
      canvas.addEventListener("mousemove", mouseMoveHandler);
      canvas.addEventListener("mouseup", mouseUpHandler);
    },
    mouseDownHandler: function(event) {
      var canvas = this.$refs.planeLayer;
      this.mouse = {
        x: e.clientX - canvas.getBoundingClientRect().left,
        y: e.clientY - canvas.getBoundingClientRect().top
      };
      // 判断点击的图形，获取该对象，并放置在栈顶
      // pickedPlane =

      offset = {
        x: mouse.x - shape.x,
        y: mouse.y - shape.y
      };
    },
    mouseMoveHandler: function(event) {
      if (pickedPlane == null) {
        return;
      }

      var canvas = this.$refs.planeLayer;
      this.mouse = {
        x: e.clientX - canvas.getBoundingClientRect().left,
        y: e.clientY - canvas.getBoundingClientRect().top
      };

      pickedPlane.posX = mouse.x - offset.x;
      pickedPlane.posY = mouse.y - offset.y;

      // 重新绘制
      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < planes.length; i++) {
        this.drawPlane(planes[i]);
      }
    },
    mouseUpHandler: function(event) {
      if (pickedPlane == null) {
        return;
      }
      var canvas = this.$refs.planeLayer;

      // 放置在固定位置

      pickedPlane = null;
    },
    drawBoard: function() {
      var canvas = this.$refs.mapLayer;
      var ctx = canvas.getContext("2d");
      var size = this.gridSize;

      for (var i = 0; i < 11; i++) {
        ctx.strokeStyle = "#D6D1D1";
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
    drawPlane: function(plane) {
      var canvas = this.$refs.planeLayer;
      var ctx = canvas.getContext("2d");
      var [sx, sy] = [plane.posX, plane.posY];
      var size = this.gridSize;

      console.log(sx, sy);

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
        ctx.lineTo(sx + size * 4, sy - 2 * size);
        ctx.lineTo(sx + size * 3, sy - 2 * size);
        ctx.lineTo(sx + size * 3, sy - size);
        ctx.lineTo(sx + size * 2, sy - size);
        ctx.lineTo(sx + size * 2, sy - size * 3);
        ctx.lineTo(sx + size, sy - size * 3);
        ctx.lineTo(sx + size, sy - size);
        ctx.lineTo(sx, sy - size);
        ctx.closePath();
      } else if (plane.direct == "right") {
      } else if (plane.direct == "up") {
      } else if (plane.direct == "down") {
      }
      ctx.stroke();
      ctx.fillStyle = plane.color;
      ctx.fill();
    },
    Plane: function(x, y, direct, color) {
      this.posX = x;
      this.posY = y;
      this.direct = direct; // left right up down
      this.color = color;
    }
  }
};
</script>

<style scoped>
.container {
  position: relative;
}
.container canvas {
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  /* margin: 50px auto; */
  /* box-shadow: -2px -2px 2px #F3F2F2, 5px 5px 5px #6F6767; */
}
</style>

