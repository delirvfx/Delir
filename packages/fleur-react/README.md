# 🌼 fleur-react ⚛️
`@ragg/fleur` connector for React.

## Example
``` tsx
import React from 'react'
import Fleur, { Store, listen, operation, action } from '@ragg/fleur'
import { createElementWithContext, connectToStores, withComponentContext } from '@ragg/fleur-react'

class CountStore extends Store {
    state = { count: 1 }

    private handleIncreaseAciton = listen(increaseAction, { amount }) => {
        this.produce(draft => draft.count += amount )
    })

    public getCount() {
        return this.state.count
    }
}

const increaseAction = action<{ amount: number }>()

const increaseOperation = operation((context, { amount }: { amount: number }) => {
    context.dispatch(increaseAction, { amount })
})

const App = withComponentContext(
connectToStores([CountStore], (context) => ({
    count: context.getStore(CountStore).getCount()
}))(class App extends React.PureComponent {
    private handleCountClick = () => {
        this.props.context.executeOperation(increaseOperation)
    }

    render() {
        return (
            <div onClick={this.handleCountClick}>{this.props.count}</div>
        )
    }
}))

const app = new Fleur({ stores: [ CountStore ] })

const context = app.createContext()
ReactDOM.render(createElementWithContext(context, App, {})
