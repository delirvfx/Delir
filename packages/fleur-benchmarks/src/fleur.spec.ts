import Fleur, { action, listen, operation, Store } from '@ragg/fleur'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { connectToStores, ContextProp, createElementWithContext, withComponentContext } from '../../fleur-react/src'

describe('benchmark', () => {
    it('Fleur', async () => {
        const incrementAction = action()
        const incrementOperation = operation((ctx) => { ctx.dispatch(incrementAction, {}) })
        class TestStore extends Store<{count: number}> {
            public state = { count: 0 }
            private handleIncrement = listen(incrementAction, (payload) => { this.produce(d => d.count++ ) })
            get count() { return this.state.count }
        }

        const Component = withComponentContext(connectToStores([TestStore], (ctx) => ({ count: ctx.getStore(TestStore).count }))(
            class extends React.Component<{count: number} & ContextProp> {
                public render() {
                    return React.createElement('div', {}, `${this.props.count}`)
                }
            }
        ))

        const app = new Fleur()
        app.registerStore(TestStore)

        const context = app.createContext()
        context.getStore(TestStore)
        const div = document.createElement('div')

        console.time('Fleur')
        for (let count = 1; count < 10000; count++) {
            context.executeOperation(incrementOperation, {})
            await new Promise(r => ReactDOM.render(createElementWithContext(context, Component, {}), div, r))
            expect(div.innerHTML).toBe(`<div>${count}</div>`)
        }
        console.timeEnd('Fleur')
    })
})
