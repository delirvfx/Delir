import * as React from 'react'
import * as Delir from 'delir-core'
import { SortableContainer } from 'react-sortable-hoc'

import LaneLabel from './LaneLabel'

interface Props {
    layers: Delir.Project.Layer[]
    onSelect: (layerId: string) => void
    onRemove: (layerId: string) => void
}

export default SortableContainer((props: Props) => (
    <ul>
        {props.layers.map((layer, idx) => (
            <LaneLabel index={idx} key={layer.id} layer={layer} onSelect={props.onSelect} onRemove={props.onRemove} />
        ))}
    </ul>
))
