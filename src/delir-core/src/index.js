// @flow
// import Renderer from "./renderer/renderer";
// import Project from "./project/project";

// class Delir {
//     /**
//      * @param {Delir.Project}
//      */
//     static async render(document) {
//
//     }
// }

import Project from './project/project'
import Renderer from './renderer/renderer'
import {PluginBase} from './plugin/index'
import * as Exception from './exceptions/index'

export default {
    Project,
    Renderer,
    Exception,
    PluginBase,
}
