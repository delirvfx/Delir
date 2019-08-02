import * as p2017091401 from '../../spec/fixture/project/2017091401.delir.json'
import { deserializeProject } from '../Exporter'
import ProjectMigrator from './ProjectMigrator'

describe('ProjectMigrator', () => {
  it('Migrate to 2019052601 from 2017091401', () => {
    const beforeMigration = deserializeProject(p2017091401)
    const afterMigration = ProjectMigrator.migrate(beforeMigration)
    expect(afterMigration.assets).toMatchSnapshot()
  })
})
