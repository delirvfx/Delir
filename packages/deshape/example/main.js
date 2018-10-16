import Deshape from '../dist/index'

document.addEventListener('DOMContentLoaded', () => {
    console.log('hi')
    const deshape = window.deshape = new Deshape({ width: 640, height: 360 })
    document.body.appendChild(deshape.root);

    document.querySelectorAll('[data-tool]').forEach(el => {
        el.addEventListener('click', ({currentTarget}) => {
            deshape.tools[currentTarget.dataset.tool]()
        })
    })
})
