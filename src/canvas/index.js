import autoBind from "auto-bind";
import valoresIniciales from "src/init/valoresIniciales";
import { PI2 } from "src/constants";
import {
  playButton,
  pauseButton,
  stopButton,
  rangeAmplitud,
  inputAmplitud,
  inputFrecuenciaAngular,
  inputFaseInicial,
} from "src/controles";

class Canvas {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.context = this.canvas.getContext("2d");
    const { width, height } = this.canvas;
    const {
      amplitud,
      frecuencia_angular,
      fase_inicial,
      reproduccionEnCurso,
      amplificador_amplitud,
    } = valoresIniciales;

    this.width = width;
    this.height = height;
    this.amplitud = amplitud * amplificador_amplitud;
    this.frecuenciaAngular = frecuencia_angular;
    this.faseInicial = fase_inicial;
    this.reproduccionEnCurso = reproduccionEnCurso;
    this.t = 0;
    this.limite = PI2;
    this.delta = 0.05;
    this.boxDimension = 80;

    autoBind(this);

    this.canvas.addEventListener("controlarCanvas", (evento) =>
      this.controlarSimulacion(evento)
    );
  }

  reestablecerValores() {
    const {
      amplitud,
      frecuencia_angular,
      fase_inicial,
      reproduccionEnCurso,
    } = valoresIniciales;

    this.amplitud = amplitud;
    this.frecuenciaAngular = frecuencia_angular;
    this.faseInicial = fase_inicial;
    this.reproduccionEnCurso = reproduccionEnCurso;
    this.t = 0;

    pauseButton.disabled = true;
    stopButton.disabled = true;
    playButton.disabled = false;
    rangeAmplitud.disabled = false;

    this.reproduccionEnCurso = false;
  }

  controlarSimulacion(evento) {
    const { amplificador_amplitud } = valoresIniciales;

    let { tipo, valor } = evento.detail;

    valor = parseInt(valor);

    console.warn({ valor });

    switch (tipo) {
      case "desplazamiento_inicial":
        this.amplitud = valor * amplificador_amplitud;
        inputAmplitud.value = valor;
        break;
      case "amplitud":
        this.amplitud = valor * amplificador_amplitud;
        rangeAmplitud.value = valor;
        break;
      case "frecuencia_angular":
        this.frecuenciaAngular = valor;
        break;
      case "fase_iniacial":
        this.faseInicial = valor;
        break;
      case "play":
        rangeAmplitud.disabled = true;
        stopButton.disabled = false;
        pauseButton.disabled = false;
        playButton.disabled = true;
        this.reproduccionEnCurso = true;
        break;
      case "pause":
        pauseButton.disabled = true;
        playButton.disabled = false;
        rangeAmplitud.disabled = false;
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
    const { height: alturaCanvas } = this;
    this.actualizarPosicionResorte({
      xInicial: 1,
      yInicial: alturaCanvas / 2 - 40,
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
    const { height: alturaCanvas } = this;
    const y = yInitial + alturaCanvas / 2 - this.boxDimension;
    this.context.save();
    this.context.fillStyle = "rgba(255, 0, 0, 1)";
    this.context.lineWidth = 1;
    this.context.fillStyle = "rgba(0, 0, 0, 0.3)";
    this.context.strokeRect(x, y, this.boxDimension, this.boxDimension);
    this.context.fillRect(x, y, this.boxDimension, this.boxDimension);
    this.context.restore();
  }

  dibujarPiso(context, alturaCanvas, anchoCanvas) {
    this.context.save();
    context.beginPath();
    context.strokeStyle = "black";
    context.moveTo(0, alturaCanvas / 2);
    context.lineTo(anchoCanvas - 50, alturaCanvas / 2);
    context.stroke();
    context.closePath();
    this.context.restore();
  }

  dibujarPared(context, alturaCanvas) {
    this.context.save();
    context.lineWidth = 5;
    context.strokeStyle = "black";
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0, alturaCanvas / 2);
    context.stroke();
    context.closePath();
    this.context.restore();
  }

  actualizarCanvas() {
    const { width: anchoCanvas, height: alturaCanvas } = this;
    const {
      amplitud,
      frecuenciaAngular,
      reproduccionEnCurso,
      faseInicial,
    } = this;

    const context = this.context;

    const tActual = this.t;

    const compresionMinima = amplitud + this.springCompressedWidth;

    this.dibujarPared(context, alturaCanvas);
    this.dibujarPiso(context, alturaCanvas, anchoCanvas);

    if (this.t > this.limite) this.t = 0;

    const x =
      amplitud * Math.cos(frecuenciaAngular * this.t + faseInicial) +
      anchoCanvas / 2 -
      this.boxDimension;

    if (reproduccionEnCurso) {
      this.t += this.delta;
    } else {
      this.t = tActual;
    }

    this.clearPath();
    this.dibujarCaja(x, 0);
    this.dibujarResorte(x);

    this.context.restore();
    requestAnimationFrame(this.actualizarCanvas);
  }

  clearPath() {
    const { width: anchoCanvas, height: alturaCanvas } = this;
    this.context.clearRect(
      5,
      alturaCanvas / 2 - this.boxDimension - 10,
      anchoCanvas,
      this.boxDimension + 10
    );
  }
}

export default Canvas;
