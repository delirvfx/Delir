declare module 'prop-types' {
    const _: any
    export default _
}

declare module 'bezier-easing' {
    const _: any
    export default _
}

declare module 'fs-promise' {
    export * from 'mz/fs'
}

declare namespace NodeJS {
    export interface Global {
        // Define for electron's `global.require`
        require: NodeRequire
    }
}
