import autoBind from "auto-bind";
import valoresIniciales from "src/init/valoresIniciales";
import { PI, PI2 } from "src/constants";
import {
  playButton,
  pauseButton,
  stopButton,
  rangeAmplitud,
  inputAmplitud,
} from "src/controles";
import { establecerValoresInput } from "src/init";

class Canvas {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.context = this.canvas.getContext("2d");

    const { canvas } = this;

    const dpr = window.devicePixelRatio;

    canvas.width = 1000 * dpr;
    canvas.height = 500 * dpr;

    const { width, height } = this.canvas;

    canvas.style.width = `${width / dpr}px`;
    canvas.style.height = `${height / dpr}px`;

    const {
      amplitud,
      frecuencia_angular,
      fase_inicial,
      reproduccionEnCurso,
    } = valoresIniciales;

    this.width = width;
    this.height = height;
    this.amplitud = amplitud;
    this.frecuenciaAngular = frecuencia_angular;
    this.faseInicial = fase_inicial;
    this.reproduccionEnCurso = reproduccionEnCurso;
    this.t = 0;
    this.limite = PI2;
    this.delta = 0.1;
    this.dimensionMasa = 100;

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

    establecerValoresInput();
  }

  controlarSimulacion(evento) {
    let { tipo, valor } = evento.detail;

    valor = parseInt(valor);

    switch (tipo) {
      case "desplazamiento_inicial":
        if(valor > establecerValoresInput || valor < -establecerValoresInput) return
        this.amplitud = valor;
        inputAmplitud.value = valor;
        break;
      case "amplitud":
        if(valor > establecerValoresInput || valor < -establecerValoresInput) return
        this.amplitud = valor;
        rangeAmplitud.value = valor;
        break;
      case "frecuencia_angular":
        this.frecuenciaAngular = valor;
        break;
      case "fase_inicial":
        this.faseInicial = (-1 * valor * PI) / 180;
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

    const { context } = this;

    context.strokeStyle = backSideColor;
    context.lineWidth = lineWidth;
    context.lineJoin = "bevel";
    context.lineCap = "square";
    context.beginPath();
    context.moveTo(xInicial, yInicial);

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
        context.lineTo(xx, yy);
      }
    }

    // finishes off backside actualizarCanvasing, including black -line
    context.lineTo(posicionXActual, yInicial);
    context.lineTo(posicionXActual + offsetPadding, yInicial);
    context.stroke();

    context.strokeStyle = frontSideColor;
    context.lineWidth = lineWidth - 4;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.beginPath();

    // left horizontal bar
    context.moveTo(xInicial - offsetPadding, yInicial);
    context.lineTo(xInicial, yInicial);

    // right horizontal bar
    context.moveTo(posicionXActual, yInicial);
    context.lineTo(posicionXActual + offsetPadding, yInicial);

    for (let i = 0; i <= 1 - step; i += step) {
      // for each winding
      for (let j = 0.25; j <= 0.76; j += 0.01) {
        let xx = xInicial + x * (i + j * step);
        let yy = yInicial + yPathEnd * (i + j * step);
        xx -= Math.sin(j * Math.PI * 2);
        yy += Math.sin(j * Math.PI * 2) * windingHeight;
        if (j === 0.25) {
          context.moveTo(xx, yy);
        } else {
          context.lineTo(xx, yy);
        }
      }
    }
    context.stroke();
  }

  dibujarResorte() {
    const { height: alturaCanvas, x } = this;
    this.actualizarPosicionResorte({
      xInicial: 1,
      yInicial: alturaCanvas / 2 - 50, // 50 es la mitdad el ancho del bloque
      posicionXActual: x,
      windings: 20,
      windingHeight: 15,
      offsetPadding: 0,
      backSideColor: "rgba(0, 0, 0, 0.9)",
      frontSideColor: "gray",
      lineWidth: 9,
    });
  }

  dibujarMasa() {
    const yInitial = 0;
    const { height: alturaCanvas, context, x } = this;
    const y = yInitial + alturaCanvas / 2 - this.dimensionMasa;
    context.save();
    context.fillStyle = "rgba(255, 0, 0, 1)";
    context.lineWidth = 1;
    context.fillStyle = "rgba(0, 0, 0, 0.3)";
    context.strokeRect(x, y, this.dimensionMasa, this.dimensionMasa);
    context.fillRect(x, y, this.dimensionMasa, this.dimensionMasa);
    context.restore();
  }

  dibujarPiso(context, alturaCanvas, anchoCanvas) {
    context.save();
    context.beginPath();
    context.strokeStyle = "black";
    context.moveTo(0, alturaCanvas / 2);
    context.lineTo(anchoCanvas, alturaCanvas / 2);
    context.stroke();
    context.closePath();
    context.restore();
  }

  dibujarPared(context, alturaCanvas) {
    context.save();
    context.lineWidth = 5;
    context.strokeStyle = "black";
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0, alturaCanvas / 2);
    context.stroke();
    context.closePath();
    context.restore();
  }

  dibujarAmplitudes() {
    const { width: anchoCanvas, height: alturaCanvas, context } = this;

    if (this.amplitud === 0) return;

    const amplitudMasX =
      anchoCanvas / 2 + this.amplitud * Math.sign(this.amplitud);

    const amplitudMenosX =
      anchoCanvas / 2 - this.amplitud * Math.sign(this.amplitud);

    context.save();
    context.lineWidth = 0.5;
    context.strokeStyle = "rgba(0, 255, 0, 0.5)";

    context.beginPath();
    context.moveTo(amplitudMasX, 0);
    context.lineTo(amplitudMasX, alturaCanvas - 100 );
    context.stroke();
    context.closePath();

    context.beginPath();
    context.moveTo(amplitudMenosX, 0);
    context.lineTo(amplitudMenosX, alturaCanvas - 100 );
    context.stroke();
    context.closePath();

    context.restore();
  }

  dibujarEjesVerticalesDeAyuda() {
    const { width: anchoCanvas, height: alturaCanvas, context } = this;
    const margen = 100;

    context.save();
    context.lineWidth = 0.1;

    for (let i = anchoCanvas / 2; i < anchoCanvas; i += 100) {
      if (i == anchoCanvas / 2) continue;

      context.strokeStyle = "rgba(0, 0, 0, 0.2)";
      context.beginPath();
      context.moveTo(i, 0 + margen);
      context.lineTo(i, alturaCanvas - margen);
      context.stroke();
    }

    for (let i = anchoCanvas / 2; i > 0; i -= 100) {
      if (i == anchoCanvas / 2) continue;

      context.beginPath();
      context.moveTo(i, 0 + margen);
      context.lineTo(i, alturaCanvas - margen);
      context.stroke();
    }
    context.restore();
  }

  dibujarPuntoEquilibrio() {
    const { width: anchoCanvas, height: alturaCanvas, context } = this;
    const margen = 100;

    context.save();
    context.lineWidth = 1;
    context.strokeStyle = "rgba(0, 0, 0, 0.5)";

    context.beginPath();
    context.setLineDash([10, 10]);
    context.moveTo(anchoCanvas / 2, 0 + margen);
    context.lineTo(anchoCanvas / 2, alturaCanvas - margen);
    context.stroke();
    context.restore();
  }

  dibujarFuncionMovimiento() {
    const {
      width: anchoCanvas,
      height: alturaCanvas,
      context,
      x,
      t,
      amplitud,
      frecuenciaAngular,
      faseInicial,
    } = this;
    const textoNuevo = `x(${t}) = ${amplitud} cos(${frecuenciaAngular} * ${t} + ${faseInicial})`;

    context.save();
    context.font = "32px sans-serif";
    context.fillText(
      `x(t) = \u{0041} cos(\u{03C9}t + \u{03D5})`,
      anchoCanvas / 2 - 200,
      30
    );

    context.fillStyle = "#ffffff"; // or whatever color the background is.
    context.fillText(this.ultimoTexto, anchoCanvas / 2 - 200, 70);
    context.fillStyle = "#000000"; // or whatever color the text should be.
    context.fillText(textoNuevo, anchoCanvas / 2 - 200, 70);
    this.ultimoTexto = textoNuevo;

    context.restore();
  }

  actualizarCanvas() {
    const { width: anchoCanvas, height: alturaCanvas, context } = this;
    const {
      amplitud,
      frecuenciaAngular,
      reproduccionEnCurso,
      faseInicial,
    } = this;

    const tActual = this.t;

    this.dibujarPared(context, alturaCanvas);
    this.dibujarPiso(context, alturaCanvas, anchoCanvas);

    if (this.t > this.limite) this.t = 0;

    this.x =
      amplitud * Math.cos(frecuenciaAngular * this.t + faseInicial) +
      anchoCanvas / 2 -
      this.dimensionMasa / 2;

    this.clearPath();
    this.dibujarMasa();
    this.dibujarResorte();
    this.dibujarPuntoEquilibrio();
    this.dibujarAmplitudes();
    // this.dibujarEjesVerticalesDeAyuda();
    // this.dibujarFuncionMovimiento();

    context.restore();
    requestAnimationFrame(this.actualizarCanvas);

    if (reproduccionEnCurso) {
      this.t += this.delta;
    } else {
      this.t = tActual;
    }
  }

  clearPath() {
    const { width: anchoCanvas, height: alturaCanvas, context } = this;
    context.clearRect(
      5,
      alturaCanvas / 2 - this.dimensionMasa - 10,
      anchoCanvas,
      this.dimensionMasa + 10
    );
  }
}

export default Canvas;
