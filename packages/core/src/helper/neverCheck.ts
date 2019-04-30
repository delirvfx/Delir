export const neverCheck = (value: never) => {
    throw new Error(`Unexpected value given ${value}`)
}
