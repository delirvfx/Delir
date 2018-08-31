import * as uuid from 'uuid'

import Asset from './Asset'
import Composition from './Composition'

export default class Project {
    public formatVersion: string = '2017091401'
    public assets: Asset[] = []
    public compositions: Composition[] = []
}
