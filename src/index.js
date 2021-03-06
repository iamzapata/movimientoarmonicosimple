import 'styles/index.css'
import 'src/init'
import Canvas from 'src/canvas'

if (process.env.NODE_ENV === 'development') {
  require('../dist/index.html')
  require('../src/styles/index.css')
}

(function init() {
  const canvas = new Canvas()
  canvas.actualizarCanvas()
})()