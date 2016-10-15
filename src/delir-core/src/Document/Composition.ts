namespace Delir.Documents {
    export class Composition implements Delir.Interfaces.IRenderTarget {
        layers : Array<Delir.Interfaces.ILayer>;
        config : Delir.Structs.CompositionConfigure;

        constructor() {
            // settings = new CompositionSetting();
        }

        render(param: RenderingContext): Promise<void>
        {
            return new Promise<void>(resolve => resolve());
        }
    }
}
