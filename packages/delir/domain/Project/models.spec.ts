import { mockClip, mockComposition, mockEffect, mockLayer, mockProject } from '@delirvfx/core-test-helper'
import { times } from 'lodash'
import { migrateProject } from './models'

describe('Project/models', () => {
  it('Should migrate from old effect id to next id', () => {
    const project = mockProject()
    const comp = mockComposition({ id: 'comp1', layers: [mockLayer({ id: ' layerId' })] })
    project.addComposition(comp)

    times(2).forEach(idx => {
      const clip = mockClip({ id: 'clip-${idx}' })
      ;[
        '@ragg/delir-posteffect-color-slider',
        '@ragg/delir-posteffect-numeric-slider',
        '@ragg/delir-posteffect-the-world',
      ].forEach((processor, idx) => {
        clip.addEffect(mockEffect({ id: `layer${idx}`, processor }))
      })

      comp.layers[0].addClip(clip)
    })

    const newProject = migrateProject(project)
    expect(newProject).toMatchSnapshot()
  })
})
