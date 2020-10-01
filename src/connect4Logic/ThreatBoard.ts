import { DiscState, ThreatState } from "./models";

import Board from "./Board";

export default class ThreatBoard {
  public width: number;
  public height: number;
  public threatArray: ThreatState[][];
  public firstPlayer: DiscState;
  public board: Board;

  constructor(board: Board) {
    this.board = board;
    this.width = board.width;
    this.height = board.height;
    this.firstPlayer = board.firstPlayer;

    // initializing threat board's array with no threat
    this.threatArray = new Array(this.height);
    for (let i = 0; i < this.height; i++) {
      this.threatArray[i] = new Array(this.width).fill(ThreatState.None);
    }

    for (let i = 0; i < this.board.height; i++) {
      for (let j = 0; j < this.board.width; j++) {
        if (this.board.boardArray[i][j] !== DiscState.Empty) {
          continue;
        }
        if (this.isThreat(DiscState.PlayerOne, i, j)) {
          if (this.isThreat(DiscState.PlayerTwo, i, j)) {
            this.threatArray[i][j] = ThreatState.BothPlayersThreat;
          } else {
            this.threatArray[i][j] = ThreatState.PlayerOneThreat;
          }
        } else {
          if (this.isThreat(DiscState.PlayerTwo, i, j)) {
            this.threatArray[i][j] = ThreatState.PlayerTwoThreat;
          }
        }
      }
    }
  }

  public isThreat(player: DiscState, row: number, col: number) {
    if (this.board.boardArray[row][col] !== DiscState.Empty) {
      return false;
    }
    let result = false;
    this.board.boardArray[row][col] = player;
    if (this.board.hasWonOnSquare(player, row, col)) {
      result = true;
    }
    this.board.boardArray[row][col] = DiscState.Empty;
    return result;
  }

  // indicate if the player has effective double threat
  public hasDoubleEffectiveThreat = (player: DiscState) => {
    const playerThreat =
      player === DiscState.PlayerOne
        ? ThreatState.PlayerOneThreat
        : ThreatState.PlayerTwoThreat;
    const opponentThreat =
      player === DiscState.PlayerOne
        ? ThreatState.PlayerTwoThreat
        : ThreatState.PlayerOneThreat;

    for (let j = 0; j < this.width; j++) {
      for (let i = 0; i < this.height - 1; i++) {
        if (this.threatArray[i][j] === opponentThreat) {
          break;
        }
        if (
          this.threatArray[i][j] === playerThreat &&
          (this.threatArray[i + 1][j] === playerThreat ||
            this.threatArray[i + 1][j] === ThreatState.BothPlayersThreat)
        ) {
          return true;
        }
      }
    }
    return false;
  };
}
