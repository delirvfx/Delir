import { useStore } from '@fleur/fleur-react'
import React from 'react'

import { Pane } from '../../components/Pane'
import EditorStore from '../../domain/Editor/EditorStore'

export const StatusBar = () => {
  const { stateText } = useStore([EditorStore], getStore => ({
    stateText: getStore(EditorStore).getState().processingState,
  }))

  return (
    <Pane className="view-status" resizable={false} allowFocus={false}>
      <div>{stateText}</div>
    </Pane>
  )
}
