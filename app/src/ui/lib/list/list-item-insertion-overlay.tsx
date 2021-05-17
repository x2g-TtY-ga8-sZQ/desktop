import { String } from 'aws-sdk/clients/athena'
import * as React from 'react'
import { dragAndDropManager } from '../../../lib/drag-and-drop-manager'

interface IListItemInsertionOverlayProps {
  readonly something?: String
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
      <>
        <div
          style={{
            position: 'absolute',
            top: isTop ? -2 : undefined,
            left: 10,
            right: 0,
            bottom: isTop ? undefined : 0,
            height: '2px',
            backgroundColor: 'var(--focus-color)',
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: isTop ? -6 : undefined,
            left: 0,
            bottom: isTop ? undefined : -4,
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
      <div style={{ width: '100%', height: '100%' }}>
        {this.props.children}
        <div
          onMouseEnter={this.onTopInsertionAreaMouseEnter}
          onMouseLeave={this.onTopInsertionAreaMouseLeave}
          style={{
            position: 'absolute',
            top: 0,
            left: 10,
            right: 15,
            height: '15px',
          }}
        >
          {this.state.showTopInsertionIndicator &&
            this.renderInsertionIndicator(true)}
        </div>
        <div
          onMouseEnter={this.onBottomInsertionAreaMouseEnter}
          onMouseLeave={this.onBottomInsertionAreaMouseLeave}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 10,
            right: 15,
            height: '15px',
          }}
        >
          {this.state.showBottomInsertionIndicator &&
            this.renderInsertionIndicator(false)}
        </div>
      </div>
    )
  }

  private onTopInsertionAreaMouseEnter = (event: React.MouseEvent) => {
    this.setState({
      showTopInsertionIndicator: dragAndDropManager.isDragInProgress,
    })
  }
  private onTopInsertionAreaMouseLeave = (event: React.MouseEvent) => {
    this.setState({ showTopInsertionIndicator: false })
  }

  private onBottomInsertionAreaMouseEnter = (event: React.MouseEvent) => {
    this.setState({
      showBottomInsertionIndicator: dragAndDropManager.isDragInProgress,
    })
  }
  private onBottomInsertionAreaMouseLeave = (event: React.MouseEvent) => {
    this.setState({ showBottomInsertionIndicator: false })
  }
}
