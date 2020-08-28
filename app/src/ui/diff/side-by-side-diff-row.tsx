import * as React from 'react'
import { getTokensForDiffLine } from './diff-syntax-mode'
import { syntaxHighlightLine, getDiffTokens } from './syntax-highlighting/utils'
import { ITokens } from '../../lib/highlighter/types'
import { DiffLine } from '../../models/diff'
import {
  WorkingDirectoryFileChange,
  CommittedFileChange,
} from '../../models/status'

const MaxLineLengthToCalculateDiff = 240

export enum DiffRowType {
  Added = 'Added',
  Deleted = 'Deleted',
  Modified = 'Modified',
  Context = 'Context',
  Hunk = 'Hunk',
}

interface IDiffRowAdded {
  readonly type: DiffRowType.Added
  readonly content: string
  readonly lineNumber: number
  readonly diffLine: DiffLine
  readonly diffLineNumber: number
  readonly isSelected: boolean
}

interface IDiffRowDeleted {
  readonly type: DiffRowType.Deleted
  readonly content: string
  readonly lineNumber: number
  readonly diffLine: DiffLine
  readonly diffLineNumber: number
  readonly isSelected: boolean
}

interface IDiffRowModified {
  readonly type: DiffRowType.Modified
  readonly before: {
    readonly content: string
    readonly lineNumber: number
    readonly diffLine: DiffLine
    readonly diffLineNumber: number
    readonly isSelected: boolean
  }
  readonly after: {
    readonly content: string
    readonly lineNumber: number
    readonly diffLine: DiffLine
    readonly diffLineNumber: number
    readonly isSelected: boolean
  }
  readonly displayDiffTokens: boolean
}

interface IDiffRowContext {
  readonly type: DiffRowType.Context
  readonly content: string
  readonly beforeLineNumber: number
  readonly afterLineNumber: number
  readonly diffLine: DiffLine
}

interface IDiffRowHunk {
  readonly type: DiffRowType.Hunk
  readonly content: string
}

export type DiffRow =
  | IDiffRowAdded
  | IDiffRowDeleted
  | IDiffRowModified
  | IDiffRowContext
  | IDiffRowHunk

type ChangedFile = WorkingDirectoryFileChange | CommittedFileChange

interface ISideBySideDiffRowProps {
  readonly row: DiffRow
  readonly beforeTokens?: ITokens
  readonly afterTokens?: ITokens

  /** The file whose diff should be displayed. */
  readonly file: ChangedFile

  readonly onStartSelection?: (from: number, isSelected: boolean) => void
  readonly onUpdateSelection?: (lineNumber: number) => void
}

export class SideBySideDiffRow extends React.Component<
  ISideBySideDiffRowProps
> {
  public render() {
    switch (this.props.row.type) {
      case DiffRowType.Hunk:
        return (
          <div className="row hunk-info">
            <div className="gutter"></div>
            <div className="content">{this.props.row.content}</div>
          </div>
        )
      case DiffRowType.Context:
        const tokens = getTokensForDiffLine(
          this.props.row.diffLine,
          this.props.beforeTokens,
          this.props.afterTokens
        )

        return (
          <div className="row context">
            <div className="before">
              <div className="gutter">{this.props.row.beforeLineNumber}</div>
              <div className="content">
                {syntaxHighlightLine(
                  this.props.row.content,
                  tokens !== null ? [tokens] : []
                )}
              </div>
            </div>
            <div className="after">
              <div className="gutter">{this.props.row.afterLineNumber}</div>
              <div className="content">
                {syntaxHighlightLine(
                  this.props.row.content,
                  tokens !== null ? [tokens] : []
                )}
              </div>
            </div>
          </div>
        )

      case DiffRowType.Added: {
        const tokens = getTokensForDiffLine(
          this.props.row.diffLine,
          this.props.beforeTokens,
          this.props.afterTokens
        )

        return (
          <div className="row added" onMouseEnter={this.onMouseEnterGutter}>
            <div className="before">
              <div className="gutter"></div>
              <div className="content"></div>
            </div>
            <div className="after">
              {this.renderGutter(
                this.props.row.diffLineNumber,
                this.props.row.lineNumber,
                this.props.row.isSelected
              )}
              <div className="content">
                {syntaxHighlightLine(
                  this.props.row.content,
                  tokens !== null ? [tokens] : []
                )}
              </div>
            </div>
          </div>
        )
      }
      case DiffRowType.Deleted: {
        const tokens = getTokensForDiffLine(
          this.props.row.diffLine,
          this.props.beforeTokens,
          this.props.afterTokens
        )

        return (
          <div className="row deleted" onMouseEnter={this.onMouseEnterGutter}>
            <div className="before">
              {this.renderGutter(
                this.props.row.diffLineNumber,
                this.props.row.lineNumber,
                this.props.row.isSelected
              )}
              <div className="content">
                {syntaxHighlightLine(
                  this.props.row.content,
                  tokens !== null ? [tokens] : []
                )}
              </div>
            </div>
            <div className="after">
              <div className="gutter"></div>
              <div className="content"></div>
            </div>
          </div>
        )
      }
      case DiffRowType.Modified: {
        const syntaxTokensBefore = getTokensForDiffLine(
          this.props.row.before.diffLine,
          this.props.beforeTokens,
          this.props.afterTokens
        )
        const syntaxTokensAfter = getTokensForDiffLine(
          this.props.row.after.diffLine,
          this.props.beforeTokens,
          this.props.afterTokens
        )
        const tokensBefore =
          syntaxTokensBefore !== null ? [syntaxTokensBefore] : []
        const tokensAfter =
          syntaxTokensAfter !== null ? [syntaxTokensAfter] : []

        if (
          this.props.row.displayDiffTokens &&
          this.props.row.before.content.length < MaxLineLengthToCalculateDiff &&
          this.props.row.after.content.length < MaxLineLengthToCalculateDiff
        ) {
          const { before, after } = getDiffTokens(
            this.props.row.before.content,
            this.props.row.after.content
          )
          tokensBefore.push(before)
          tokensAfter.push(after)
        }

        return (
          <div className="row modified">
            <div className="before" onMouseEnter={this.onMouseEnterGutter}>
              {this.renderGutter(
                this.props.row.before.diffLineNumber,
                this.props.row.before.lineNumber,
                this.props.row.before.isSelected
              )}
              <div className="content">
                {syntaxHighlightLine(
                  this.props.row.before.content,
                  tokensBefore
                )}
              </div>
            </div>

            <div className="after" onMouseEnter={this.onMouseEnterGutter}>
              {this.renderGutter(
                this.props.row.after.diffLineNumber,
                this.props.row.after.lineNumber,
                this.props.row.after.isSelected
              )}
              <div className="content">
                {syntaxHighlightLine(this.props.row.after.content, tokensAfter)}
              </div>
            </div>
          </div>
        )
      }
    }
  }

  private renderGutter(
    diffLineNumber: number,
    lineNumber: number,
    isSelected: boolean
  ) {
    if (!canSelect(this.props.file)) {
      return <div className="gutter">{lineNumber}</div>
    }

    return (
      <div
        className={`gutter selectable ${isSelected ? 'line-selected ' : ''}`}
        onMouseDown={this.onMouseDownGutter}
      >
        {lineNumber}
      </div>
    )
  }

  private onMouseDownGutter = (evt: React.MouseEvent) => {
    if (!canSelect(this.props.file)) {
      return
    }

    if (this.props.onStartSelection === undefined) {
      return
    }

    const diffLineNumber = this.getDiffLineNumber(evt)
    const isSelected = this.getIsSelected(evt)

    if (diffLineNumber === null || isSelected === null) {
      return
    }

    this.props.onStartSelection(diffLineNumber, !isSelected)
  }

  private onMouseEnterGutter = (evt: React.MouseEvent) => {
    if (!canSelect(this.props.file)) {
      return
    }

    if (this.props.onUpdateSelection === undefined) {
      return
    }

    const diffLineNumber = this.getDiffLineNumber(evt)

    if (diffLineNumber === null) {
      return
    }

    this.props.onUpdateSelection(diffLineNumber)
  }

  private getDiffLineNumber(evt: React.MouseEvent | MouseEvent) {
    if (
      this.props.row.type === DiffRowType.Added ||
      this.props.row.type === DiffRowType.Deleted
    ) {
      return this.props.row.diffLineNumber
    }

    if (this.props.row.type === DiffRowType.Modified) {
      const target = evt.target as HTMLElement

      if (target.closest('.before')) {
        return this.props.row.before.diffLineNumber
      }

      return this.props.row.after.diffLineNumber
    }

    return null
  }
  private getIsSelected(evt: React.MouseEvent) {
    if (
      this.props.row.type === DiffRowType.Added ||
      this.props.row.type === DiffRowType.Deleted
    ) {
      return this.props.row.isSelected
    }

    if (this.props.row.type === DiffRowType.Modified) {
      const target = evt.target as HTMLElement

      if (target.closest('.before')) {
        return this.props.row.before.isSelected
      }

      return this.props.row.after.isSelected
    }

    return null
  }
}

/** Utility function for checking whether a file supports selection */
function canSelect(file: ChangedFile): file is WorkingDirectoryFileChange {
  return file instanceof WorkingDirectoryFileChange
}