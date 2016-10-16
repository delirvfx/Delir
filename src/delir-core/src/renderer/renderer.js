// @flow

import Project from "../project/project"

export default class Renderer {
    // plugins: PluginContainer

    addPlugin(): void {}

    render(doc: Project): Promise<void> {
        // switch (comp.constructor.apiVersion) {
        //     case "0.0.0": V000Render.render(comp)
        // }
        console.log("v1 renderer")

        return new Promise(resolve => {

        })
    }
}
