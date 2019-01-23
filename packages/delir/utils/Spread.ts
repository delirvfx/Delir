class A {
    public a: number
    public c: string
    public b() {}
}

type RemoveMethodKeys<T> = { [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K }[keyof T]
export type SpreadType<T extends object> = Pick<T, RemoveMethodKeys<T>>
