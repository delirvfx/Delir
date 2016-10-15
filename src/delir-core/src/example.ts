import {Renderer, Document} from "./index";

const doc = new Document();
Renderer.render(doc, "composition_id");
Renderer.renderFrame(doc, "composition_id", {frame: 0, time: 0});
