export class InputContext<T extends object> {
    public store: T = {} as any
    public fillColor: string | null
    public strokeColor: string | null

    constructor(public root: SVGSVGElement) {}
}
