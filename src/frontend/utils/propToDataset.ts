const propDataToObject = <T = any>(props: {[prop: string]: any}): { [K in keyof T]: string } => {
    const MATCHER = /^data-(.+?)$/
    const REPLACER = /(-[a-z])/g

    const keys = Object.keys(props).filter(prop => MATCHER.exec(prop))

    const dataset: any = Object.create(null)
    keys.forEach(key => {
        const propName = key.match(MATCHER)![1].replace(REPLACER, (_, repValue: string) => repValue.toUpperCase().slice(-1))
        dataset[propName] = props[key]
    })

    return dataset
}

export default propDataToObject
