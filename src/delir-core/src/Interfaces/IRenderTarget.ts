namespace Delir.Interfaces {
    export interface IRenderTarget {
        render(param: RenderingContext): Promise<void>;
    }
}
