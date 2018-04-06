import Fleur from '@ragg/fleur'
import DelirCore from 'delir-core'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

import Test from './components/Test'
import EditorStore from './store/EditorStore'

document.addEventListener('DOMContentLoaded', () => {
    const app = new Fleur()
    app.registerStore(EditorStore)

    const context = app.createContext()

    const div = document.createElement('div')
    document.body.appendChild(div)

    ReactDOM.render(context.createElementWithContext(<Test />), div)
})
