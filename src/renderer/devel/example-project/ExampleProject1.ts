import * as Delir from 'delir-core'
import {ProjectHelper} from 'delir-core'
import {join} from 'path'

const fps = 60
const durationFrames = fps * 20
const p = (window as any).app.project = new Delir.Project.Project()

const movieAsset = new Delir.Project.Asset
movieAsset.name = 'Movie'
movieAsset.mimeType = 'video/mp4'
movieAsset.path = '/Users/ragg/workspace/delir/sample.mp4'
ProjectHelper.addAsset(p, movieAsset)

const audioAsset = new Delir.Project.Asset
audioAsset.name = 'Audio'
audioAsset.mimeType = 'audio/mp3'
audioAsset.path = '/Users/ragg/workspace/delir/deream_in.mp3'

;[movieAsset, audioAsset].forEach(a => ProjectHelper.addAsset(p, a))

// Maser Composition
const c1 = new Delir.Project.Composition
c1.name = 'Master Composition'
c1.width = 640
c1.height = 360
c1.framerate = fps
c1.durationFrames = durationFrames
c1.audioChannels = 2
c1.samplingRate = 48000

const c1_t1 = new Delir.Project.Layer
c1_t1.name = 'Audio'

const c1_t2 = new Delir.Project.Layer
c1_t2.name = '🔥 FIRE 🔥'

const c1_t3 = new Delir.Project.Layer
c1_t3.name = 'NYAN = ^ . ^ = CAT'

const c1_t4 = new Delir.Project.Layer
c1_t4.name = 'video'

const c1_t1_l1 = new Delir.Project.Clip
// c1_t1_l1.renderer = 'audio-layer'
c1_t1_l1.renderer = 'html5-video-layer'
// c1_t1_l1.renderer = 'plane'
c1_t1_l1.placedFrame = 0
c1_t1_l1.durationFrames = durationFrames
c1_t1_l1.keyframes = {
    'source': [
        Object.assign(new Delir.Project.Keyframe(), {value: movieAsset, frameOnClip: 0})
    ],
    'loop': [
        Object.assign(new Delir.Project.Keyframe(), {value: true, frameOnClip: 0}),
    ],
    'x': [
        Object.assign(new Delir.Project.Keyframe(), {value: 0, frameOnClip: 0}),
        Object.assign(new Delir.Project.Keyframe(), {value: 300, frameOnClip: 600}),
    ],
}

const c1_t2_l1 = Object.assign(new Delir.Project.Clip, {
    // renderer: 'html5-video-layer'
    renderer: 'audio-layer',
    placedFrame: 0,
    durationFrames: durationFrames,
})

const c1_t3_l1 = Object.assign(new Delir.Project.Clip, {
    renderer: 'plane',
    placedFrame: 0,
    durationFrames: 30 * 10,
})
const c1_t4_l1 = Object.assign(new Delir.Project.Clip, {
    renderer: 'html5-video-layer',
    placedFrame: 0,
    durationFrames: 30 * 10,
})

ProjectHelper.addComposition(p, c1)
;[c1_t1, c1_t2, c1_t3, c1_t4].forEach(lane => ProjectHelper.addLayer(p, c1, lane))

// console.log(ProjectHelper.addClip())
ProjectHelper.addClip(p, c1_t1, c1_t1_l1)
// ProjectHelper.addClip(p, c1_t2, c1_t2_l1)
// ProjectHelper.addClip(p, c1_t3, c1_t3_l1)
// ProjectHelper.addClip(p, c1_t3, c1_t4_l1)

// ProjectHelper.addKeyframe(p, c1_t1_l1, 'x', [
//     Object.assign(new Delir.Project.Keyframe, {
//         frameOnClip: 0,
//         value: 0,
//         easeOutParam: [1, -0.03],
//     }),
//     Object.assign(new Delir.Project.Keyframe, {
//         frameOnClip: fps * 5,
//         value: 900,
//         easeInParam: [1, .09],
//         easeOutParam: [1, -0.03],
//     }),
//     Object.assign(new Delir.Project.Keyframe, {
//         frameOnClip: durationFrames,
//         value: 0,
//         easeInParam: [1, .09],
//     })
// ])
//
// ProjectHelper.addKeyframe(p, c1_t1_l1, 'y', [
//     Object.assign(new Delir.Project.Keyframe, {frameOnClip: 0, value: -300})
// ])
//
// ProjectHelper.addKeyframe(p, c1_t1_l1, 'loop', [
//     Object.assign(new Delir.Project.Keyframe, {frameOnClip: 0, value: true})
// ])




// Sub Composition
const c2 = new Delir.Project.Composition
const c2_t1 = new Delir.Project.Layer
const c2_t1_l1 = new Delir.Project.Clip
const c2_t1_l2 = new Delir.Project.Clip
const c2_t1_l3 = new Delir.Project.Clip
c2.name = 'Sub Composition'
c2_t1_l1.placedFrame = 20
c2_t1_l2.placedFrame = 40
// c2_t1_l3.placedFrame = 100

ProjectHelper.addComposition(p, c2)
ProjectHelper.addLayer(p, c2, c2_t1)
// ProjectHelper.addClip(p, c2_t1, c2_t1_l1)
ProjectHelper.addClip(p, c2_t1, c2_t1_l2)
// ProjectHelper.createAddEffect(p, c1_t1_l1, {
//     processor: 'noise',
// })
// ProjectHelper.addClip(p, c2_t1, c2_t1_l3)
// ProjectHelper.addKeyframe(p, c1_t1_l1, new Delir.Project.Keyframe)

export default p