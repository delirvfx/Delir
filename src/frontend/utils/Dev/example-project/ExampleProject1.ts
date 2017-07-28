import * as Delir from 'delir-core'
import {ProjectHelper, Values} from 'delir-core'
import {join} from 'path'
import AppActions from '../../../actions/App'

const fps = 60
const durationFrames = fps * 300
const p = (window as any).app.project = new Delir.Project.Project()

const movieAsset = new Delir.Project.Asset()
movieAsset.name = 'Movie'
movieAsset.fileType = 'mp4'
movieAsset.path = '/Users/ragg/workspace/delir/_sample.mp4'
ProjectHelper.addAsset(p, movieAsset)

const audioAsset = new Delir.Project.Asset()
audioAsset.name = 'Audio'
audioAsset.fileType = 'mp3'
audioAsset.path = '/Users/ragg/workspace/delir/comouflage.mp3'

const audioAsset2 = new Delir.Project.Asset()
audioAsset.name = 'Audio'
audioAsset.fileType = 'mp3'
audioAsset.path = '/Users/ragg/workspace/delir/comouflage.mp3'

;[movieAsset, audioAsset, audioAsset2].forEach(a => ProjectHelper.addAsset(p, a))

// Maser Composition
const c1 = new Delir.Project.Composition()
c1.name = 'Master Composition'
c1.width = 640
c1.height = 360
c1.framerate = fps
c1.durationFrames = durationFrames
c1.audioChannels = 2
c1.samplingRate = 48000
c1.backgroundColor = new Values.ColorRGB(0, 188, 255)

const c1_t1 = Object.assign(new Delir.Project.Layer(), {
    name: 'Audio',
})

const c1_t2 = Object.assign(new Delir.Project.Layer(), {
    name: '🔥 FIRE 🔥',
})

const c1_t3 = Object.assign(new Delir.Project.Layer(), {
    name: 'NYAN = ^ . ^ = CAT',
})

const c1_t4 = Object.assign(new Delir.Project.Layer(), {
    name: 'video',
})

const movieClip = Object.assign(new Delir.Project.Clip(), {
    renderer: 'video',
    placedFrame: 0,
    durationFrames,
    keyframes: {
        source: [
            Object.assign(new Delir.Project.Keyframe(), {
                value: {assetId: movieAsset.id},
                frameOnClip: 0,
            })
        ]
    }
})

const textClip = Object.assign(new Delir.Project.Clip(), {
    renderer: 'text',
    placedFrame: 0,
    durationFrames,
    keyframes: {
        text: [
            Object.assign(new Delir.Project.Keyframe(), {value: 'test', frameOnClip: 0})
        ],
        source: [
            Object.assign(new Delir.Project.Keyframe(), {value: {assetId: movieAsset.id}, frameOnClip: 0})
        ],
        loop: [
            Object.assign(new Delir.Project.Keyframe(), {value: true, frameOnClip: 0}),
        ],
        x: [
            Object.assign(new Delir.Project.Keyframe(), {value: 0, frameOnClip: 0, easeOutParam: [.4, .5]}),
            Object.assign(new Delir.Project.Keyframe(), {value: 300, frameOnClip: 600, easeInParam: [.6, .5]}),
        ],
    },
    expressions: {
        text: new Values.Expression('typescript', 'console.log(duration);\n`time:${time}\\nframe:${frame}`')
    },
})

const audioClip = Object.assign(new Delir.Project.Clip(), {
    // renderer: 'video'
    renderer: 'audio',
    placedFrame: 0,
    durationFrames,
    keyframes: {
        source: [
            Object.assign(new Delir.Project.Keyframe(), {
                value: {assetId: audioAsset.id},
                frameOnClip: 0
            }),
        ]
    }
})

const audioClip2 = Object.assign(new Delir.Project.Clip(), {
    // renderer: 'video'
    renderer: 'audio',
    placedFrame: 20,
    durationFrames,
    keyframes: {
        source: [
            Object.assign(new Delir.Project.Keyframe(), {
                value: {assetId: audioAsset.id},
                frameOnClip: 0
            }),
        ]
    }
})

const c1_t3_cl1 = Object.assign(new Delir.Project.Clip(), {
    renderer: 'plane',
    placedFrame: 0,
    durationFrames: 30 * 10,
})
const c1_t4_cl1 = Object.assign(new Delir.Project.Clip(), {
    renderer: 'video',
    placedFrame: 0,
    durationFrames: 30 * 10,
})

ProjectHelper.addComposition(p, c1)
;[c1_t1, c1_t2, c1_t3, c1_t4].forEach(lane => ProjectHelper.addLayer(p, c1, lane))

// console.log(ProjectHelper.addClip())
// ProjectHelper.addClip(p, c1_t1, c1_t1_cl1)
// ProjectHelper.addClip(p, c1_t1, audioClip2)
// ProjectHelper.addClip(p, c1_t2, audioClip)
ProjectHelper.addClip(p, c1_t3, movieClip)
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


AppActions.setActiveProject(p);
AppActions.changeActiveComposition(c1.id!)
AppActions.changeActiveClip(c1_t1_cl1.id)
