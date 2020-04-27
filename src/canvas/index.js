import autoBind from "auto-bind";
import valoresIniciales from "src/init/valoresIniciales";
import { PI2 } from "src/constants";
import {
  playButton,
  pauseButton,
  stopButton,
} from "src/controles";

class Canvas {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.context = this.canvas.getContext("2d");
    const { width, height } = this.canvas;
    const {
      amplitud,
      frecuencia_angular,
      faseInicial,
      reproduccionEnCurso,
    } = valoresIniciales;

    this.width = width;
    this.height = height;
    this.amplitud = amplitud;
    this.frecuenciaAngular = frecuencia_angular;
    this.faseInicial = faseInicial;
    this.reproduccionEnCurso = reproduccionEnCurso;
    this.t = 0;
    this.limit = PI2;
    this.delta = 0.1;
    this.boxDimension = 80;
    this.springCompressedWidth = 160;

    autoBind(this);

    this.canvas.addEventListener("controlarCanvas", (evento) =>
      this.controlarSimulacion(evento)
    );
  }

  reestablecerValores() {
    const {
      amplitud,
      frecuencia_angular,
      faseInicial,
      reproduccionEnCurso,
    } = valoresIniciales;

    
    this.amplitud = amplitud;
    this.frecuenciaAngular = frecuencia_angular;
    this.faseInicial = faseInicial;
    this.reproduccionEnCurso = reproduccionEnCurso;

    playButton.disabled = false
    pauseButton.disabled = true
    stopButton.disabled = true
    this.reproduccionEnCurso = false;
  }

  controlarSimulacion(evento) {
    const { tipo, valor } = evento.detail;
    console.warn({ tipo, valor });
    switch (tipo) {
      case "amplitud":
        this.amplitud = parseInt(valor);
        break;
      case "frecuencia_angular":
        this.frecuenciaAngular = parseInt(valor);
        break;
      case "fase_iniacial":
        this.faseInicial = parseInt(valor);
        break;
      case "play":
        stopButton.disabled = false
        pauseButton.disabled = false;
        playButton.disabled = true;
        this.reproduccionEnCurso = true;
        break;
      case "pause":
        pauseButton.disabled = true;
        playButton.disabled = false;
        this.reproduccionEnCurso = false;
        break;
      case "stop":
        this.reestablecerValores()
      default:
        null;
    }
  }

  drawHelpGrid() {
    const { width: canvasWidth, height: canvasHeight } = this;
    for (let x = 0; x <= canvasWidth; x += this.boxDimension) {
      this.context.moveTo(0.5 + x, 0);
      this.context.lineTo(0.5 + x, canvasHeight - 20);
    }

    for (let x = 0; x <= canvasHeight; x += this.boxDimension) {
      this.context.moveTo(0, 0.5 + x);
      this.context.lineTo(canvasWidth - 40, 0.5 + x);
    }
    this.context.lineWidth = 1;
    this.context.strokeStyle = "black";
    this.context.stroke();
  }

  drawSpring({
    initialX,
    initialY,
    currentXPosition,
    windings,
    windingHeight,
    offsetPadding,
    backSideColor,
    frontSideColor,
    lineWidth,
  }) {
    // step size has to be inversely proportionate to the windings
    const step = 1 / windings;

    this.context.strokeStyle = backSideColor;
    this.context.lineWidth = lineWidth;
    this.context.lineJoin = "bevel";
    this.context.lineCap = "square";
    this.context.beginPath();
    this.context.moveTo(initialX, initialY);

    initialX += offsetPadding;
    currentXPosition -= offsetPadding;
    let x = currentXPosition - initialX;
    let yPathEnd = 0; //initialY - initialY

    for (let i = 0; i <= 1 - step; i += step) {
      // for each winding
      for (let j = 0; j < 1; j += step) {
        let xx = initialX + x * (i + j * step);
        let yy = initialY;
        xx -= Math.sin(j * Math.PI * 2);
        yy += Math.sin(j * Math.PI * 2) * windingHeight;
        this.context.lineTo(xx, yy);
      }
    }

    // finishes off backside drawing, including black -line
    this.context.lineTo(currentXPosition, initialY);
    this.context.lineTo(currentXPosition + offsetPadding, initialY);
    this.context.stroke();

    this.context.strokeStyle = frontSideColor;
    this.context.lineWidth = lineWidth - 4;
    this.context.lineJoin = "round";
    this.context.lineCap = "round";
    this.context.beginPath();

    // left horizontal bar
    this.context.moveTo(initialX - offsetPadding, initialY);
    this.context.lineTo(initialX, initialY);

    // right horizontal bar
    this.context.moveTo(currentXPosition, initialY);
    this.context.lineTo(currentXPosition + offsetPadding, initialY);

    for (let i = 0; i <= 1 - step; i += step) {
      // for each winding
      for (let j = 0.25; j <= 0.76; j += 0.01) {
        let xx = initialX + x * (i + j * step);
        let yy = initialY + yPathEnd * (i + j * step);
        xx -= Math.sin(j * Math.PI * 2);
        yy += Math.sin(j * Math.PI * 2) * windingHeight;
        if (j === 0.25) {
          this.context.moveTo(xx, yy);
        } else {
          this.context.lineTo(xx, yy);
        }
      }
    }
    this.context.stroke();
  }

  displaySpring(x) {
    /*this.context.setTransform(1, 0, 0, 1, 0, 0) // reset transform
    this.context.globalAlpha = 1 // reset alpha
    this.context.lineWidth = 1*/

    const { height: canvasHeight } = this;
    this.drawSpring({
      initialX: 1,
      initialY: canvasHeight / 2 - 40,
      currentXPosition: x,
      windings: 15,
      windingHeight: 15,
      offsetPadding: 5,
      backSideColor: "rgba(0, 0, 0, 0.9)",
      frontSideColor: "gray",
      lineWidth: 9,
    });
  }

  drawBox(x, yInitial) {
    const { height: canvasHeight } = this;
    this.context.fillStyle = "rgba(255, 0, 0, 1)";
    const y = yInitial + canvasHeight / 2 - this.boxDimension;

    //this.draGreenBackground(x, y, this.boxDimension)

    this.context.strokeStyle = "black";
    this.context.lineWidth = 1;
    this.context.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.context.strokeRect(x, y, this.boxDimension, this.boxDimension);
    this.context.fillRect(x, y, this.boxDimension, this.boxDimension);
  }

  draGreenBackground() {
    const { width: canvasWidth, height: canvasHeight } = this;
    this.context.fillStyle = "rgba(0, 255, 0, 1)";
    this.context.fillRect(
      1,
      canvasHeight / 2 - this.boxDimension,
      canvasWidth - this.boxDimension / 2,
      this.boxDimension
    );
  }

  drawFloor(context, canvasHeight, canvasWidth) {
    context.beginPath();
    context.moveTo(0, canvasHeight / 2);
    context.lineTo(canvasWidth - 50, canvasHeight / 2);
    context.stroke();
    context.closePath();
  }

  drawWall(context, canvasHeight) {
    context.lineWidth = 5;
    context.strokeStyle = "black";
    context.beginPath();
    context.moveTo(0, 1);
    context.lineTo(0, canvasHeight / 2);
    context.stroke();
    context.closePath();
  }

  draw() {
    const { width: canvasWidth, height: canvasHeight } = this;

    const context = this.context;

    const currentT = this.t;

    this.drawWall(context, canvasHeight);
    this.drawFloor(context, canvasHeight, canvasWidth);

    const { amplitud, frecuenciaAngular, reproduccionEnCurso } = this;

    if (this.t > this.limit) this.t = 1;

    const x =
      amplitud * Math.cos(frecuenciaAngular * this.t) +
      amplitud +
      this.springCompressedWidth;

    if (reproduccionEnCurso) {
      this.t += this.delta;
    } else {
      this.t = currentT;
    }

    this.clearPath();
    this.drawBox(x, -1);
    this.displaySpring(x);

    this.context.restore();
    requestAnimationFrame(this.draw);
  }

  clearPath() {
    const { width: canvasWidth, height: canvasHeight } = this;
    this.context.clearRect(
      5,
      canvasHeight / 2 - this.boxDimension - 5,
      canvasWidth,
      this.boxDimension
    );
  }
}

export default Canvas;
