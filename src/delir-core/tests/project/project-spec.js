import Project from '../../src/project/project'
import Composition from '../../src/project/composition'

describe('project/Project specs', () => {
    describe('project.getComposition', () => {
        const p = new Project();
        const comp = new Composition
        comp._id = 'test'
        p._compositions.push(comp)
        console.log(p.getComposition('test'));
    })
})
