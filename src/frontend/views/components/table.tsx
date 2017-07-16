import * as _ from 'lodash'
import * as React from 'react'
import {Children} from 'react'
import * as PropTypes from 'prop-types'
import * as classnames from 'classnames'

interface TableProps {
    className?: string
}
export class Table extends React.Component<TableProps, any>
{
    public static propTypes = {
        className: PropTypes.string,
    }

    constructor(props: TableProps, context: any)
    {
        super(props, context)

        const columnWidths: number[] = []
        Children.toArray(this.props.children).forEach((child: React.ReactElement<any>) => {
            if ((child.type as any) !== TableHeader) return

            Children.toArray(child.props.children).forEach((maybeRowChild: React.ReactElement<any>) => {
                if ((maybeRowChild.type as any) !== Row) return

                Children.toArray(maybeRowChild.props.children).forEach((maybeColChild: React.ReactElement<any>) => {
                    if ((maybeColChild.type as any) !== Col) return

                    columnWidths.push(maybeColChild.props.defaultWidth)
                })
            })
        })

        this.state = {
            columnWidths: columnWidths,
        }
    }

    private handleCellResizing = (cellIdx: number, width: number) =>
    {
        const _widths = this.state.columnWidths.slice(0)
        _widths[cellIdx] = width
        this.setState({columnWidths: _widths})
    }

    public render()
    {
        const {className, children, ...props} = this.props
        return (
            <div className={classnames('_table', className)} {...props}>
                {Children.map(children, (child: React.ReactElement<any>) => {
                    if ((child.type as any) === TableHeader) {
                        return React.cloneElement(child, {
                            _notifyCellResizing: this.handleCellResizing,
                        })
                    } else if (
                        (child.type as any) === TableBody
                        || (child.type as any) === TableBodySelectList
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

interface TableHeaderProps {
    _notifyCellResizing: Function,
    className?: string,
}
export class TableHeader extends React.Component<TableHeaderProps, any>
{
    public static propTypes = {
        _notifyCellResizing: PropTypes.func,
        className: PropTypes.string,
    }

    public render()
    {
        return (
            <div className={classnames('table-header', this.props.className)}>
                {Children.map(this.props.children, (child: React.ReactElement<any>, idx) => {
                    if ((child.type as any) === Row) {
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

interface TableBodyProps {
    _widths: number[]|string[],
    className?: string,
}
export class TableBody extends React.Component<TableBodyProps, any>
{
    public static propTypes = {
        _widths: PropTypes.arrayOf(
            PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string
            ])
        ),
        className: PropTypes.string,
    }

    public render()
    {
        return (
            <div className={classnames('table-body', this.props.className)}>
                {Children.map(this.props.children, (child: React.ReactElement<any>, idx) => {
                    if ((child.type as any) === Row) {
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

interface TableBodySelectListProps {
    _widths: number[]|string[],
    className: string,
    multiple?: boolean,
    onSelectionChanged: (selection: number[]) => any,
}
interface TableBodySelectListState {
    lastSelectedIdx: number,
    selected: number[],
}
export class TableBodySelectList extends React.Component<TableBodySelectListProps, TableBodySelectListState>
{
    public static propTypes = {
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

    public static defaultProps = {
        multiple: false,
    }

    public state = {
        lastSelectedIdx: null,
        selected: [],
    }

    private clearSelection()
    {

    }

    private onClickItem = (idx: number, e: MouseEvent) =>
    {
        const {lastSelectedIdx, selected} = this.state

        if (lastSelectedIdx == null) {
            return this.setState({lastSelectedIdx: idx, selected: [idx]})
        } else if (e.shiftKey) {
            return this.setState({
                // lastSelectedIdx: idx,
                selected: [... _.range(lastSelectedIdx, idx), idx]
            })
        } else if (e.ctrlKey || e.metaKey) {
            if (selected.includes(idx)) {
                return this.setState({
                    lastSelectedIdx: idx,
                    selected: _.without(selected, idx)
                })
            } else {
                return this.setState({
                    lastSelectedIdx: idx,
                    selected: [...selected, idx]
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

    public render()
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

export class TableFooter extends React.Component<{className: string}, null>
{
    public static propTypes = {
        className: PropTypes.string,
    }

    public render()
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
    public static propTypes = {
        _inHeader: PropTypes.bool,
        _notifyCellResizing: PropTypes.func,
        _widths: PropTypes.arrayOf(
            PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string
            ])
        ),
        className: PropTypes.string,
    }

    public static defaultProps = {
        _inHeader: false,
    }

    constructor(...args)
    {
        super(...args)
    }

    public render()
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

export class Col extends React.Component<any, any>
{
    public static propTypes = {
        _inHeader: PropTypes.bool,
        _notifyCellResizing: PropTypes.func,
        className: PropTypes.string,
        defaultWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        resizable: PropTypes.bool,
    }

    public static defaultProps = {
        _inHeader: false,
        defaultWidth: 0,
        resizable: true,
    }

    constructor(props: any, context: any)
    {
        super(props, context)

        this.state = {
            width: this.props._inHeader ? this.props.defaultWidth : this.props._width,
            dragState: null,
        }
    }

    private onResizeEnd = e =>
    {
        this.props._notifyCellResizing && this.props._notifyCellResizing(e.clientX)
        this.setState({width: e.clientX})
    }

    public render()
    {
        const {width} = this.state
        const {resizable, _notifyCellResizing} = this.props

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
