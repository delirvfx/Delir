import * as React from 'react'
import ComponentContextInstance, { ComponentContext } from './ComponentContext';

type StoreToStateMapper<P, T> = (context: ComponentContextInstance, props: P) => T

const connectToStores = <Props, Mapped = {}>(mapStoresToProps: StoreToStateMapper<Props, Mapped>) => (
    (Component: React.ComponentClass<Props>) => (
        class ConnectToStores extends React.PureComponent<Exclude<Props, Mapped>> {
            private renderChildren(context: ComponentContextInstance) {
                return React.createElement(Component, mapStoresToProps(context, this.props))
            }

            public render() {
                return (
                    React.createElement(ComponentContext.Consumer, {
                        children: this.renderChildren
                    })
                )
            }
        }
    )
)

export { connectToStores as default }
