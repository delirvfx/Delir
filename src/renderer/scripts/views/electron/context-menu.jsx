import {remote} from 'electron'
import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom';

const {Menu, MenuItem: ElectronMenuItem} = remote

class ContextMenuManager
{
    constructor()
    {
        this.menus = new WeakMap
        window.addEventListener('contextmenu', e => {
            setTimeout(() => {
                let menus = []

                for (let el of e.path) {
                    if (this.menus.has(el)) {
                        menus.push(...this.menus.get(el))
                    }
                }

                const strippedMenus = menus.filter((item, idx) => {
                    if (idx === 0 && item.type === 'separator') { return false}
                    else if (menus[idx - 1] && menus[idx - 1].type === 'separator' && item.type === 'separator') { return false}
                    else if (idx === menus.length - 1 && item.type === 'separator') { return false}
                    else {
                        return true
                    }
                })

                const menu = new Menu
                strippedMenus.forEach(item => menu.append(item))
                Menu.buildFromTemplate(strippedMenus).popup(remote.getCurrentWindow())
            })
        })
    }

    register(el, menu)
    {
        // const el = ReactDOM.findDOMNode(element)
        this.menus.set(el, menu)
    }

    unregister(el)
    {
        this.menus.delete(el)
    }
}

const instance = new ContextMenuManager()

export class MenuItem extends React.Component
{
    static propTypes = {
        label: PropTypes.string,
        type: PropTypes.string,
        enabled: PropTypes.bool,
        onClick: PropTypes.func,
        checked: PropTypes.bool,
        submenu: PropTypes.array,
    }

    render()
    {
        return null
    }
}

export class ContextMenu extends React.Component
{
    componentDidMount()
    {
        const items = Array.isArray(this.props.children) ? this.props.children : [this.props.children]
        instance.register(this.refs.root.parentElement, items.map(item => this.toMenuItem(item)))
    }

    componentWillUnMount()
    {
        instance.unregister(this.refs.root)
    }


    toMenuItem(item)
    {
        return new ElectronMenuItem(this.toMenuItemJSON(item))
    }

    toMenuItemJSON(item)
    {
        const menuItem = {
            label: item.props.label,
            type: item.props.type,
            enabled: item.props.enabled,
            click: item.props.onClick,
            checked: item.props.checked,
        }

        const subItems = Array.isArray(item.props.children) ? item.props.children : [item.props.children]
        if (subItems && subItems.length > 0 && subItems[0] != null) {
            menuItem.submenu = subItems.map(subItem => this.toMenuItemJSON(subItem))
        }

        return menuItem
    }

    render()
    {
        return <div ref='root' style={{display:'none'}} />
    }
}
