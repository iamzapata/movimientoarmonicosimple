import {
  inputAmplitud,
  inputFrecuenciaAngular,
  inputFaseInicial,
  playButton,
  pauseButton,
  stopButton,
} from "src/controles";

const canvas = document.getElementById("canvas");

import valoresIniciales from "src/init/valoresIniciales";

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

inputAmplitud.removeEventListener('onChange', inputAmplitud.onchange)
inputAmplitud.onchange = (evento) => despacharEvento(evento);

inputFrecuenciaAngular.removeEventListener('onChange', inputFrecuenciaAngular.onchange )
inputFrecuenciaAngular.onchange = (evento) => despacharEvento(evento);

inputFaseInicial.removeEventListener('onChange', inputFaseInicial.onchange)
inputFaseInicial.onchange = (evento) => despacharEvento(evento);


const playButtonEvent = (evento) => playButtonEvent(evento); 
playButton.removeEventListener('onClick', playButtonEvent)
playButton.addEventListener('onClick', playButtonEvent)
playButton.onclick = (evento) => despacharEvento(evento);

pauseButton.removeEventListener('onClick', pauseButton.onclick)
pauseButton.onclick = (evento) => despacharEvento(evento);

document.removeEventListener('onClick', stopButton.onclick)
stopButton.onclick = (evento) => despacharEvento(evento);
