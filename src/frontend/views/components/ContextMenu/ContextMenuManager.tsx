import * as React from 'react'
import * as classnames from 'classnames'
import * as Electron from 'electron'

import Portal from '../../../modules/Portal'
import { MenuItem, MenuItemOption } from './ContextMenu'

import * as s from './ContextMenu.styl'

export const buildMenuElements = (items: MenuItemOption[]): JSX.Element => {
    return (
        <ul className={s.list}>
            {items.map((menu, idx) => {

                switch (menu.type) {
                    case 'separator':
                        return <hr className={classnames(s.item, s[`type--${menu.type}`])} />

                    case 'normal':
                    default:
                        return (
                            <li
                                key={idx}
                                className={classnames(
                                    s.item,
                                    s['type--normal'],
                                    {[s[`hasSubmenu`]]: !!menu.submenu}
                                )}
                                onClick={menu.enabled === false ? undefined : () => { menu.click && menu.click(menu) }}
                            >
                                {menu.label}
                                {menu.submenu && buildMenuElements(menu.submenu)}
                            </li>
                        )
                }
            })}
        </ul>
    )
}

export const buildMenu = (path: EventTarget[], registeredMenus: WeakMap<Element, MenuItemOption[]>): MenuItemOption[] => {
    const menus: MenuItemOption[] = []

    for (const el of (path as Element[])) {
        const items = registeredMenus.get(el)

        if (items) {
            menus.push(...items)
        }
    }

    const normalizedMenus = menus.filter((item, idx) => {
        if (idx === 0 && item.type === 'separator') {
            // Remove head separator
            return false
        } else if (menus[idx - 1] && menus[idx - 1].type === 'separator' && item.type === 'separator') {
            // Remove continuous separator
            return false
        } else if (idx === menus.length - 1 && item.type === 'separator') {
            // Remove tail separator
            return false
        } else {
            return true
        }
    })

    return normalizedMenus
}

export default class ContextMenuManager
{
    private static _instance: ContextMenuManager

    public static get instance(): ContextMenuManager {
        return ContextMenuManager._instance = ContextMenuManager._instance || new ContextMenuManager()
    }

    private activeMenu: Portal|null
    private menus: WeakMap<HTMLElement, MenuItemOption[]> = new WeakMap()

    private _leakCheck: WeakSet<any>

    private constructor()
    {
        __DEV__ && (this._leakCheck = new WeakSet())

        window.addEventListener('contextmenu', e => {
            setTimeout(() => {
                const menus = buildMenu(e.path, this.menus)
                menus.length && this.show(menus, e)
            })

            e.preventDefault()
            e.stopPropagation()
        })

        window.addEventListener('click', e => {
            window.requestIdleCallback(() => {
                this.activeMenu && this.activeMenu.unmount()
                this.activeMenu = null

                __DEV__ && console.log(this._leakCheck)
            })
        })
    }

    private show(menus: MenuItemOption[], e: PointerEvent)
    {
        if (this.activeMenu) {
            this.activeMenu.unmount()
            this.activeMenu = null
        }

        this.activeMenu = Portal.mount(
            <div
                className={s.root}
                style={{top: e.pageY + 4, left: e.pageX + 4}}
            >
                {buildMenuElements(menus)}
            </div>
        )

        __DEV__ && this._leakCheck!.add(this.activeMenu)
    }

    public register(el: HTMLElement, menu: MenuItemOption[])
    {
        this.menus.set(el, menu)
    }

    public unregister(el: HTMLElement)
    {
        this.menus.delete(el)
    }
}
