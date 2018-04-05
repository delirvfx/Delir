import * as React from 'react'
import ComponentContext from '../ComponentContext'
import ComponentContextProvider from './ComponentContextProvider'

type StoreToStateMapper<P, T> = (context: ComponentContext<any>, props: P) => T

const connectToStores = <Props, Mapped = {}>(mapStoresToProps: StoreToStateMapper<Props, Mapped>) => (
    (Component: React.ComponentClass<Props>) => (
        class ConnectToStoreComponent extends React.PureComponent<Exclude<Props, Mapped>> {
            public render() {
                return (
                    React.createElement(ComponentContextProvider.Consumer, {
                        children: this.renderChildren
                    })
                )
            }

            private renderChildren(context: ComponentContext): React.ReactChild {
                return React.createElement(Component, mapStoresToProps(context, this.props))
            }
        }
    )
)

export { connectToStores as default }
