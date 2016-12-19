export interface ColorRgbaJSON {
    red: number
    green: number
    blue: number
    alpha: number
}

export default class ColorRGBA {
    _red: number
    _green: number
    _blue: number
    _alpha: number

    constructor(
        r: number = 0,
        g: number = 0,
        b: number = 0,
        a: number = 0
    ) {
        this._red    = r
        this._green  = g
        this._blue   = b
        this._alpha  = a
    }

    get r(): number { return this._red }
    get g(): number { return this._green }
    get b(): number { return this._blue }
    get a(): number { return this._alpha }

    clone(
        r: number|null = null,
        g: number|null = null,
        b: number|null = null,
        a: number|null = null,
    ): ColorRGBA
    {
        return new ColorRGBA(
            r || this.r,
            g || this.g,
            b || this.b,
            a || this.a,
        )
    }

    toJSON()
    {
        return {
            red: this.r,
            green: this.g,
            blue: this.b,
            alpha: this.a,
        }
    }

    toString()
    {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`
    }
}
