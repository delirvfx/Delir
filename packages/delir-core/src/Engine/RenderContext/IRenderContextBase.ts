import * as THREE from 'three'

import { Composition } from '../../Entity'
import { Point3D } from '../../Values'
import DependencyResolver from '../DependencyResolver'
// import WebGLContext from '../WebGL/WebGLContext'

export interface Camera {
    fov: number
    position: Point3D
    rotate: Point3D
}

export interface IRenderContextBase {
    time: number
    timeOnComposition: number

    frame: number
    frameOnComposition: number

    // Composition properties
    width: number
    height: number
    framerate: number
    durationFrames: number
    samplingRate: number
    audioChannels: number
    neededSamples: number
    isAudioBufferingNeeded: boolean

    rootComposition: Readonly<Composition>

    camera: Camera

    // Resolver
    resolver: DependencyResolver

    // Destinations
    destCanvas: HTMLCanvasElement
    destAudioBuffer: Float32Array[]
    audioContext: OfflineAudioContext
    // gl: WebGLContext

    three: THREE.WebGLRenderer
}
