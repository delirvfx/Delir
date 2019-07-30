import * as Selection from '@simonwep/selection-js'
import { useEffect, useRef } from 'react'

export const useSelection = (options: Selection.SelectionOptions) => {
    const selection = useRef<Selection>()

    useEffect(() => {
        selection.current = Selection.create(options)
        return () => selection.current!.destroy()
    })
}
