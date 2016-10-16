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
import SessionRenderer from './renderer/session-renderer'
import {PluginBase} from './plugin/index'
import * as Exception from './exceptions/index'
import * as Services from './services'

export default {
    Project,
    Renderer,
    SessionRenderer,
    Services,
    Exception,
    PluginBase,
}
