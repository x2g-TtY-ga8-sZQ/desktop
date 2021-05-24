import * as React from 'react'
import { dragAndDropManager } from '../../../lib/drag-and-drop-manager'
import { DragData, DragType, DropTargetType } from '../../../models/drag-drop'

export const ListInsertionPlaceholderHeight = 15

enum InsertionFeedbackType {
  None,
  Top,
  Bottom,
}

interface IListItemInsertionOverlayProps {
  readonly onInsertionPointChange: (index: number | null) => void
  readonly onDropDataInsertion?: (
    insertionIndex: number,
    data: DragData
  ) => void

  readonly itemIndex: number
  readonly dragType: DragType
}

interface IListItemInsertionOverlayState {
  readonly feedbackType: InsertionFeedbackType
}

/** A component which displays a single commit in a commit list. */
export class ListItemInsertionOverlay extends React.PureComponent<
  IListItemInsertionOverlayProps,
  IListItemInsertionOverlayState
> {
  public constructor(props: IListItemInsertionOverlayProps) {
    super(props)

    this.state = {
      feedbackType: InsertionFeedbackType.None,
    }
  }

  public renderInsertionIndicator(feedbackType: InsertionFeedbackType) {
    return (
      <div
        className="list-insertion-point"
        onMouseEnter={this.getOnInsertionAreaMouseEnter(feedbackType)}
        onMouseLeave={this.onInsertionAreaMouseLeave}
        onMouseUp={this.onInsertionAreaMouseUp}
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
          className="list-insertion-point"
          onMouseEnter={this.getOnInsertionAreaMouseEnter(
            InsertionFeedbackType.Top
          )}
          onMouseLeave={this.onInsertionAreaMouseLeave}
          onMouseUp={this.onInsertionAreaMouseUp}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: ListInsertionPlaceholderHeight / 2,
          }}
        />
        {this.state.feedbackType === InsertionFeedbackType.Top &&
          this.renderInsertionIndicator(InsertionFeedbackType.Top)}
        {this.props.children}
        {this.state.feedbackType === InsertionFeedbackType.Bottom &&
          this.renderInsertionIndicator(InsertionFeedbackType.Bottom)}
        <div
          className="list-insertion-point"
          onMouseEnter={this.getOnInsertionAreaMouseEnter(
            InsertionFeedbackType.Bottom
          )}
          onMouseLeave={this.onInsertionAreaMouseLeave}
          onMouseUp={this.onInsertionAreaMouseUp}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height:
              ListInsertionPlaceholderHeight / 2 +
              (this.state.feedbackType === InsertionFeedbackType.Bottom
                ? ListInsertionPlaceholderHeight
                : 0),
          }}
        />
      </div>
    )
  }

  private isDragInProgress() {
    return dragAndDropManager.isDragOfTypeInProgress(this.props.dragType)
  }

  private getOnInsertionAreaMouseEnter(feedbackType: InsertionFeedbackType) {
    return (event: React.MouseEvent) => {
      this.switchToInsertionFeedbackType(feedbackType)
    }
  }

  private onInsertionAreaMouseLeave = (event: React.MouseEvent) => {
    this.switchToInsertionFeedbackType(InsertionFeedbackType.None)
  }

  private switchToInsertionFeedbackType(feedbackType: InsertionFeedbackType) {
    if (
      feedbackType !== InsertionFeedbackType.None &&
      !this.isDragInProgress()
    ) {
      return
    }

    this.setState({ feedbackType })

    if (feedbackType === InsertionFeedbackType.None) {
      this.props.onInsertionPointChange(null)
      dragAndDropManager.emitLeaveDropTarget()
    } else if (this.isDragInProgress()) {
      if (dragAndDropManager.dragData !== null) {
        dragAndDropManager.emitEnterDropTarget({
          type: DropTargetType.ListInsertionPoint,
          data: dragAndDropManager.dragData,
          index: this.props.itemIndex,
        })
      }
      this.props.onInsertionPointChange(this.props.itemIndex)
    }
  }

  private onInsertionAreaMouseUp = () => {
    if (
      !this.isDragInProgress() ||
      this.state.feedbackType === InsertionFeedbackType.None ||
      dragAndDropManager.dragData === null
    ) {
      return
    }

    if (this.props.onDropDataInsertion !== undefined) {
      let index = this.props.itemIndex

      if (this.state.feedbackType === InsertionFeedbackType.Bottom) {
        index++
      }
      this.props.onDropDataInsertion(index, dragAndDropManager.dragData)
    }

    this.switchToInsertionFeedbackType(InsertionFeedbackType.None)
  }
}
