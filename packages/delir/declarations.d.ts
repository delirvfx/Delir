declare module '*.styl' {
    const _: { [className: string]: string }
    export = _
}

declare module '*.json' {
    const _: { [key: string]: any }
    export = _
}

declare module 'devtron' {
    export function install(): void
}

declare module 'mouse-wheel' {
    const _: (element: Element, callback: (dx: number, dy: number) => void, noScroll?: boolean) => void

    export = _
}

declare module 'electron-devtools-installer' {
    type Extensions = 'REACT_DEVELOPER_TOOLS'
    export const REACT_DEVELOPER_TOOLS = 'REACT_DEVELOPER_TOOLS'
    export default function installExtension(extension: Extensions): Promise<void>
}

declare module 'parse-color' {
    function parseColor(
        colorCode: string,
    ): {
        /** RGB values */
        rgb: [number, number, number]
        /** RGBA values */
        rgba: [number, number, number, number]
        /** CSS color keyword */
        keyword: string
        /** HEX color code */
        hex: string
    }

    namespace parseColor {}
    export = parseColor
}

declare module 'form-serialize' {
    interface SerializeOption {
        /** if true, the hash serializer will be used for serializer option */
        hash?: boolean
        /** override the default serializer (hash or url-encoding) */
        serializer?: Function
        /** if true, disabled fields will also be serialized */
        disabled?: boolean
        /** if true, empty fields will also be serialized */
        empty?: boolean
    }

    function serialize(form: HTMLFormElement, options?: SerializeOption): { [name: string]: string | string[] } | string
    function serialize(
        form: HTMLFormElement,
        options?: SerializeOption & { hash: true },
    ): { [name: string]: string | string[] }

    namespace serialize {}
    export = serialize
}

declare interface SVGGElement {
    dataset: DOMStringMap
}

declare interface PointerEvent {
    path: EventTarget[]
}

declare interface Window {
    requestIdleCallback: (
        callback: (e: { timeRemaining: number; didTimeout: boolean }) => void,
        options?: { timeout: number },
    ) => void
}

declare interface Document {
    exitPointerLock(): void
}

declare interface Element {
    requestPointerLock(): void
}

declare interface HTMLInputElement {
    onpointerlockerror: (event: ErrorEvent) => void
}

declare const __DEV__: boolean

declare interface Window {
    delir: any
}
