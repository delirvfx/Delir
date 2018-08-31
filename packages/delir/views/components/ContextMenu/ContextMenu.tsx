import * as Electron from 'electron'
import * as React from 'react'

import propToDataset from '../../../utils/propToDataset'
import ContextMenuManager from './ContextMenuManager'

export interface MenuItemOption<T = {}> {
    type?: Electron.MenuItemConstructorOptions['type']
    label?: string
    icon?: HTMLImageElement | string
    enabled?: boolean
    visible?: boolean
    checked?: boolean
    submenu?: MenuItemOption[]
    click?: (options: MenuItemOption) => void
    dataset: T
}

// Generics syntax conflicts JSX syntax, so split typedef and implementation
type WrapArrayFunction = <T>(obj: T | T[]) => T[] | undefined
const wrapArray: WrapArrayFunction = (obj) => {
    if (obj == null) return undefined
    return Array.isArray(obj) ? obj : [obj]
}

const toMenuItemJSON = (item: MenuItem): MenuItemOption => {
    const menuItem: MenuItemOption = {
        label: item.props.label,
        type: item.props.type,
        click: item.props.onClick,
        checked: item.props.checked,
        enabled: item.props.enabled == null ? true : item.props.enabled,
        dataset: propToDataset(item.props),
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
    // data-
}

export class MenuItem extends React.Component<MenuItemComponentProps, {}>
{
    public render()
    {
        return null
    }
}

interface ContextMenuProps {
    elementType?: string
}

export class ContextMenu extends React.Component<ContextMenuProps>
{
    public static defaultProps: Partial<ContextMenuProps> = {
        elementType: 'div'
    }

    private root = React.createRef<any>()

    public componentDidMount()
    {
        if (!this.props.children) return

        const items = wrapArray(this.props.children as MenuItem[])

        if (!items) return
        ContextMenuManager.instance.register(this.root.current!.parentElement!, items.map(item => toMenuItemJSON(item)))
    }

    public componentDidUpdate()
    {
        ContextMenuManager.instance.unregister(this.root.current!.parentElement!)

        const items = wrapArray(this.props.children as MenuItem[])

        if (!items) return
        ContextMenuManager.instance.register(this.root.current!.parentElement!, items.map(item => toMenuItemJSON(item)))
    }

    public componentWillUnMount()
    {
        ContextMenuManager.instance.unregister(this.root.current!)
    }

    public render()
    {
        const Element = this.props.elementType!
        return <Element ref={this.root} style={{ display: 'none' }} />
    }
}
