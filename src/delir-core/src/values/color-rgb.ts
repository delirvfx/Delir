export interface ColorRgbJSON {
    red: number
    green: number
    blue: number
}

export default class ColorRGB {
    public static fromJSON(json: ColorRgbJSON)
    {
        return new ColorRGB(json.red, json.green, json.blue)
    }

    private _red: number
    private _green: number
    private _blue: number

    constructor(
        r: number = 0,
        g: number = 0,
        b: number = 0,
    ) {
        this._red    = r
        this._green  = g
        this._blue   = b
    }

    get r(): number { return this._red }
    get g(): number { return this._green }
    get b(): number { return this._blue }

    get red(): number { return this._red }
    get green(): number { return this._green }
    get blue(): number { return this._blue }

    public clone(
        r: number|null = null,
        g: number|null = null,
        b: number|null = null,
    ): ColorRGB
    {
        return new ColorRGB(
            r || this.r,
            g || this.g,
            b || this.b,
        )
    }

    public toJSON(): ColorRgbJSON
    {
        return {
            red: this.r,
            green: this.g,
            blue: this.b,
        }
    }

    public toCSSColor()
    {
        return `rgba(${this.r|0}, ${this.g|0}, ${this.b|0}, ${this.a})`
    }

    /**
     * @deprecated
     */
    public toString()
    {
        return `rgba(${this.r|0}, ${this.g|0}, ${this.b|0}, 1)`
    }
}
