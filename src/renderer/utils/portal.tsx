import * as React from 'react'
import * as ReactDOM from 'react-dom'

export default class Portal {
    root: Element
    mounted: boolean = false
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
        if (!this.mounted) {
            document.body.appendChild(this.root)
            this.mounted = true
        }

        this.mountedComponent = ReactDOM.render(component, this.root) as React.Component<any, any>
        return this.mountedComponent
    }

    unmount()
    {
        ReactDOM.unmountComponentAtNode(this.root)
        this.root.parentElement!.removeChild(this.root)
        this.mountedComponent = null
        this.mounted = false
    }
}
