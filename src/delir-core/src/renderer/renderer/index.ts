import {IRendererStatic} from './renderer-base'
import AvailableRenderer from '../available-renderer'

import VideoRenderer from './video-renderer'
import ImageRenderer from './image-renderer'
import TextRenderer from './text-renderer'
import AudioRenderer from './audio-renderer'

export const RENDERERS: {[name: string]: IRendererStatic} = {
    audio: AudioRenderer,
    video: VideoRenderer,
    image: ImageRenderer,
    text: TextRenderer,
}
