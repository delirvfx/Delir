import _ from 'lodash'
import React, {PropTypes, Children} from 'react'
import classnames from 'classnames'

export class Table extends React.Component
{
    static propTypes = {
        className: PropTypes.string,
    }

    constructor(...args)
    {
        super(...args)

        const columnWidths = []
        Children.toArray(this.props.children).forEach(child => {
            if (child.type !== TableHeader) return

            Children.toArray(child.props.children).forEach(maybeRowChild => {
                if (maybeRowChild.type !== Row) return

                Children.toArray(maybeRowChild.props.children).forEach(maybeColChild => {
                    if (maybeColChild.type !== Col) return

                    columnWidths.push(maybeColChild.props.defaultWidth)
                })
            })
        })

        this.state = {
            columnWidths: columnWidths,
        }
    }

    handleCellResizing = (cellIdx, width) => {
        const _widths = this.state.columnWidths.slice(0)
        _widths[cellIdx] = width
        this.setState({columnWidths: _widths})
    }

    render()
    {
        const {className, children, ...props} = this.props
        return (
            <div className={classnames('_table', className)} {...props}>
                {Children.map(children, child => {
                    if (child.type === TableHeader) {
                        return React.cloneElement(child, {
                            _notifyCellResizing: this.handleCellResizing,
                        })
                    } else if (
                        child.type === TableBody
                        || child.type === TableBodySelectList
                    ) {
                        return React.cloneElement(child, {
                            _widths: this.state.columnWidths,
                        })
                    }

                    return child
                })}
            </div>
        )
    }
}

export class TableHeader extends React.Component
{
    static propTypes = {
        _notifyCellResizing: PropTypes.func,
        className: PropTypes.string,
    }

    constructor(...args)
    {
        super(...args)
    }

    render()
    {
        return (
            <div className={classnames('table-header', this.props.className)}>
                {Children.map(this.props.children, (child, idx) => {
                    if (child.type === Row) {
                        return React.cloneElement(child, {
                            _inHeader: true,
                            _notifyCellResizing: this.props._notifyCellResizing,
                        })
                    }

                    return child
                })}
            </div>
        )
    }
}

export class TableBody extends React.Component
{
    static propTypes = {
        _widths: PropTypes.arrayOf(
            PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string
            ])
        ),
        className: PropTypes.string,
    }

    constructor(...args)
    {
        super(...args)
    }

    render()
    {
        return (
            <div className={classnames('table-body', this.props.className)}>
                {Children.map(this.props.children, (child, idx) => {
                    if (child.type === Row) {
                        return React.cloneElement(child, {
                            _widths: this.props._widths,
                        })
                    } else {
                        return child
                    }
                })}
            </div>
        )
    }
}

export class TableBodySelectList extends React.Component
{
    static propTypes = {
        _widths: PropTypes.arrayOf(
            PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string
            ])
        ),
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
        let rowIdx = 0

        return (
            <div className={classnames('table-body-selectlist', this.props.className)}>
                {Children.map(this.props.children, (maybeRowChild, idx) => {
                    if (maybeRowChild.type === Row) {
                        let _rowIdx = rowIdx++

                        return React.cloneElement(maybeRowChild, {
                            _widths: this.props._widths,
                            className: classnames(maybeRowChild.props.className, {
                                'selected': this.state.selected.includes(_rowIdx)
                            }),
                            onClick: e => {
                                this.onClickItem(_rowIdx, e)
                                maybeRowChild.props.onClick && maybeRowChild.props.onClick(e)
                            },
                            onContextMenu: e => {
                                console.log(e);
                                this.onClickItem(_rowIdx, e)
                                maybeRowChild.props.onClick && maybeRowChild.props.onClick(e)
                            },
                        })
                    }

                    return maybeRowChild
                })}
            </div>
        )
    }
}

export class TableFooter extends React.Component
{
    static propTypes = {
        className: PropTypes.string,
    }

    constructor(...args)
    {
        super(...args)
    }

    render()
    {
        return (
            <div className={classnames('table-footer', this,props.className)}>
                {this.props.children}
            </div>
        )
    }
}

export class Row extends React.Component
{
    static propTypes = {
        _inHeader: PropTypes.bool,
        _widths: PropTypes.array,
        _notifyCellResizing: PropTypes.func,
        _widths: PropTypes.arrayOf(
            PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string
            ])
        ),
        className: PropTypes.string,
    }

    static defaultProps = {
        _inHeader: false,
    }

    constructor(...args)
    {
        super(...args)
    }

    render()
    {
        const {_widths} = this.props
        const childProps = _.omit(this.props, ['_inHeader', '_widths', '_notifyCellResizing', '_widths'])
        let colIdx = 0

        return (
            <div {...childProps} className={classnames('table-row', this.props.className)}>
                {Children.map(this.props.children, (child, idx) => {
                    if (child.type === Col) {
                        let _colIdx = colIdx++

                        if (this.props._inHeader) {
                            return React.cloneElement(child, {
                                _inHeader: this.props._inHeader,
                                _notifyCellResizing: this.props._notifyCellResizing.bind(null, idx),
                            })
                        } else {
                            // component maybe in TableBody
                            return React.cloneElement(child, {
                                _width: _widths[_colIdx],
                                _inHeader: false,
                            })
                        }
                    } else {
                        return child
                    }
                })}
            </div>
        )
    }
}

export class Col extends React.Component
{
    static propTypes = {
        _inHeader: PropTypes.bool,
        _notifyCellResizing: PropTypes.func,
        className: PropTypes.string,
        defaultWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        resizable: PropTypes.bool,
    }

    static defaultProps = {
        _inHeader: false,
        defaultWidth: 0,
        resizable: true,
    }

    constructor(...args)
    {
        super(...args)

        this.state = {
            width: this.props._inHeader ? this.props.defaultWidth : this.props._width,
            dragState: null,
        }
    }

    onResizeEnd = e => {
        this.props._notifyCellResizing && this.props._notifyCellResizing(e.clientX)
        this.setState({width: e.clientX})
    }

    render()
    {
        const {width} = this.state
        const {minWidth, maxWidth, resizable, _notifyCellResizing} = this.props

        const style = (width === 0) ? {flex: 1} : {width}
        Object.assign(style, {minWidth: this.props.minWidth, maxWidth: this.props.maxWidth})

        return (
            <div className={classnames('table-col', this.props.className)} style={style}>
                {this.props.children}
                <div
                    className='resizer'
                    draggable={(!!_notifyCellResizing) && resizable}
                    onDragEnd={this.onResizeEnd}
                />
            </div>
        )
    }
}
