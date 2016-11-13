import _ from 'lodash'
import Project from '../../src/project/project'
import Asset from '../../src/project/asset'
import Composition from '../../src/project/composition'
import TimeLane from '../../src/project/timelane'
import Layer from '../../src/project/layer'

describe('project structure specs', () => {
    describe('Project', () => {
        let project

        beforeEach(() => {
            project = new Project()
        })

        afterEach(() => {
            project = null
        })

        it('project construction flow', () => {
            project.assets.add(new Asset)
            project.assets.add(new Asset)

            const comp1 = new Composition
            project.compositions.add(comp1)

            const lane1 = new TimeLane
            comp1.timelanes.add(lane1)

            lane1.layers.add(new Layer)
        })

        it('correctry serialize/deserialize the project', () => {
            const comp1 = new Composition
            project.compositions.add(comp1)

            const lane1 = new TimeLane
            comp1.timelanes.add(lane1)

            const pbson = project.serialize()
            expect(Project.deserialize(pbson).toJSON()).to.eql(project.toJSON())
        })
    })
})
