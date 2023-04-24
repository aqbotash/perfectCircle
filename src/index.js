//global vars
var centerBtn = document.getElementById('center-btn');
var span1 = document.getElementById('span1');
var span2 = document.getElementById('span2');
var span3 = document.getElementById('span3');
var span5 = document.getElementById('span5');
var centerX = centerBtn.offsetLeft;
var centerY = centerBtn.offsetTop;


//creating a canvas class
class DrawingCanvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.isDrawing = false;
        this.drawingData = [];
        this.arr = [];
        this.sumOfAngles = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.lastMoveTime = 0;
        this.startPoint = null;
        this.threshold = 7000;
        this.bestScore = 0;
        this.currScore = 0;
        this.color = 'green';
        //invoking EventListeners
        this.canvas.addEventListener("mousedown", this.startDrawing.bind(this));
        this.canvas.addEventListener("mouseup", this.stopDrawing.bind(this));
        this.canvas.addEventListener("mousemove", this.drawLine.bind(this));
        this.canvas.addEventListener("mouseleave", this.warning.bind(this));
        window.addEventListener("resize", this.resizeCanvas.bind(this));
        this.resizeCanvas();
      }
      //mousedown EventHandler
      startDrawing(e) {
        this.isDrawing = true;
        [this.lastX, this.lastY] = [e.clientX, e.clientY];
        this.startPoint = { x: e.clientX, y: e.clientY };
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.arr = [];
        this.drawingData = [];
        this.sumOfAngles = 0;
        this.lastMoveTime = Date.now();
        span5.innerHTML =" ";
      }
       //mousemove EventHandler
       drawLine(e) {
        if (this.isDrawing) {
          var currX = e.offsetX;
          var currY = e.offsetY;
          //check for velocity
          this.velocityCheck();
          //incrementing threshold as number of points grow
          this.threshold+=2;
          //calculates distance form the center and pushes it to the array of distances
          var dist = Math.sqrt((centerX-currX)**2+(centerY-currY)**2)
          this.arr.push(dist);
          this.currScore = this.percentage();
          //check if it is too close to the center
          if(dist<75){
            this.isDrawing = false;
            span5.innerHTML = "TOO CLOSE TO THE CENTER";
            this.currScore = 0;
            console.log("TOO close" + dist);
          }
          //full circle

          //changing line and percentage colors according to the perfectness of the circle
          this.changeLineColor(currX, currY);
          this.changePercentageColor();
          // Define the starting and ending points of the sector's arc
          const endX = e.offsetX, endY = e.offsetY;
          const angleDegrees = this.calculateAngle(endX, endY);
          this.sumOfAngles+=angleDegrees;
          //full circle 
          if((angleDegrees>355&&angleDegrees<360&& this.sumOfAngles>60000)||(angleDegrees<5&&angleDegrees>0&& this.sumOfAngles>60000)) {
          this.stopDrawing();
          }
          //pushing the current properties of current point 
          this.drawingData.push({
            x: currX,
            y: currY,
            windowX: window.innerWidth,
            windowY: window.innerHeight,
            colorCh: this.ctx.strokeStyle,
            lastx:this.lastX,
            lasty:this.lastY  
          });
         [this.lastX, this.lastY] = [e.clientX, e.clientY];
        }
      }
        //mouseup EventHandler 
        stopDrawing() {
            this.isDrawing = false;
            this.startPoint = null;
            if(this.currScore>this.bestScore){
              span5.innerHTML = `New best score: ` + this.currScore;
              this.bestScore = this.currScore;
            }
            else{
              span5.innerHTML = `Best score: ` + this.bestScore;
            }
          }
        //mouseout EventHandler
        warning(){
            this.isDrawing = false;
            if(span5.innerHTML===' '){
              span5.innerHTML = "DRAW A FULL CIRCLE";
              this.currScore = 0;
            }
            this.arr = [];
        }
        calculateAngle(endX, endY){
          const startX = this.startPoint.x, startY = this.startPoint.y
          const startVectorX = startX - centerX;
          const startVectorY = startY - centerY;
          const endVectorX = endX - centerX;
          const endVectorY = endY - centerY;
          const angleRadians = Math.atan2(endVectorY, endVectorX) - Math.atan2(startVectorY, startVectorX);
          let angleDegrees = angleRadians * 180 / Math.PI;
          if (angleDegrees < 0) {
          angleDegrees += 360;
          }
          return angleDegrees;
  }
      //resetting scoreboard
      reset(){
        span1.innerHTML = 'X';
        span1.style.color = 'red'; 
        span2.innerHTML = 'X';
        span2.style.color = 'red';
        span3.innerHTML = 'X';
        span3.style.color = 'red';
      }
      //velocity check method
      velocityCheck(){
        const currTime = Date.now();
        const diff = currTime - this.lastMoveTime;
        if(diff>7000){
          this.isDrawing = false;
          span5.innerHTML = "TOO SLOW";
          this.currScore = 0;
        }
      }
      //percentage getter
      percentage(){
        let std = 0;
        let stdS = 0;
        var firstDist = this.arr[0];
        var per;
        for(let i=0;i<this.arr.length;i++){
             stdS = stdS + ((this.arr[i]-firstDist)**2);
        }
        std = Math.sqrt(stdS/this.arr.length);
        per = Math.abs(100 - (std / firstDist) * 100);
        return parseFloat(per.toFixed(1));
    }
      //changing the color of the line
      changeLineColor(currX, currY){
        var percentageValue = this.percentage.bind(this);
        var percent = percentageValue();
        this.ctx.lineWidth = 5;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.color = `rgb(${255 -(2.55*percent-100)}, ${2.55*percent - 100}, 0)`;
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(currX, currY);
        this.ctx.strokeStyle = this.color;
        this.ctx.stroke();
      }
      //changing the percentage color
      changePercentageColor(){
        var percentageValue = this.percentage.bind(this);
        var percent = percentageValue();
        span1.innerHTML = Math.floor(percent/10);
        span1.style.color = this.color; 
        span2.innerHTML = ((percent*10)%100-(percent*10)%10)/10;
        span2.style.color = this.color;
        span3.innerHTML = (percent*10)%10;
        span3.style.color = this.color;
      }
      resizeCanvas() {
        const currentDrawingData = this.drawingData;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        currentDrawingData.forEach(data => {
          this.ctx.lineWidth = 5;
          this.ctx.lineJoin = 'round';
          this.ctx.lineCap = 'round';
          this.ctx.beginPath();
          this.ctx.moveTo((data.lastx/data.windowX)*window.innerWidth, (data.lasty/data.windowY)*window.innerHeight);
          this.ctx.lineTo((data.x/data.windowX)*window.innerWidth , (data.y/data.windowY)*window.innerHeight);
          this.ctx.strokeStyle = data.colorCh;
          this.ctx.stroke();
        });
        }
}

const canvas = document.getElementById("canvas");
const drawing = new DrawingCanvas(canvas);