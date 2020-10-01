import * as React from "react";

import { DiscState } from "../connect4Logic/models";

import "./GameBoard.css";

interface IGameBoardProps {
  discPlaced: (row: number, col: number) => void;
  height: number;
  width: number;
  nextMovePlayer: DiscState.PlayerOne | DiscState.PlayerTwo;
}

interface IGameBoardState {
  board: DiscState[][];
  placeable: boolean;
}

export class GameBoard extends React.Component<
  IGameBoardProps,
  IGameBoardState
> {
  public constructor(props: IGameBoardProps) {
    super(props);

    const board = new Array(this.props.height);

    for (let i = 0; i < board.length; i++) {
      board[i] = new Array(this.props.width).fill(DiscState.Empty);
    }

    this.state = {
      board,
      placeable: true,
    };
  }

  public render() {
    const constructedBoard = (
      <div className="GameBoard">
        {this.reverseArray(this.state.board).map((row, rowIndex) => {
          return (
            <div
              key={this.state.board.length - rowIndex - 1}
              className="GameBoard-row"
            >
              {row.map((disc, colIndex) => {
                let classname = "GameBoard-disc ";
                switch (disc) {
                  case DiscState.Empty:
                    classname += "empty";
                    break;
                  case DiscState.PlayerOne:
                    classname += "player_one";
                    break;
                  case DiscState.PlayerTwo:
                    classname += "player_two";
                    break;
                }
                return (
                  <div
                    key={colIndex}
                    className="GameBoard-grid"
                    onClick={this.placeDisc(colIndex)}
                  >
                    <div className={classname} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );

    return (
      <div>
        This is a Game board with size {this.props.height} * {this.props.width}
        <div style={{ textAlign: "center" }}>{constructedBoard}</div>
      </div>
    );
  }

  private reverseArray = (arr: DiscState[][]) => {
    const newArr = [];
    for (let i = arr.length - 1; i >= 0; i--) {
      newArr.push(arr[i]);
    }
    return newArr;
  };

  private colHeight = (col: number) => {
    let count = 0;
    for (let i = 0; i < this.props.height; i++) {
      if (this.state.board[i][col] === DiscState.Empty) {
        break;
      }
      count++;
    }
    return count;
  };

  private placeDisc = (col: number) => {
    return () => {
      if (!this.state.placeable) {
        return;
      }
      const newHeight = this.colHeight(col);
      if (newHeight === this.props.height) {
        return;
      }
      const board = Array.from(this.state.board);

      for (let i = this.props.height - 1; i >= newHeight; i--) {
        setTimeout(() => {
          board[i][col] = this.props.nextMovePlayer;
          if (i !== this.props.height - 1) {
            board[i + 1][col] = DiscState.Empty;
          }
          this.setState({
            board,
            placeable: i === newHeight,
          });
          if (i === newHeight) {
            setTimeout(() => {
              this.props.discPlaced(newHeight, col);
            }, 0);
          }
        }, (this.props.height - i) * 80);
      }
    };
  };
}
