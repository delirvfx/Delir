import * as Delir from '@delirvfx/core'
import * as jsdom from 'jsdom-global'
import * as React from 'react'
import * as ReactTestRenderer from 'react-test-renderer'

import { default as project, IMAGE_LAYER_INDEX } from '../../../__spec__/fixtures/Project'
import KeyframeGraph from '../KeyframeGraph.tsx'

describe('KeyframeEditor.KeyframeGraph', () => {
    before(function() {
        ;(this as any).jsdom = jsdom()
    })
    after(function() {
        ;(this as any).jsdom()
    })

    // it('test', () => {
    //     ReactTestRenderer.create(
    //         <KeyframeGraph
    //             width={1000}
    //             height={300}
    //             scrollLeft={0}
    //             viewBox='0 0 1000 300'
    //             composition={project.compositions[0]}
    //             clip={project.compositions[0].layers[0].clips[0]}
    //             propName='x'
    //             keyframes={project.compositions[0].layers[IMAGE_LAYER_INDEX].clips[0].keyframes.x}
    //             pxPerSec={30}
    //             zoomScale={1}
    //         />
    //     )
    // })
})
