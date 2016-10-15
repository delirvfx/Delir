export namespace Delir.Struct {
    export class ColorRGBA {
        private _red : number;
        private _green : number;
        private _blue : number;
        private _alpha : number;

        constructor(
            r: number = 0,
            g: number = 0,
            b: number = 0,
            a: number = 0
        ) {
            this._red    = r;
            this._green  = g;
            this._blue   = b;
            this._alpha  = a;
        }

        get r(): number { return this._red; }
        get g(): number { return this._green; }
        get b(): number { return this._blue; }
        get a(): number { return this._alpha; }
    }
}
