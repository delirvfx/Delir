import _ from 'lodash'
import React, {PropTypes} from 'react'
import classnames from 'classnames'

export default class SelectList extends React.Component
{
    static propTypes = {
        className: PropTypes.string,
        multiple: PropTypes.bool.isRequired,
        onSelectionChanged: PropTypes.func,
    }

    static defaultProps = {
        multiple: false,
    }

    state = {
        lastSelectedIdx: null,
        selected: [],
    }

    clearSelection()
    {

    }

    onClickItem = (idx, e) => {
        if (this.state.lastSelectedIdx === null) {
            return this.setState({lastSelectedIdx: idx, selected: [idx]})
        } else if (e.shiftKey) {
            return this.setState({
                // lastSelectedIdx: idx,
                selected: [... _.range(this.state.lastSelectedIdx, idx), idx]
            })
        } else if (e.ctrlKey || e.metaKey) {
            if (this.state.selected.includes(idx)) {
                return this.setState({
                    lastSelectedIdx: idx,
                    selected: _.without(this.state.selected, idx)
                })
            } else {
                return this.setState({
                    lastSelectedIdx: idx,
                    selected: [...this.state.selected, idx]
                })
            }
        } else {
            this.setState({
                lastSelectedIdx: idx,
                selected: [idx]
            })
        }

        this.props.onSelectionChanged && this.props.onSelectionChanged(this.state.selected)
    }

    render()
    {
        const children = Array.isArray(this.props.children) ? this.props.children : [this.props.children]

        return (
            <div className={classnames('_select-list', this.props.className)}>
                {this.props.children && children.map((child, idx) => (
                    <div
                        key={idx}
                        className={classnames('select-list-item', {'selected': this.state.selected.includes(idx)})}
                        onClick={this.onClickItem.bind(this, idx)}
                    >
                        {child}
                    </div>
                ))}
            </div>
        )
    }
}
