// Mousetrap is fired event on Input element when _belongsTo is satisfied
export const makeMousetrapIgnoreInputHandler = (fn: (e: KeyboardEvent, combo: string) => void) => {
    return (e: KeyboardEvent, combo: string) => {
        const target: HTMLElement = (e.target || e.srcElement) as HTMLElement

        // See: https://github.com/ccampbell/mousetrap/blob/master/mousetrap.js#L986
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'SELECT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
        ) {
            return
        }

        fn(e, combo)
    }
}
