import * as React from 'react'
import { dragAndDropManager } from '../../../lib/drag-and-drop-manager'
import { DragType } from '../../../models/drag-drop'

export const ListInsertionPlaceholderHeight = 15

enum InsertionFeedbackType {
  None,
  Top,
  Bottom,
}

interface IListItemInsertionOverlayProps {
  readonly onInsertionPointChange: (index: number | null) => void

  readonly itemIndex: number
  readonly allowBottomInsertion: boolean
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
        {this.state.feedbackType === InsertionFeedbackType.Top &&
          this.renderInsertionIndicator(true)}
        {this.props.children}
        {this.state.feedbackType === InsertionFeedbackType.Bottom &&
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
                (this.state.feedbackType === InsertionFeedbackType.Bottom
                  ? ListInsertionPlaceholderHeight
                  : 0),
            }}
          />
        )}
      </div>
    )
  }

  private isDragInProgress() {
    return dragAndDropManager.isDragOfTypeInProgress(this.props.dragType)
  }

  private onTopInsertionAreaMouseEnter = (event: React.MouseEvent) => {
    this.switchToInsertionFeedbackType(InsertionFeedbackType.Top)
  }

  private onTopInsertionAreaMouseLeave = (event: React.MouseEvent) => {
    this.switchToInsertionFeedbackType(InsertionFeedbackType.None)
  }

  private onBottomInsertionAreaMouseEnter = (event: React.MouseEvent) => {
    this.switchToInsertionFeedbackType(InsertionFeedbackType.Bottom)
  }

  private onBottomInsertionAreaMouseLeave = (event: React.MouseEvent) => {
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
    } else if (this.isDragInProgress()) {
      this.props.onInsertionPointChange(this.props.itemIndex)
    }
  }
}
