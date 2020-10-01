import { DiscState, ThreatState } from "./models";

import Board from "./Board";

import ThreatBoard from "./ThreatBoard";

import { arrayMax, numOfThatElementIn } from "./utils/arrays";

const MINIMAX_WIN = 500; // Can eventually win minimax
const DOUBLE_THREAT = 800; // Can force a win
const INSTANT_WIN = 900;

// the following table is used in threatMoveScores() and threatMinimax()
//  2: winning move
//  1: blocking opponent threat
//  0: not harmful
//  -1: removing player's own threat
//  -2: letting the opponent win
//  null: col has no space

// get evaluation (board)
// return the evalutaion for the maximizingPlayer player

export default class ThreatEvaluation {
  public board: Board;
  public width: number;
  public height: number;
  public threatBoard: ThreatBoard;
  public currentMovePlayer: DiscState;
  public maximizingPlayer: DiscState;

  constructor(board: Board, maximizingPlayer: DiscState) {
    this.board = board.clone();
    this.width = board.width;
    this.height = board.height;
    this.maximizingPlayer = maximizingPlayer;
    this.currentMovePlayer = board.currentTurn();
    this.threatBoard = new ThreatBoard(board);
  }

  // return the array of scores of each move of the player regarding threat
  // return an array of the following values:
  // 2: winning move
  // 1: blocking opponent threat
  // 0: not harmful
  // -1: removing player's own threat
  // -2: letting the opponent win
  // null: col has no space
  public threatMoveScores = (
    currentBoard: Board,
    player: DiscState
  ): Array<number | null> => {
    const playerThreat =
      player === DiscState.PlayerOne
        ? ThreatState.PlayerOneThreat
        : ThreatState.PlayerTwoThreat;
    const opponentThreat =
      player === DiscState.PlayerOne
        ? ThreatState.PlayerTwoThreat
        : ThreatState.PlayerOneThreat;

    const scores = [];
    for (let i = 0; i < this.width; i++) {
      if (!currentBoard.colHasSpace(i)) {
        scores[i] = null;
        continue;
      }
      const chipsHeight = currentBoard.numChipsInCol(i);

      // if this square is player's threat, return 2
      if (
        this.threatBoard.threatArray[chipsHeight][i] === playerThreat ||
        this.threatBoard.threatArray[chipsHeight][i] ===
          ThreatState.BothPlayersThreat
      ) {
        scores[i] = 2;
        continue;
      }
      // if the square above is opponent's threat, return -2
      if (chipsHeight !== this.height - 1) {
        if (
          this.threatBoard.threatArray[chipsHeight + 1][i] === opponentThreat ||
          this.threatBoard.threatArray[chipsHeight + 1][i] ===
            ThreatState.BothPlayersThreat
        ) {
          scores[i] = -2;
          continue;
        }
      }

      // if this square is opponent's threat, return 1
      if (this.threatBoard.threatArray[chipsHeight][i] === opponentThreat) {
        scores[i] = 1;
        continue;
      }

      // if the square above is player's threat, return -1
      if (chipsHeight !== this.height - 1) {
        if (this.threatBoard.threatArray[chipsHeight + 1][i] === playerThreat) {
          scores[i] = -1;
          continue;
        }
      }
      // if not any of the above, then it is harmless
      scores[i] = 0;
    }
    return scores;
  };

  public threatMinimax = (currentBoard: Board, player: DiscState): number => {
    let currentPlayer: DiscState = player;
    let currentOpponent: DiscState;

    let scores;

    // predict obvious moves ahead until either player have choices to make
    while (true) {
      currentOpponent = Board.getOpponent(currentPlayer);

      // terminating node: board is full
      if (currentBoard.isFull()) {
        return 0;
      }

      scores = this.threatMoveScores(currentBoard, currentPlayer);
      // terminating node: either of them wins
      if (arrayMax(scores) === 2) {
        if (currentPlayer === this.maximizingPlayer) {
          return MINIMAX_WIN;
        } else if (currentPlayer === Board.getOpponent(this.maximizingPlayer)) {
          return -MINIMAX_WIN;
        } else {
          // console.error("somethings wrong");
        }
      }

      // now all moves are either 1, 0, -1, -2 or null (but not all are null)
      // make move

      // if 1 is available, make that move
      let index = scores.indexOf(1);
      if (index !== -1) {
        currentBoard.makeMove(index, currentPlayer);
        currentPlayer = currentOpponent;
        continue;
      }
      // if 0 is available, make that move
      index = scores.indexOf(0);
      if (index !== -1) {
        currentBoard.makeMove(index, currentPlayer);
        currentPlayer = currentOpponent;
        continue;
      }
      // now all remaining moves are -1, or -2

      // if no -1 move available, make a -2 move
      index = scores.indexOf(-1);
      if (index === -1) {
        index = scores.indexOf(-2);
        currentBoard.makeMove(index, currentPlayer);
        currentPlayer = currentOpponent;
        continue;
      }

      // if only one -1 move available, do it
      if (numOfThatElementIn(scores, -1) === 1) {
        index = scores.indexOf(-1);
        currentBoard.makeMove(index, currentPlayer);
        currentPlayer = currentOpponent;
        continue;
      }

      // Not any case above: have multiple -1 cases to choose from
      break;
    }

    // now player or opponent has to decide which -1 move to choose from
    // for each score===-1, make a copyBoard and do minimax, return the highest/lowest
    let copiedBoard: Board;
    let returnValue = null;
    for (let i = 0; i < scores.length; i++) {
      if (scores[i] !== -1) {
        continue;
      }
      copiedBoard = currentBoard.clone(); // deepExtend({},currentBoard);
      copiedBoard.makeMove(i, currentPlayer);
      if (returnValue === null) {
        returnValue = this.threatMinimax(copiedBoard, currentOpponent);
      } else {
        if (currentPlayer === this.maximizingPlayer) {
          returnValue = Math.max(
            returnValue,
            this.threatMinimax(copiedBoard, currentOpponent)
          );
        } else if (currentPlayer === Board.getOpponent(this.maximizingPlayer)) {
          returnValue = Math.min(
            returnValue,
            this.threatMinimax(copiedBoard, currentOpponent)
          );
        } else {
          // console.error("somethings wrong");
        }
      }
    }
    //  return 0 if it is null
    return returnValue || 0;
  };

  // calculate whether the maximizingPlayer can win given the current threats
  // not 100% accurate as more threats are created when the minimax continue
  // which are not taken into account
  // it is an approximaion but good enough for practical use
  public getEvaluation = (): number => {
    // if any player has effective double threats
    if (this.threatBoard.hasDoubleEffectiveThreat(this.maximizingPlayer)) {
      return DOUBLE_THREAT;
    } else if (
      this.threatBoard.hasDoubleEffectiveThreat(
        Board.getOpponent(this.maximizingPlayer)
      )
    ) {
      return -DOUBLE_THREAT;
    }

    // if any player has a instant winning move
    if (this.currentMovePlayer === this.maximizingPlayer) {
      const scores = this.threatMoveScores(this.board, this.maximizingPlayer);
      if (arrayMax(scores) === 2) {
        return INSTANT_WIN;
      }
      if (arrayMax(scores) === -2) {
        return -INSTANT_WIN;
      }
    } else if (
      this.currentMovePlayer === Board.getOpponent(this.maximizingPlayer)
    ) {
      const scores = this.threatMoveScores(
        this.board,
        Board.getOpponent(this.maximizingPlayer)
      );
      if (arrayMax(scores) === 2) {
        return -INSTANT_WIN;
      }
      if (arrayMax(scores) === -2) {
        return INSTANT_WIN;
      }
    } else {
      // should not go here
      // console.error("somethings wrong");
    }

    // use minimax to find out which player would win
    const copiedBoard = this.board.clone(); // deepExtend({},this.board);
    // todo
    return this.threatMinimax(copiedBoard, this.currentMovePlayer);
  };
}
