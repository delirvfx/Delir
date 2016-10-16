// @flow

import Project from "../project/project"
import type PluginRegistory from '../application/plugin-registory'

export default class SessionRenderer {
    // plugins: PluginContainer

    pluginRegistory : PluginRegistory

    constructor({
        pluginRegistory
    } : {
        pluginRegistory: PluginRegistory
    }) {
        this.pluginRegistory = pluginRegistory
    }

    render(doc: Project): Promise<void> {
        // switch (comp.constructor.apiVersion) {
        //     case "0.0.0": V000Render.render(comp)
        // }
        console.log("v1 renderer")

        return new Promise(resolve => {

        })
    }
}
