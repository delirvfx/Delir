import ProjectMigrater from '../ProjectMigrater'

describe('ProjectMigrater', () => {
    const v000Project = require('../../../fixtures/project/v000.delir.json')

    it ('Should migratable v000', () => {
        expect(ProjectMigrater.isMigratable(v000Project)).to.be(true)
    })

    it('Migrate 0.0.0 to 2017091401', () => {
        const migrated = ProjectMigrater.migrate(v000Project)

        expect(migrated.compositions[0].layers[1].clips[0].keyframes.source[0].config.value).to.eql({
            type: 'asset',
            value: { assetId: '12fcc520-0631-4cf0-9075-40817016b289' }
        })

        expect(migrated.compositions[0].layers[0].clips[0].keyframes.color[0].config.value).to.eql({
            type: 'color-rgba',
            value: { red: 0, green: 0, blue: 0, alpha: 0, }
        })
    })
})
