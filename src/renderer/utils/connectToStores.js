// @see https://github.com/yahoo/fluxible/blob/master/packages/fluxible-addons-react/connectToStores.js
import React from 'react'

export default function connectToStores(stores: Array<ReduceStore>, getStateFromStores) {
    console.log(stores, getStateFromStores);
    return Component =>
        class StoreConnector extends React.Component {
            disposers: Array<{dispose: Function}>

            constructor(props, context) {
                super(props, context)
                this._isMounted = false
                this.state = this.getStateFromStores()
            }

            componentDidMount = () =>
            {
                this._isMounted = true
                this.disposers = stores.map(Store => Store.addListener(this.storeStateUpdated))
            }

            componentWillUnmount = () =>
            {
                this._isMounted = false
                this.disposers.forEach(disposer => disposer.dispose())
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

            render = () => {
                return <Component {...this.props} {...this.state} />
            }
        }
}
