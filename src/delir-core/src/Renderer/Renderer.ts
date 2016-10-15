// import * as V000Render from "./0.0.0/render";

import Document from "../Document/document";

export namespace Delir {
    export default class Renderer {
        // plugins: PluginContainer;

        addPlugin(): void {}

        render(doc: Delir.Document): Promise<void> {
            // switch (comp.constructor.apiVersion) {
            //     case "0.0.0": V000Render.render(comp);
            // }
            console.log("v1 renderer");

            return new Promise<void>(resolve => {

            });
        }
    }
}
