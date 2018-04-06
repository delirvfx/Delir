import * as React from 'react'
import { StoreClass } from 'Store'
import ComponentContext from '../ComponentContext'
import withComponentContext from './withComponentContext'

type StoreToStateMapper<P, T> = (context: ComponentContext, props: P) => T

interface StoreHandlerProps {
    mapStoresToProps: (...args: any[]) => any
    context: ComponentContext,
    stores: StoreClass[],
    childComponent: React.ComponentClass
}

interface StoreHandlerState {
    childrenProps: any
}

class StoreHandler extends React.PureComponent<StoreHandlerProps, StoreHandlerState> {
    public static getDerivedStateFromProps(nextProps: StoreHandlerProps, prevState: StoreHandlerState): StoreHandlerState {
        return {
            childrenProps: nextProps.mapStoresToProps(nextProps.context, prevState.childrenProps)
        }
    }

    public state: any = { childrenProps: {} }

    public componentDidMount(): any {
        const { context, stores, mapStoresToProps} = this.props

        stores.forEach(store => {
            context.getStore(store).on('onChange', () => {
                this.setState({ childrenProps: mapStoresToProps(context, this.props) })
            })
        })
    }

    public render(): any {
        const { childComponent, context } = this.props
        return React.createElement(childComponent, { context, ...this.state.childrenProps})
    }
}

const connectToStores = <Props, Mapped = {}>(stores: StoreClass[], mapStoresToProps: StoreToStateMapper<Props, Mapped>) => (
    (Component: React.ComponentClass<Props>) => (
        class ConnectToStoreComponent extends React.PureComponent<Exclude<Props, Mapped>> {
            public render() {
                return (
                    React.createElement(withComponentContext(StoreHandler), {
                        mapStoresToProps,
                        stores,
                        childComponent: Component,
                    })
                )
            }
        }
    )
)

export { connectToStores as default }
