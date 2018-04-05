import Fleur from '@ragg/fleur'
import DelirCore from 'delir-core'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

import Test from './components/Test'

document.addEventListener('DOMContentLoaded', () => {
    const app = new Fleur()
    const context = app.createContext()

    const div = document.createElement('div')
    document.body.appendChild(div)

    ReactDOM.render(context.createElementWithContext(<Test a='a' />), div)
})
