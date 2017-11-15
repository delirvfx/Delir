import {ProjectHelper, Values, Project} from 'delir-core'
import {join} from 'path'
import AppActions from '../../../actions/App'

const assign = <T>(dest: T, ...sources: Partial<T>[]): T => Object.assign(dest as any, ...sources)

const fps = 30
const durationFrames = fps * 10
const clipDuration = 4 * fps

const p = (window as any).app.project = new Project.Project()

// Maser Composition
const comp = assign(new Project.Composition(), {
    name: 'Master Composition',
    width: 640,
    height: 360,
    framerate: fps,
    durationFrames,
    audioChannels: 2,
    samplingRate: 48000,
    backgroundColor: new Values.ColorRGB(0, 188, 255),
})

ProjectHelper.addComposition(p, comp)

;[
    // Audio
    assign(new Project.Clip(), {
        renderer: 'audio',
        durationFrames: clipDuration,
    }),
    // Video
    assign(new Project.Clip(), {
        renderer: 'video',
        durationFrames: clipDuration,
    }),
    // Image
    assign(new Project.Clip(), {
        renderer: 'image',
        durationFrames: clipDuration,
    }),
    // Text
    assign(new Project.Clip(), {
        renderer: 'text',
        durationFrames: clipDuration,
    }),
    // Adjustment
    assign(new Project.Clip(), {
        renderer: 'adjustment',
        durationFrames: clipDuration,
    }),
    // Script
    assign(new Project.Clip(), {
        renderer: 'scripting',
        durationFrames: clipDuration,
    })
].reverse().forEach((clip, idx, list) => {
    clip.placedFrame = (list.length - 1 - idx) * 30 + 20

    const layer = new Project.Layer()
    ProjectHelper.addLayer(p, comp, layer)
    ProjectHelper.addClip(p, layer.id, clip)
})

AppActions.setActiveProject(p)
AppActions.changeActiveComposition(comp.id)
