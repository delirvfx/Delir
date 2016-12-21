declare module 'font-manager' {
    const getAvailableFontsSync: () => {
        family: string
    }[]

    export {getAvailableFontsSync}
}
