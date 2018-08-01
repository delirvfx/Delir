// @see https://github.com/yahoo/fluxible/blob/master/packages/fluxible-addons-react/connectToStores.js
import { ReduceStore } from 'flux/utils'
import * as React from 'react'

export default function connectToStores(
    stores: ReduceStore<any, any>[],
    getStateFromStores: (context: any, props: any) => {[key: string]: any}
) {
    return <T extends React.ComponentClass<any>>(Component: T) => (
        class StoreConnector extends React.Component<any, any> {
            public _isMounted: boolean
            public disposers: Array<{remove: () => void}>

            constructor(props: any, context: any) {
                super(props, context)
                this._isMounted = false
                this.state = this.getStateFromStores()
            }

            public componentDidMount = () =>
            {
                this._isMounted = true
                this.disposers = stores.map((Store: ReduceStore<any, any>) => Store.addListener(this.storeStateUpdated))
            }

            public componentWillUnmount = () =>
            {
                this._isMounted = false
                this.disposers.forEach(subscription => subscription.remove())
            }

            public getStateFromStores = () => {
                return getStateFromStores(null, this.props)
            }

            public storeStateUpdated = () =>
            {
                if (this._isMounted) {
                    this.setState(getStateFromStores(null, this.props))
                }
            }

            public render()
            {
                return <Component {...this.props} {...this.state} />
            }
        }
    )
}
