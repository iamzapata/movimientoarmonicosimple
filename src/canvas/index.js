import autoBind from "auto-bind";
import valoresIniciales from "src/init/valoresIniciales";
import { PI, PI2, masa, K } from "src/constants";
import {
  botonIniciar,
  botonPausar,
  botonParar,
  rangeAmplitud,
  inputAmplitud,
  inputFaseInicial,
} from "src/controles";
import { establecerValoresInput } from "src/init";


class Canvas {
  constructor() {
    this.canvasPrincipal = document.getElementById("canvasprincipal");
    this.contextPrincipal = this.canvasPrincipal.getContext("2d");

    this.canvasSecundario = document.getElementById("canvassecundario");
    this.contextSecundario = this.canvasSecundario.getContext("2d");

    this.canvasFaseInicial = document.getElementById("canvasfaseinicial");
    this.contextFaseInicial = this.canvasFaseInicial.getContext("2d");

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
    this.unidadesFaseInicial = "grados";
    this.reproduccionEnCurso = reproduccionEnCurso;
    this.t = 0;
    this.limite = PI2;
    this.delta = 0.02; // Increments de 0.02 equivalen aproximadamente a un segundo
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

    document.getElementById("fase_inicial_grados").innerText = 0;
    botonRadioGrados.checked = true;

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

  dibujarAnguloFaseInicial() {
    const {
      canvasFaseInicial: canvas,
      contextFaseInicial: context,
      faseInicial,
    } = this;
    const dpr = window.devicePixelRatio;
    const dimension = 70;

    canvas.width = dimension * dpr;
    canvas.height = dimension * dpr;

    const { width, height } = canvas;

    const centro = width / 2;

    canvas.style.width = `${width / dpr}px`;
    canvas.style.height = `${height / dpr}px`;

    const contrarioAlReloj = Math.sign(faseInicial) === 1;

    // Circunferencia
    context.save();
    context.beginPath();
    context.strokeStyle = "#7a7a7a";
    context.arc(centro, centro, 50, 0, 2 * PI);
    context.stroke();
    context.restore();

    context.save();
    context.beginPath();
    context.fillStyle = `rgba(0, 255, 0, 0.5)`;
    context.moveTo(centro, centro);

    if (contrarioAlReloj) {
      context.arc(centro, centro, 50, 0, -faseInicial, true);
    } else {
      context.arc(centro, centro, 50, -faseInicial, 0, true);
    }

    context.lineTo(centro, centro);
    context.stroke();
    context.strokeStyle = "rgb(0, 255, 0)";
    context.fill();
    context.restore();
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
    context.clearRect(0, 0, anchoCanvas, altoCanvas);
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

  actualizarAmplitudRange(valor) {
    if (
      valor > valoresIniciales.amplitud_max ||
      valor < -valoresIniciales.amplitud_max
    ) {
      const valorLimite = valoresIniciales.amplitud_max * Math.sign(valor);
      inputAmplitud.value = valorLimite;
      this.amplitud = valorLimite;
      this.limpiarAmplitudes();

      return;
    }

    this.amplitud = valor;
    inputAmplitud.value = valor;
    botonIniciar.disabled = false;
    this.limpiarAmplitudes();
  }

  actualizarAmplitudInput(valor) {
    if (
      valor > valoresIniciales.amplitud_max ||
      valor < -valoresIniciales.amplitud_max
    ) {
      const valorLimite = valoresIniciales.amplitud_max * Math.sign(valor);
      inputAmplitud.value = valorLimite;
      this.amplitud = valorLimite;
      this.limpiarAmplitudes();

      return;
    }

    this.amplitud = valor;
    rangeAmplitud.value = valor;
    this.limpiarAmplitudes();
    botonIniciar.disabled = false;
  }

  actualizarFaseInicial(valor) {
    const { unidadesFaseInicial } = this;
    let faseInicial = valor;
    const radianes = (valor * PI) / 180;

    if (!valor) return;

    if (unidadesFaseInicial === "grados") {
      faseInicial = radianes;
    }

    this.faseInicial = faseInicial;

    document.getElementById("fase_inicial_grados").innerText = valor;

    document.getElementById("fase_inicial_radianes").innerText = String(
      parseFloat(radianes.toFixed(2)) * Math.sign(radianes)
    );
  }

  controlarSimulacion(evento) {
    let { tipo, valor } = evento.detail;

    valor = parseFloat(valor);

    switch (tipo) {
      case "amplitud_range":
        this.actualizarAmplitudRange(valor);
        break;
      case "amplitud_input":
        this.actualizarAmplitudInput(valor);
        break;
      case "frecuencia_angular":
        if (valor < 0) return;
        this.frecuenciaAngular = valor;
        break;
      case "fase_inicial":
        this.actualizarFaseInicial(valor);
        break;
      case "unidades_fase_inicial":
        this.unidadesFaseInicial = evento.detail.valor;
        this.actualizarFaseInicial(inputFaseInicial.value);
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

  actualizarValoresCalculados() {
    const { t, frecuenciaAngular, faseInicial, amplitud } = this;

    const frecuencia = ((frecuenciaAngular / 2) * PI)
    const periodo = 1 / frecuencia
    const posicion = amplitud * Math.cos(frecuenciaAngular * t + faseInicial)
    const velocidad = -amplitud * Math.sin(frecuenciaAngular * t + faseInicial)
    const aceleracion = -(Math.pow(this.frecuenciaAngular, 2)) * posicion

    document.getElementById("frecuencia_oscilacion").innerText = frecuencia.toFixed(2)
    document.getElementById("periodo_oscilacion").innerText = periodo.toFixed(2)

    document.getElementById('tiempo_oscilacion').innerText = this.t.toFixed(2)
    document.getElementById("posicion_oscilacion").innerText = posicion.toFixed(2)
    document.getElementById("velocidad_oscilacion").innerText = velocidad.toFixed(2)
    document.getElementById("aceleracion_oscilacion").innerText = aceleracion.toFixed(2)


  }

  calcularPosicion() {
    const { width: anchoCanvas } = this;
    const { t, amplitud, frecuenciaAngular, faseInicial } = this;

    return (
      amplitud * Math.cos(frecuenciaAngular * t + faseInicial) +
      anchoCanvas / 2 -
      this.dimensionMasa / 2
    );
  }

  actualizarCanvas() {
    const { width: anchoCanvas, height: altoCanvas, contextPrincipal } = this;
    const { t, reproduccionEnCurso } = this;

    const tiempoActual = t;

    this.dibujarPared(contextPrincipal, altoCanvas);
    this.dibujarPiso(contextPrincipal, altoCanvas, anchoCanvas);

    this.x = this.calcularPosicion();

    this.limpiarTrayectoriaMasa();
    this.dibujarMasa();
    this.dibujarResorte();
    this.dibujarPuntoEquilibrio();
    this.dibujarAmplitudes();
    this.dibujarAnguloFaseInicial();
    this.actualizarValoresCalculados();

    contextPrincipal.restore();
    requestAnimationFrame(this.actualizarCanvas);

    if (reproduccionEnCurso) {
      this.t += this.delta;
    } else {
      this.t = tiempoActual;
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
