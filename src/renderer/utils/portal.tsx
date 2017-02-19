import {Component, PropTypes} from 'react'
import * as ReactDOM from 'react-dom'

// export default class Portal extends Component<any, any> {
//     static propTypes = {
//         children: PropTypes.element.isRequired
//     }

//     componentDidMount = () =>
//     {
//         ReactDOM.unstable_renderSubtreeIntoContainer(this, this.props.children, this.root)

//     }

//     componentWillUnmount = () =>
//     {
//         ReactDOM.unmountComponentAtNode(this.root)
//     }

//     render() {
//         return null
//     }
// }

export default class Portal {
    root: Element
    mountedComponent: React.Component<any, any>|null

    static mount(component: JSX.Element)
    {
        const portal = new Portal()
        portal.mount(component)
        return portal
    }

    constructor()
    {
        this.root = document.createElement('div')
    }

    mount(component: JSX.Element): React.Component<any, any>
    {
        document.body.appendChild(this.root)
        this.mountedComponent = ReactDOM.render(component, this.root) as React.Component<any, any>
        return this.mountedComponent
    }

    unmount()
    {
        ReactDOM.unmountComponentAtNode(this.root)
        this.mountedComponent = null
    }
}