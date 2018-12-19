import * as classnames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'
import { Children } from 'react'

interface Props {
    className?: string
    multiple: boolean
    onSelectionChanged?: (selection: number[]) => void
}

interface State {
    lastSelectedIdx: number
    selected: number[]
}

export default class SelectList extends React.Component<Props, State> {
    public static defaultProps = {
        multiple: false,
    }

    public state = {
        lastSelectedIdx: null,
        selected: [],
    }

    public render() {
        const children = Array.isArray(this.props.children) ? this.props.children : [this.props.children]

        return (
            <div className={classnames('_select-list', this.props.className)}>
                {this.props.children &&
                    Children.map(children, (child, idx) => (
                        <div
                            key={idx}
                            className={classnames('select-list-item', {
                                selected: this.state.selected.includes(idx),
                            })}
                            data-index={idx}
                            onClick={this.onClickItem}
                        >
                            {child}
                        </div>
                    ))}
            </div>
        )
    }

    private clearSelection() {}

    private onClickItem = (e: React.MouseEvent<HTMLDivElement>) => {
        const idx = parseInt(e.currentTarget.dataset.idx!, 10)
        e.preventDefault()
        e.stopPropagation()

        if (this.state.lastSelectedIdx === null) {
            return this.setState({ lastSelectedIdx: idx, selected: [idx] })
        } else if (e.shiftKey) {
            return this.setState({
                // lastSelectedIdx: idx,
                selected: [..._.range(this.state.lastSelectedIdx, idx), idx],
            })
        } else if (e.ctrlKey || e.metaKey) {
            if (this.state.selected.includes(idx)) {
                return this.setState({
                    lastSelectedIdx: idx,
                    selected: _.without(this.state.selected, idx),
                })
            } else {
                return this.setState({
                    lastSelectedIdx: idx,
                    selected: [...this.state.selected, idx],
                })
            }
        } else {
            this.setState({
                lastSelectedIdx: idx,
                selected: [idx],
            })
        }

        if (this.props.onSelectionChanged) {
            this.props.onSelectionChanged(this.state.selected)
        }
    }
}
