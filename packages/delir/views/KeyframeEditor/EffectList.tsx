import React from 'react'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { SortableHandle } from 'react-sortable-hoc'

export const EffectSortHandle = SortableHandle(() => <i className="fa fa-bars" />)

export const EffectListItem = SortableElement(
  ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={className}>{children}</div>
  ),
)

export const EffectList = SortableContainer((props: { children: React.ReactNode }) => <div>{props.children}</div>)
