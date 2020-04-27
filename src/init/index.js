import {
  desplazamientoInicial,
  inputAmplitud,
  inputFrecuenciaAngular,
  inputFaseInicial,
  playButton,
  pauseButton,
  stopButton,
} from "src/controles";

const canvas = document.getElementById("canvas");

import valoresIniciales from "src/init/valoresIniciales";

desplazamientoInicial.value = valoresIniciales.desplazamiento_inicial
desplazamientoInicial.min = valoresIniciales.amplitud * -1
desplazamientoInicial.max = valoresIniciales.amplitud

inputAmplitud.value = valoresIniciales.amplitud;

inputFrecuenciaAngular.value = valoresIniciales.frecuencia_angular;

inputFaseInicial.value = valoresIniciales.fase_incial;

const despacharEvento = (evento) => {
  const { value, name } = evento.currentTarget;

  const nuevoEvento = new CustomEvent("controlarCanvas", {
    detail: {
      tipo: name,
      valor: value,
    },
  });

  canvas.dispatchEvent(nuevoEvento);
};


desplazamientoInicial.removeEventListener('onChange', desplazamientoInicial.onchange)
desplazamientoInicial.onchange = (evento) => despacharEvento(evento);

inputAmplitud.removeEventListener('onChange', inputAmplitud.onchange)
inputAmplitud.onchange = (evento) => despacharEvento(evento);

inputFrecuenciaAngular.removeEventListener('onChange', inputFrecuenciaAngular.onchange )
inputFrecuenciaAngular.onchange = (evento) => despacharEvento(evento);

inputFaseInicial.removeEventListener('onChange', inputFaseInicial.onchange)
inputFaseInicial.onchange = (evento) => despacharEvento(evento);

playButton.removeEventListener('onClick', playButton.onclick)
playButton.onclick = (evento) => despacharEvento(evento);

pauseButton.removeEventListener('onClick', pauseButton.onclick)
pauseButton.onclick = (evento) => despacharEvento(evento);

document.removeEventListener('onClick', stopButton.onclick)
stopButton.onclick = (evento) => despacharEvento(evento);
