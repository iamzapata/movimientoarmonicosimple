import autoBind from "auto-bind";
import valoresIniciales from "src/init/valoresIniciales";
import { PI, PI2 } from "src/constants";
import {
  botonIniciar,
  botonPausar,
  botonParar,
  rangeAmplitud,
  inputAmplitud,
} from "src/controles";
import { establecerValoresInput } from "src/init";

class Canvas {
  constructor() {
    this.canvasPrincipal = document.getElementById("canvasprincipal");
    this.contextPrincipal = this.canvasPrincipal.getContext("2d");

    this.canvasSecundario = document.getElementById("canvassecundario");
    this.contextSecundario = this.canvasSecundario.getContext("2d");

    this.organizarResolucion(this.canvasPrincipal);
    this.organizarResolucion(this.canvasSecundario);

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
    this.limite = PI2;
    this.delta = 0.1;
    this.dimensionMasa = 100;

    autoBind(this);

    this.canvasPrincipal.addEventListener("controlarCanvas", (evento) =>
      this.controlarSimulacion(evento)
    );
  }

  organizarResolucion(canvas) {
    const dpr = window.devicePixelRatio;

    canvas.width = 1000 * dpr;
    canvas.height = 500 * dpr;

    const { width, height } = canvas;

    this.width = width;
    this.height = height;

    canvas.style.width = `${width / dpr}px`;
    canvas.style.height = `${height / dpr}px`;
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

    botonPausar.disabled = true;
    botonParar.disabled = true;
    botonIniciar.disabled = false;
    rangeAmplitud.disabled = false;

    this.reproduccionEnCurso = false;

    establecerValoresInput();
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

    const { contextPrincipal } = this;

    contextPrincipal.strokeStyle = backSideColor;
    contextPrincipal.lineWidth = lineWidth;
    contextPrincipal.lineJoin = "bevel";
    contextPrincipal.lineCap = "square";
    contextPrincipal.beginPath();
    contextPrincipal.moveTo(xInicial, yInicial);

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
        contextPrincipal.lineTo(xx, yy);
      }
    }

    // finishes off backside actualizarCanvasing, including black -line
    contextPrincipal.lineTo(posicionXActual, yInicial);
    contextPrincipal.lineTo(posicionXActual + offsetPadding, yInicial);
    contextPrincipal.stroke();

    contextPrincipal.strokeStyle = frontSideColor;
    contextPrincipal.lineWidth = lineWidth - 4;
    contextPrincipal.lineJoin = "round";
    contextPrincipal.lineCap = "round";
    contextPrincipal.beginPath();

    // left horizontal bar
    contextPrincipal.moveTo(xInicial - offsetPadding, yInicial);
    contextPrincipal.lineTo(xInicial, yInicial);

    // right horizontal bar
    contextPrincipal.moveTo(posicionXActual, yInicial);
    contextPrincipal.lineTo(posicionXActual + offsetPadding, yInicial);

    for (let i = 0; i <= 1 - step; i += step) {
      // for each winding
      for (let j = 0.25; j <= 0.76; j += 0.01) {
        let xx = xInicial + x * (i + j * step);
        let yy = yInicial + yPathEnd * (i + j * step);
        xx -= Math.sin(j * Math.PI * 2);
        yy += Math.sin(j * Math.PI * 2) * windingHeight;
        if (j === 0.25) {
          contextPrincipal.moveTo(xx, yy);
        } else {
          contextPrincipal.lineTo(xx, yy);
        }
      }
    }
    contextPrincipal.stroke();
  }

  dibujarResorte() {
    const { height: altoCanvas, x } = this;
    this.actualizarPosicionResorte({
      xInicial: 1,
      yInicial: altoCanvas / 2 - 50, // 50 es la mitdad el ancho del bloque
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
    const { height: altoCanvas, contextPrincipal, x } = this;
    const y = yInitial + altoCanvas / 2 - this.dimensionMasa;
    contextPrincipal.save();
    contextPrincipal.fillStyle = "rgba(255, 0, 0, 1)";
    contextPrincipal.lineWidth = 1;
    contextPrincipal.fillStyle = "rgba(0, 0, 0, 0.3)";
    contextPrincipal.strokeRect(x, y, this.dimensionMasa, this.dimensionMasa);
    contextPrincipal.fillRect(x, y, this.dimensionMasa, this.dimensionMasa);
    contextPrincipal.restore();
  }

  dibujarPiso(contextPrincipal, altoCanvas, anchoCanvas) {
    contextPrincipal.save();
    contextPrincipal.beginPath();
    contextPrincipal.strokeStyle = "black";
    contextPrincipal.moveTo(0, altoCanvas / 2);
    contextPrincipal.lineTo(anchoCanvas, altoCanvas / 2);
    contextPrincipal.stroke();
    contextPrincipal.closePath();
    contextPrincipal.restore();
  }

  dibujarPared(contextPrincipal, altoCanvas) {
    contextPrincipal.save();
    contextPrincipal.lineWidth = 5;
    contextPrincipal.strokeStyle = "black";
    contextPrincipal.beginPath();
    contextPrincipal.moveTo(0, 0);
    contextPrincipal.lineTo(0, altoCanvas / 2);
    contextPrincipal.stroke();
    contextPrincipal.closePath();
    contextPrincipal.restore();
  }

  dibujarAmplitudes() {
    const {
      width: anchoCanvas,
      height: altoCanvas,
      contextSecundario: context,
    } = this;

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
    context.lineTo(amplitudMasX, altoCanvas - 100);
    context.stroke();
    context.closePath();

    context.beginPath();
    context.moveTo(amplitudMenosX, 0);
    context.lineTo(amplitudMenosX, altoCanvas - 100);
    context.stroke();
    context.closePath();

    context.restore();
  }

  limpiarAmplitudes() {
    const {
      width: anchoCanvas,
      height: altoCanvas,
      contextSecundario: context,
    } = this;
    context.clearRect(
      0,
      0,
      anchoCanvas,
      altoCanvas
    );
  }

  dibujarPuntoEquilibrio() {
    const {
      width: anchoCanvas,
      height: altoCanvas,
      contextSecundario: context,
    } = this;
    const margen = 100;

    context.save();
    context.lineWidth = 1;
    context.strokeStyle = "rgba(0, 0, 0, 0.5)";

    context.beginPath();
    context.setLineDash([10, 10]);
    context.moveTo(anchoCanvas / 2, 0 + margen);
    context.lineTo(anchoCanvas / 2, altoCanvas - margen);
    context.stroke();
    context.restore();
  }

  dibujarEjesVerticalesDeAyuda() {
    const { width: anchoCanvas, height: altoCanvas, contextPrincipal } = this;
    const margen = 100;

    contextPrincipal.save();
    contextPrincipal.lineWidth = 0.1;

    for (let i = anchoCanvas / 2; i < anchoCanvas; i += 100) {
      if (i == anchoCanvas / 2) continue;

      contextPrincipal.strokeStyle = "rgba(0, 0, 0, 0.2)";
      contextPrincipal.beginPath();
      contextPrincipal.moveTo(i, 0 + margen);
      contextPrincipal.lineTo(i, altoCanvas - margen);
      contextPrincipal.stroke();
    }

    for (let i = anchoCanvas / 2; i > 0; i -= 100) {
      if (i == anchoCanvas / 2) continue;

      contextPrincipal.beginPath();
      contextPrincipal.moveTo(i, 0 + margen);
      contextPrincipal.lineTo(i, altoCanvas - margen);
      contextPrincipal.stroke();
    }
    contextPrincipal.restore();
  }

  dibujarFuncionMovimiento() {
    const {
      width: anchoCanvas,
      height: altoCanvas,
      contextPrincipal,
      x,
      t,
      amplitud,
      frecuenciaAngular,
      faseInicial,
    } = this;
    const textoNuevo = `x(${t}) = ${amplitud} cos(${frecuenciaAngular} * ${t} + ${faseInicial})`;

    contextPrincipal.save();
    contextPrincipal.font = "32px sans-serif";
    contextPrincipal.fillText(
      `x(t) = \u{0041} cos(\u{03C9}t + \u{03D5})`,
      anchoCanvas / 2 - 200,
      30
    );

    contextPrincipal.fillStyle = "#ffffff"; // or whatever color the background is.
    contextPrincipal.fillText(this.ultimoTexto, anchoCanvas / 2 - 200, 70);
    contextPrincipal.fillStyle = "#000000"; // or whatever color the text should be.
    contextPrincipal.fillText(textoNuevo, anchoCanvas / 2 - 200, 70);
    this.ultimoTexto = textoNuevo;

    contextPrincipal.restore();
  }

  controlarSimulacion(evento) {
    let { tipo, valor } = evento.detail;

    valor = parseInt(valor);

    switch (tipo) {
      case "amplitud_range":
        if (valor > establecerValoresInput || valor < -establecerValoresInput)
          return;
        this.amplitud = valor;
        inputAmplitud.value = valor;
        this.limpiarAmplitudes();
        break;
      case "amplitud_input":
        if (valor > establecerValoresInput || valor < -establecerValoresInput)
          return;
        this.amplitud = valor;
        rangeAmplitud.value = valor;
        break;
      case "frecuencia_angular":
        this.frecuenciaAngular = valor;
        break;
      case "fase_inicial":
        this.faseInicial = (-1 * valor * PI) / 180;
        break;
      case "iniciar":
        rangeAmplitud.disabled = true;
        botonParar.disabled = false;
        botonPausar.disabled = false;
        botonIniciar.disabled = true;
        this.reproduccionEnCurso = true;
        break;
      case "pausar":
        botonPausar.disabled = true;
        botonIniciar.disabled = false;
        rangeAmplitud.disabled = false;
        this.reproduccionEnCurso = false;
        break;
      case "parar":
        this.reestablecerValores();
        this.limpiarAmplitudes();
        break;
      default:
        null;
    }
  }

  actualizarCanvas() {
    const { width: anchoCanvas, height: altoCanvas, contextPrincipal } = this;
    const {
      amplitud,
      frecuenciaAngular,
      reproduccionEnCurso,
      faseInicial,
    } = this;

    const tActual = this.t;

    this.dibujarPared(contextPrincipal, altoCanvas);
    this.dibujarPiso(contextPrincipal, altoCanvas, anchoCanvas);

    if (this.t > this.limite) this.t = 0;

    this.x =
      amplitud * Math.cos(frecuenciaAngular * this.t + faseInicial) +
      anchoCanvas / 2 -
      this.dimensionMasa / 2;

    this.limpiarTrayectoriaMasa();
    this.dibujarMasa();
    this.dibujarResorte();
    this.dibujarPuntoEquilibrio();
    this.dibujarAmplitudes();
    // this.dibujarEjesVerticalesDeAyuda();
    // this.dibujarFuncionMovimiento();

    contextPrincipal.restore();
    requestAnimationFrame(this.actualizarCanvas);

    if (reproduccionEnCurso) {
      this.t += this.delta;
    } else {
      this.t = tActual;
    }
  }

  limpiarTrayectoriaMasa() {
    const {
      width: anchoCanvas,
      height: altoCanvas,
      contextPrincipal: context,
    } = this;
    context.clearRect(
      5,
      altoCanvas / 2 - this.dimensionMasa - 10,
      anchoCanvas,
      this.dimensionMasa + 10
    );
  }
}

export default Canvas;
