import Fleur from '@ragg/fleur'
import { createElementWithContext } from '@ragg/fleur-react'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

import Test from './components/Test'
import EditorStore from './store/EditorStore'
import RendererStore from './store/RendererStore'

import './global.sass'

document.addEventListener('DOMContentLoaded', () => {
    const app = new Fleur({
        stores: [ EditorStore, RendererStore ]
    })

    const context = app.createContext()

    const div = document.createElement('div')
    document.body.appendChild(div)

    ReactDOM.render(createElementWithContext(context, Test, {}), div)
})
