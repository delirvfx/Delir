import * as Electron from 'electron'
import { MenuItemOption } from './ContextMenu'

export default class ContextMenuManager
{
    public static get instance(): ContextMenuManager {
        return ContextMenuManager._instance = ContextMenuManager._instance || new ContextMenuManager()
    }

    private static _instance: ContextMenuManager

    private menus: WeakMap<HTMLElement, MenuItemOption[]> = new WeakMap()

    private constructor()
    {
        window.addEventListener('contextmenu', e => {
            e.preventDefault()
            e.stopPropagation()

            const menu = Electron.remote.Menu.buildFromTemplate(this.buildMenu(e.path, this.menus) as Electron.MenuItemConstructorOptions[])
            menu.popup({ window: Electron.remote.getCurrentWindow() })
        })
    }

    public register(el: HTMLElement, menu: MenuItemOption[])
    {
        this.menus.set(el, menu)
    }

    public unregister(el: HTMLElement)
    {
        this.menus.delete(el)
    }

    private buildMenu(path: EventTarget[], registeredMenus: WeakMap<Element, MenuItemOption[]>): MenuItemOption[] {
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
}
