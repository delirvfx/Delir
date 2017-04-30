import Project from '../../src/project/project'
import Asset from '../../src/project/asset'
import Composition from '../../src/project/composition'
import Layer from '../../src/project/layer'
import Clip from '../../src/project/clip'

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
            project.compositions.push(comp1)

            const lane1 = new Layer
            comp1.layers.add(lane1)

            lane1.clips.add(new Clip)
        })

        it('correctry serialize/deserialize the project', () => {
            const comp1 = new Composition
            project.compositions.push(comp1)

            const lane1 = new Layer
            comp1.layers.add(lane1)

            const pbson = project.serialize()
            expect(Project.deserialize(pbson).toJSON()).to.eql(project.toJSON())
        })
    })
})
