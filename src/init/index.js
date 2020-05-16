import {
  rangeAmplitud,
  inputAmplitud,
  inputFrecuenciaAngular,
  inputFaseInicial,
  botonIniciar,
  botonPausar,
  botonParar,
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

// {value: "", name: "parar"}
// {value: "", name: "pause"}
// {value: "", name: "play"}
// {value: "0", name: "fase_inicial"}
// {value: "1", name: "fase_inicial"}
// {value: "0", name: "frecuencia_angular"}
// {value: "206", name: "amplitud_range"}
// {value: "2", name: "amplitud_input"}


/**
 * 
 * @parametro evento: Contiene un nombre y un valor.
 * 
 * Typos de Eventos:
 * 
 */
const despacharEvento = (evento) => {
  const { name, value } = evento.currentTarget;

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

botonIniciar.removeEventListener("onClick", botonIniciar.onclick);
botonIniciar.onclick = (evento) => despacharEvento(evento);

botonPausar.removeEventListener("onClick", botonPausar.onclick);
botonPausar.onclick = (evento) => despacharEvento(evento);

document.removeEventListener("onClick", botonParar.onclick);
botonParar.onclick = (evento) => despacharEvento(evento);

export { establecerValoresInput };
