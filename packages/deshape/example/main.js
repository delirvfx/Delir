import Deshape from '../dist/index'

document.addEventListener('DOMContentLoaded', () => {
    console.log('hi')
    const deshape = new Deshape({ width: 640, height: 360 })
    document.body.appendChild(deshape.root)
})
