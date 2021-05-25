import * as React from 'react'
import { dragAndDropManager } from '../../../lib/drag-and-drop-manager'
import { DragData, DragType, DropTargetType } from '../../../models/drag-drop'

const ListInsertionAreaHeight = 15

enum InsertionFeedbackType {
  None,
  Top,
  Bottom,
}

interface IListItemInsertionOverlayProps {
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
    const isTop = feedbackType === InsertionFeedbackType.Top

    return (
      <>
        <div
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            top: isTop ? -1 : undefined,
            left: 10,
            right: 0,
            bottom: isTop ? undefined : -1,
            height: '2px',
            backgroundColor: 'var(--focus-color)',
            zIndex: 1,
          }}
        />
        <div
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            top: isTop ? -5 : undefined,
            left: 0,
            bottom: isTop ? undefined : -5,
            width: '10px',
            height: '10px',
            borderColor: 'var(--focus-color)',
            borderRadius: '50%',
            borderStyle: 'solid',
            borderWidth: '2px',
            zIndex: 1,
          }}
        />
      </>
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
            height: ListInsertionAreaHeight,
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
            height: ListInsertionAreaHeight,
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

    console.log(feedbackType, this.props.itemIndex)

    this.setState({ feedbackType })

    if (feedbackType === InsertionFeedbackType.None) {
      dragAndDropManager.emitLeaveDropTarget()
    } else if (
      this.isDragInProgress() &&
      dragAndDropManager.dragData !== null
    ) {
      dragAndDropManager.emitEnterDropTarget({
        type: DropTargetType.ListInsertionPoint,
        data: dragAndDropManager.dragData,
        index: this.props.itemIndex,
      })
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
