export default (obj: any): any => {
    return JSON.parse(JSON.stringify(obj))
}
