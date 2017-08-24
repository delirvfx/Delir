import * as Electron from 'electron'
import * as React from 'react'
import * as PropTypes from 'prop-types'

import ContextMenuManager from './ContextMenuManager'
import propToDataset from '../../../utils/propToDataset'

export interface MenuItemOption<T = {}> {
    type?: ('normal' | 'separator' | 'submenu' | 'checkbox' | 'radio')
    label?: string
    icon?: HTMLImageElement | string
    enabled?: boolean
    visible?: boolean
    checked?: boolean
    submenu?: MenuItemOption[]
    click?: (props: MenuItemProps) => void
    dataset: T
}

export type MenuItemProps<T = any> = Readonly<MenuItemOption<T>>

// Generics syntax conflicts JSX syntax, so split typedef and implementation
type WrapArrayFunction = <T>(obj: T|T[]) => T[]|undefined
const wrapArray: WrapArrayFunction = (obj) => {
    if (obj == null) return undefined
    return Array.isArray(obj) ? obj : [obj]
}

const toMenuItemJSON = (item: MenuItem): MenuItemOption => {
    const menuItem: MenuItemOption = {
        label: item.props.label,
        type: item.props.type || 'normal',
        click: item.props.onClick,
        checked: item.props.checked,
        dataset: propToDataset(item.props)
    }

    const subItems = wrapArray(item.props.children as MenuItem[])

    if (subItems && subItems.length > 0 && subItems[0] != null) {
        menuItem.submenu = subItems.map(subItem => toMenuItemJSON(subItem))
    }

    return menuItem
}

interface MenuItemComponentProps {
    label?: string
    type?: Electron.MenuItemConstructorOptions['type']
    onClick?: (props: MenuItemOption) => any
    checked?: boolean
    enabled?: boolean
}

export class MenuItem extends React.Component<MenuItemComponentProps, {}>
{
    protected static propTypes = {
        label: PropTypes.string,
        type: PropTypes.string,
        onClick: PropTypes.func,
        checked: PropTypes.bool,
        submenu: PropTypes.array,
    }

    public render()
    {
        return null
    }
}

export class ContextMenu extends React.Component
{
    private root: HTMLDivElement

    public componentDidMount()
    {
        if (!this.props.children) return

        const items = wrapArray(this.props.children as MenuItem[])

        if (!items) return
        ContextMenuManager.instance.register(this.root.parentElement!, items.map(item => toMenuItemJSON(item)))
    }

    public componentWillUnMount()
    {
        ContextMenuManager.instance.unregister(this.root)
    }

    private bindRootElement = (el: HTMLDivElement) => this.root = el

    public render()
    {
        return <div ref={this.bindRootElement} style={{ display: 'none' }} />
    }
}
