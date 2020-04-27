import autoBind from "auto-bind";
import valoresIniciales from "src/init/valoresIniciales";
import { PI2 } from "src/constants";
import { playButton, pauseButton, stopButton } from "src/controles";

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
    this.t = 0;

    playButton.disabled = false;
    pauseButton.disabled = true;
    stopButton.disabled = true;
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
        stopButton.disabled = false;
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
        this.reestablecerValores();
        break;
      default:
        null;
    }
  }

  actualizarPosicionResorte({
    xInicial,
    yInicial,
    posicionXActual,
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
    this.context.moveTo(xInicial, yInicial);

    xInicial += offsetPadding;
    posicionXActual -= offsetPadding;
    let x = posicionXActual - xInicial;
    let yPathEnd = 0; //yInicial - yInicial

    for (let i = 0; i <= 1 - step; i += step) {
      // for each winding
      for (let j = 0; j < 1; j += step) {
        let xx = xInicial + x * (i + j * step);
        let yy = yInicial;
        xx -= Math.sin(j * Math.PI * 2);
        yy += Math.sin(j * Math.PI * 2) * windingHeight;
        this.context.lineTo(xx, yy);
      }
    }

    // finishes off backside actualizarCanvasing, including black -line
    this.context.lineTo(posicionXActual, yInicial);
    this.context.lineTo(posicionXActual + offsetPadding, yInicial);
    this.context.stroke();

    this.context.strokeStyle = frontSideColor;
    this.context.lineWidth = lineWidth - 4;
    this.context.lineJoin = "round";
    this.context.lineCap = "round";
    this.context.beginPath();

    // left horizontal bar
    this.context.moveTo(xInicial - offsetPadding, yInicial);
    this.context.lineTo(xInicial, yInicial);

    // right horizontal bar
    this.context.moveTo(posicionXActual, yInicial);
    this.context.lineTo(posicionXActual + offsetPadding, yInicial);

    for (let i = 0; i <= 1 - step; i += step) {
      // for each winding
      for (let j = 0.25; j <= 0.76; j += 0.01) {
        let xx = xInicial + x * (i + j * step);
        let yy = yInicial + yPathEnd * (i + j * step);
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

  dibujarResorte(x) {
    const { height: canvasHeight } = this;
    this.actualizarPosicionResorte({
      xInicial: 1,
      yInicial: canvasHeight / 2 - 40,
      posicionXActual: x,
      windings: 20,
      windingHeight: 15,
      offsetPadding: 5,
      backSideColor: "rgba(0, 0, 0, 0.9)",
      frontSideColor: "gray",
      lineWidth: 9,
    });
  }

  dibujarCaja(x, yInitial) {
    const { height: canvasHeight } = this;
    const y = yInitial + canvasHeight / 2 - this.boxDimension;
    this.context.save();
    this.context.fillStyle = "rgba(255, 0, 0, 1)";
    this.context.lineWidth = 1;
    this.context.fillStyle = "rgba(0, 0, 0, 0.3)";
    this.context.strokeRect(x, y, this.boxDimension, this.boxDimension);
    this.context.fillRect(x, y, this.boxDimension, this.boxDimension);
    this.context.restore();
  }

  dibujarPiso(context, canvasHeight, canvasWidth) {
    this.context.save();
    context.beginPath();
    context.strokeStyle = "black";
    context.moveTo(0, canvasHeight / 2);
    context.lineTo(canvasWidth - 50, canvasHeight / 2);
    context.stroke();
    context.closePath();
    this.context.restore();
  }

  dibujarPared(context, canvasHeight) {
    this.context.save();
    context.lineWidth = 5;
    context.strokeStyle = "black";
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0, canvasHeight / 2);
    context.stroke();
    context.closePath();
    this.context.restore();
  }

  actualizarCanvas() {
    const { width: canvasWidth, height: canvasHeight } = this;
    const { amplitud, frecuenciaAngular, reproduccionEnCurso } = this;

    const context = this.context;

    const currentT = this.t;

    this.dibujarPared(context, canvasHeight);
    this.dibujarPiso(context, canvasHeight, canvasWidth);

    if (this.t > this.limit) this.t = 0;

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
    this.dibujarCaja(x, 0);
    this.dibujarResorte(x);

    this.context.restore();
    requestAnimationFrame(this.actualizarCanvas);
  }

  clearPath() {
    const { width: canvasWidth, height: canvasHeight } = this;
    this.context.clearRect(
      5,
      canvasHeight / 2 - this.boxDimension - 10,
      canvasWidth,
      this.boxDimension + 10
    );
  }
}

export default Canvas;
