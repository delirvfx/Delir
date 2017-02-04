// @see https://github.com/yahoo/fluxible/blob/master/packages/fluxible-addons-react/connectToStores.js
import * as React from 'react'
import {ReduceStore} from 'flux/utils'

export default function connectToStores(stores: ReduceStore<any, any>[], getStateFromStores: (contest: any, props: any) => {[key: string]: any}) {
    return (Component: typeof React.Component) => (
        class StoreConnector extends React.Component<any, any> {
            _isMounted: boolean
            disposers: Array<{remove: () => void}>

            constructor(props: any, context: any) {
                super(props, context)
                this._isMounted = false
                this.state = this.getStateFromStores()
            }

            componentDidMount = () =>
            {
                this._isMounted = true
                this.disposers = stores.map((Store: ReduceStore<any, any>) => Store.addListener(this.storeStateUpdated))
            }

            componentWillUnmount = () =>
            {
                this._isMounted = false
                this.disposers.forEach(subscription => subscription.remove())
            }

            getStateFromStores = () => {
                return getStateFromStores(null, this.props)
            }

            storeStateUpdated = () =>
            {
                if (this._isMounted) {
                    this.setState(getStateFromStores(null, this.props))
                }
            }

            render()
            {
                return <Component {...this.props} {...this.state} />
            }
        }
    )
}
