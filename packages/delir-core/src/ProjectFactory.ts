import * as uuid from 'uuid'
import { Composition, Project } from './Document'
import { Omit } from './Utils/types'

type NewEntity<T extends { id: any }> = Omit<T, 'id'>

export const createProject = (): Project => ({
    formatVersion: '1.0.0',
    assets: [],
    compositions: [],
    layers: [],
    clips: [],
    effects: [],
})

export const createComposition = (options: NewEntity<Composition>): Composition => ({
    id: uuid.v4(),
    ...options
})

export const createLayer = (options: NewEntity<Composition>): Composition => ({
    id: uuid.v4(),
    ...options
})
