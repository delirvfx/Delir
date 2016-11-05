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

import * as Project from './project/index'
import Renderer from './renderer/renderer'
import * as Abstraction from './abstraction/index';
import {PluginBase} from './plugin/index'
import * as Helper from './helper/helper'
import * as Exception from './exceptions/index'
import * as Services from './services'

export default {
    Project,
    Renderer,
    Abstraction,
    Services,
    Exception,
    PluginBase,
    Helper,
}
