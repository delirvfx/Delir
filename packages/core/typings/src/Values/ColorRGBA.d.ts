export interface ColorRgbaJSON {
    red: number
    green: number
    blue: number
    alpha: number
}
export default class ColorRGBA {
    public static fromJSON(json: ColorRgbaJSON): ColorRGBA
    public readonly r: number
    public readonly g: number
    public readonly b: number
    public readonly a: number
    public readonly red: number
    public readonly green: number
    public readonly blue: number
    public readonly alpha: number
    private _red
    private _green
    private _blue
    private _alpha
    constructor(r?: number, g?: number, b?: number, a?: number)
    public clone(r?: number | null, g?: number | null, b?: number | null, a?: number | null): ColorRGBA
    public toJSON(): ColorRgbaJSON
    public toCSSColor(): string
    /**
     * @deprecated
     */
    public toString(): string
}
