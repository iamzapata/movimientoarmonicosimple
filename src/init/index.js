import {
  rangeAmplitud,
  inputAmplitud,
  inputFrecuenciaAngular,
  inputFaseInicial,
  playButton,
  pauseButton,
  stopButton,
} from "src/controles";

// Canvas principal donde se dibuja el bloque y resorte.
const canvas = document.getElementById("canvasprincipal");

import valoresIniciales from "src/init/valoresIniciales";

const establecerValoresInput = () => {
  rangeAmplitud.value = valoresIniciales.amplitud_range;
  rangeAmplitud.min = valoresIniciales.amplitud_max * -1;
  rangeAmplitud.max = valoresIniciales.amplitud_max;

  inputAmplitud.value = valoresIniciales.amplitud;
  inputAmplitud.min = valoresIniciales.amplitud_max * -1;
  inputAmplitud.max = valoresIniciales.amplitud_max;

  inputFrecuenciaAngular.value = valoresIniciales.frecuencia_angular;

  inputFaseInicial.value = valoresIniciales.fase_inicial;
  
};

establecerValoresInput();

// {value: "87", name: "desplazamiento_inicial"}
// index.js:37 {value: "2", name: "frecuencia_angular"}
// index.js:37 {value: "1", name: "fase_inicial"}
// index.js:37 {value: "", name: "play"}
// {value: "", name: "pause"}
// index.js:37 {value: "", name: "pause"}


/**
 * 
 * @parametro evento
 * 
 * Cada 
 */
const despacharEvento = (evento) => {
  const { value, name } = evento.currentTarget;

  console.warn({value, name})

  const nuevoEvento = new CustomEvent("controlarCanvas", {
    detail: {
      tipo: name,
      valor: value,
    },
  });

  canvas.dispatchEvent(nuevoEvento);
};

rangeAmplitud.removeEventListener("onChange", rangeAmplitud.onchange);
rangeAmplitud.onchange = (evento) => despacharEvento(evento);

inputAmplitud.removeEventListener("onChange", inputAmplitud.onchange);
inputAmplitud.onchange = (evento) => despacharEvento(evento);

inputFrecuenciaAngular.removeEventListener(
  "onChange",
  inputFrecuenciaAngular.onchange
);
inputFrecuenciaAngular.onchange = (evento) => despacharEvento(evento);

inputFaseInicial.removeEventListener("onChange", inputFaseInicial.onchange);
inputFaseInicial.onchange = (evento) => despacharEvento(evento);

playButton.removeEventListener("onClick", playButton.onclick);
playButton.onclick = (evento) => despacharEvento(evento);

pauseButton.removeEventListener("onClick", pauseButton.onclick);
pauseButton.onclick = (evento) => despacharEvento(evento);

document.removeEventListener("onClick", stopButton.onclick);
stopButton.onclick = (evento) => despacharEvento(evento);

export { establecerValoresInput };
