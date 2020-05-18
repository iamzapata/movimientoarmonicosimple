const rangeAmplitud = document.getElementsByName('amplitud_range')[0]

const inputAmplitud = document.getElementsByName('amplitud_input')[0]

const inputFrecuenciaAngular = document.getElementsByName('frecuencia_angular')[0]

const inputFaseInicial = document.getElementsByName('fase_inicial')[0]

const botonRadioGrados = document.getElementById('grados')

const botonIniciar = document.getElementsByName('iniciar')[0]

const botonPausar = document.getElementsByName('pausar')[0]

const botonParar = document.getElementsByName('parar')[0]

const inputVelocidadAnimacion = document.getElementById('velocidad_animacion_range')

const botonIncrementarRapidez = document.getElementsByName('mas_rapido')[0]

const botonReducirRapidez = document.getElementsByName('mas_lento')[0]


export {
  rangeAmplitud,
  inputAmplitud, 
  inputVelocidadAnimacion,
  botonIncrementarRapidez,
  botonReducirRapidez,
  inputFrecuenciaAngular,
  inputFaseInicial,
  botonRadioGrados,
  botonIniciar,
  botonPausar,
  botonParar
}