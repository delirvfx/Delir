import Fleur, { action, ComponentContext, listen, operation, Store } from '@ragg/fleur'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

import connectToStores from './connectToStores'
import { createElementWithContext } from './createElementWithContext'

describe('connectToStores', () => {
    it('Should map stores to props', async () => {
        let countOfProp: number

        // Action Identifier
        const ident = action<{increase: number}>()

        // Operation
        const op = operation((context) => { context.dispatch(ident, { increase: 10 }) })

        // Store
        const TestStore = class extends Store<{count: number}> {
            public state = { count: 10 }

            get count() { return this.state.count }

            private increase = listen(ident, (payload) => {
                this.updateWith(d => d.count += payload.increase)
            })
        }

        // Component
        const Component = connectToStores([TestStore], (context: ComponentContext, ) => ({
            count: context.getStore(TestStore).count
        }))(class extends React.Component<{count: number}> {
            public render() {
                countOfProp = this.props.count
                return null
            }
        })

        // App
        const app = new Fleur()

        app.registerStore(TestStore)
        const context = app.createContext()

        const div = document.createElement('div')
        await new Promise(r => ReactDOM.render(createElementWithContext(context, Component, {}), div, r))

        expect(countOfProp).toBe(10)
        context.executeOperation(op, {})
        expect(countOfProp).toBe(20)
    })
})
