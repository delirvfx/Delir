import Fleur from '@ragg/fleur'
import { mount } from 'enzyme'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { createElementWithContext } from './createElementWithContext'
import withComponentContext, { ContextProp } from './withComponentContext'

describe('withComponentContext', () => {
    it('Is received context in props', async () => {
        const app = new Fleur()
        const context = app.createContext()
        const Component = withComponentContext(class extends React.Component<ContextProp> { public render() {
            expect(Object.keys(this.props.context)).toEqual(['executeOperation', 'getStore'])
            return null
        } })

        const div = document.createElement('div')
        await new Promise (resolve => {
            const component = ReactDOM.render(createElementWithContext(context, Component), div, resolve)
        })

        // TODO: Wait for React 16 suppors in Enzyme
        // expect(mount(createElementWithContext(context, Component, {})).props).toMatchObject({ context: context.componentContext })
    })
})
