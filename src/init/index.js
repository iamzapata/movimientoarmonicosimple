import {
  rangeAmplitud,
  inputAmplitud,
  inputFrecuenciaAngular,
  inputFaseInicial,
  botonRadioGrados,
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
  botonRadioGrados.checked = true

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

// Evento Input - Amplitud Slider
rangeAmplitud.removeEventListener("input", rangeAmplitud.oninput);
rangeAmplitud.oninput = (evento) => despacharEvento(evento);

// Evento Input - Amplitud Númerica
inputAmplitud.removeEventListener("input", inputAmplitud.oninput);
inputAmplitud.oninput = (evento) => despacharEvento(evento);

// Evento Input - Frecuencia Angular Númeria
inputFrecuenciaAngular.removeEventListener(
  "input",
  inputFrecuenciaAngular.oninput
);
inputFrecuenciaAngular.oninput = (evento) => despacharEvento(evento);

// Evento Input Radio - Unidades Frecuencia Angular
document.addEventListener("input", (evento) => {
  if (evento.target.getAttribute("name") == "unidades_fase_inicial") {
    
    const { name, value } = evento.target;

    const nuevoEvento = new CustomEvent("controlarCanvas", {
      detail: {
        tipo: name,
        valor: value,
      },
    });

    canvas.dispatchEvent(nuevoEvento);
  }
});

// Evento Input - Fase Inicial
inputFaseInicial.removeEventListener("input", inputFaseInicial.oninput);
inputFaseInicial.oninput = (evento) => despacharEvento(evento);

// Evento Click - Inciar
botonIniciar.removeEventListener("onClick", botonIniciar.onclick);
botonIniciar.onclick = (evento) => despacharEvento(evento);

// Evento Click - Pausar
botonPausar.removeEventListener("onClick", botonPausar.onclick);
botonPausar.onclick = (evento) => despacharEvento(evento);

// Event Click - Parar
document.removeEventListener("onClick", botonParar.onclick);
botonParar.onclick = (evento) => despacharEvento(evento);

export { establecerValoresInput };
