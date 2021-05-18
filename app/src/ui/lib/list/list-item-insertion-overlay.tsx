import * as React from 'react'
import { dragAndDropManager } from '../../../lib/drag-and-drop-manager'

export const ListInsertionPlaceholderHeight = 15

interface IListItemInsertionOverlayProps {
  readonly onInsertionPointChange: (index: number | null) => void

  readonly itemIndex: number
  readonly allowBottomInsertion: boolean
}

interface IListItemInsertionOverlayState {
  readonly showTopInsertionIndicator: boolean
  readonly showBottomInsertionIndicator: boolean
}

/** A component which displays a single commit in a commit list. */
export class ListItemInsertionOverlay extends React.PureComponent<
  IListItemInsertionOverlayProps,
  IListItemInsertionOverlayState
> {
  public constructor(props: IListItemInsertionOverlayProps) {
    super(props)

    this.state = {
      showTopInsertionIndicator: false,
      showBottomInsertionIndicator: false,
    }
  }

  public renderInsertionIndicator(isTop: boolean) {
    return (
      <div
        onMouseEnter={
          isTop
            ? this.onTopInsertionAreaMouseEnter
            : this.onBottomInsertionAreaMouseEnter
        }
        onMouseLeave={
          isTop
            ? this.onTopInsertionAreaMouseLeave
            : this.onBottomInsertionAreaMouseLeave
        }
        style={{
          width: '100%',
          height: ListInsertionPlaceholderHeight,
          flexShrink: 0,
          backgroundColor: 'lightgray',
          zIndex: 1,
        }}
      />
    )
  }

  public render() {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          onMouseEnter={this.onTopInsertionAreaMouseEnter}
          onMouseLeave={this.onTopInsertionAreaMouseLeave}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: ListInsertionPlaceholderHeight / 2,
          }}
        />
        {this.state.showTopInsertionIndicator &&
          this.renderInsertionIndicator(true)}
        {this.props.children}
        {this.state.showBottomInsertionIndicator &&
          this.props.allowBottomInsertion &&
          this.renderInsertionIndicator(false)}
        {this.props.allowBottomInsertion && (
          <div
            onMouseEnter={this.onBottomInsertionAreaMouseEnter}
            onMouseLeave={this.onBottomInsertionAreaMouseLeave}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height:
                ListInsertionPlaceholderHeight / 2 +
                (this.state.showBottomInsertionIndicator
                  ? ListInsertionPlaceholderHeight
                  : 0),
            }}
          />
        )}
      </div>
    )
  }

  private onTopInsertionAreaMouseEnter = (event: React.MouseEvent) => {
    this.setState({
      showTopInsertionIndicator: dragAndDropManager.isDragInProgress,
    })

    if (dragAndDropManager.isDragInProgress) {
      this.props.onInsertionPointChange(this.props.itemIndex)
    }
  }

  private onTopInsertionAreaMouseLeave = (event: React.MouseEvent) => {
    this.setState({ showTopInsertionIndicator: false })
    this.props.onInsertionPointChange(null)
  }

  private onBottomInsertionAreaMouseEnter = (event: React.MouseEvent) => {
    this.setState({
      showBottomInsertionIndicator: dragAndDropManager.isDragInProgress,
    })

    if (dragAndDropManager.isDragInProgress) {
      this.props.onInsertionPointChange(this.props.itemIndex)
    }
  }

  private onBottomInsertionAreaMouseLeave = (event: React.MouseEvent) => {
    this.setState({ showBottomInsertionIndicator: false })
    this.props.onInsertionPointChange(null)
  }
}
