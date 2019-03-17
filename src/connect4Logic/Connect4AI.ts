import { DiscState } from './models';

import { arrayMax, arrayMin, indicesOf } from './utils/arrays';

const POSSIBLE_CONNECTEDNESS_WEIGHT= 8;
const INNER_CONNECTEDNESS_WEIGHT= 30;

import Board from './Board';
import ThreatEvaluation from './ThreatEvaluation';

export default class Connect4AI{
  public board:Board;
  public player:DiscState;
  public opponent:DiscState;
  public searchDepth:number;

  constructor(board:Board,player:DiscState,difficulty:number){
    this.board = board;
    this.player = player;
    this.opponent = Board.getOpponent(player);
    this.searchDepth = difficulty;  
  }

  public makeMove = ():void=>{
    this.board.makeMove(this.getMove(),this.player);
  }

  // return the optimal move given the board configuration and moves
  public getMove = ():number=>{

    if(this.board.isFull()){
      return -1;
    }

    // if this.player has a winning move, take it
    const winMoves = [];
    for(let i = 0; i<this.board.width; i++){
      if(this.board.colHasSpace(i)){
        const copiedBoard = this.board.clone();
        copiedBoard.makeMove(i,this.player);
        if(copiedBoard.hasWon(this.player)){
          winMoves.push(i);
        }
      }
    }

    // randomly pick if player has more than one winning move
    if(winMoves.length!==0){
      return winMoves[Math.floor(Math.random()*winMoves.length)];
    }

    // if opponent has a winning move, take it
    const opponentWinMoves = [];
    for(let i = 0; i<this.board.width; i++){
      if(this.board.colHasSpace(i)){
        const copiedBoard = this.board.clone();
        copiedBoard.makeMove(i,this.opponent);
        if(copiedBoard.hasWon(this.opponent)){
          opponentWinMoves.push(i);
        }
      }
    }

    // randomly pick if opponent has more than one winning move
    if(opponentWinMoves.length!==0){
      return opponentWinMoves[Math.floor(Math.random()*opponentWinMoves.length)];
    }

    // do minimax
    const scores = [];
    for(let i =0;i<this.board.width;i++){
      if(!this.board.colHasSpace(i)){
        scores[i]=null;
        continue;
      }
      if(this.searchDepth===0){
        scores[i]=0;
        continue;
      }
      const copiedBoard = this.board.clone();
      copiedBoard.makeMove(i,this.player);
      scores[i] = this.alphaBeta(copiedBoard,this.searchDepth,-100000,100000,this.opponent,i);
      scores[i] = Math.round((scores[i]||0)*1000)/1000.0;
    }

    const bestScore = arrayMax(scores);
    const bestMoves = indicesOf(scores,bestScore);

    // randomly pick if there are more than one best move
    const randomIndex = Math.floor(Math.random()*bestMoves.length);
    return bestMoves[randomIndex];
  }

  // minimax algorithm with alphabeta pruning
  public alphaBeta = (currentBoard:Board,depth:number,alpha:number,beta:number,currentPlayer:DiscState,latestCol:number):number=>{
    const currentOpponent = Board.getOpponent(currentPlayer);

    if(depth===0||currentBoard.isFull()||
      currentBoard.hasWonOnSquare(currentOpponent,currentBoard.numChipsInCol(latestCol)-1,latestCol)){
      return this.evaluateBoard(currentBoard,this.searchDepth-depth,latestCol);
    }

    let columns:number[];
    if(depth > 2){ // use nodesOrder so can cut off the subtree that are likely to be cut off earlier
      columns = this.nodesOrder(currentBoard,currentPlayer);
    } else { // dont use nodesOrder() nodes order for the deepest 2 level which ow slower
      columns = Array(currentBoard.width).fill(0).map((val,index)=>index);
    }

    let v;
    if(currentPlayer===this.player){ // maximizing player
      v = -100000;
      for(const col of columns){
        if(!currentBoard.colHasSpace(col)){
          continue;
        }
        // create child node
        const copiedBoard = currentBoard.clone();
        copiedBoard.makeMove(col,currentPlayer);
  
        v = Math.max(v,this.alphaBeta(copiedBoard,depth-1,alpha,beta,currentOpponent,col));
        alpha = Math.max(alpha,v);

        if(beta<=alpha){
          break;
        }
      }
    } else { // minimizing player
      v = 100000;
      for(const col of columns){
        if(!currentBoard.colHasSpace(col)){
          continue;
        }
        // create child node
        const copiedBoard = currentBoard.clone();
        copiedBoard.makeMove(col,currentPlayer);
  
        // minimizing player
        v = Math.min(v,this.alphaBeta(copiedBoard,depth-1,alpha,beta,currentOpponent,col));
        beta = Math.min(beta,v);
  
        if(beta<=alpha){
          break;
        }
      }
    }

    return v;
  }

  // return the order of nodes by higher/lower static evaluation score
  // so alphabeta can cut off the subtree that are likely to be cut off earlier
  public nodesOrder = (board:Board,currentPlayer:DiscState):number[]=>{
    const scores = [];
    for(let i = 0; i<board.width;i++){
      if(!board.colHasSpace(i)){
        scores[i] = null;
        continue;
      }
      const copiedBoard = board.clone();
      copiedBoard.makeMove(i,currentPlayer);
      scores[i] = this.evaluateBoard(copiedBoard,0,i);
    }
    const order = [];

    while(arrayMax(scores)!==null){ // while scores has non null number
      const currentHighest = arrayMax(scores);
      const currentLowest = arrayMin(scores);
      let index:number;
      if(currentPlayer===this.player){ // maximaxing player get descending order
        index = scores.indexOf(currentHighest);
      } else { // opponent get accending order
        index = scores.indexOf(currentLowest);
      }
      order.push(index);
      scores[index] = null;
    }

    return order;
  }

  // heuristic function static evaluation
  // take the latest column as input to speed up computation
  // also accept null if the latest column is not known
  public evaluateBoard = (board:Board,depth:number,latestCol:number):number=>{
    let playerWin;
    let opponentWin;
    if(latestCol===null){
      playerWin = board.hasWon(this.player);
      opponentWin = board.hasWon(this.opponent);
    } else {
      playerWin = board.hasWonOnSquare(this.player,board.numChipsInCol(latestCol)-1,latestCol);
      opponentWin = board.hasWonOnSquare(this.opponent,board.numChipsInCol(latestCol)-1,latestCol);
    }

    if(playerWin){
      return 1000-depth;
    } else if (opponentWin){
      return depth-1000;
    } else {
      const threatScore = new ThreatEvaluation(board,this.player).getEvaluation();
      return threatScore
      +(this.possibleConnectedness(board,this.player)-this.possibleConnectedness(board,this.opponent))*POSSIBLE_CONNECTEDNESS_WEIGHT
      +(this.innerConnectedness(board,this.player)-this.innerConnectedness(board,this.opponent))*INNER_CONNECTEDNESS_WEIGHT
      ;
    }
  }

  // give a score of how connected the player's chips are potentially
  // defined by the number of player chips surrounded for each DiscState.Empty square
  public possibleConnectedness = (board:Board,player:DiscState):number=>{
    let counter = 0;
    let startCol;
    let startRow;
    let endCol;
    let endRow;
    for(let j=0;j<board.width;j++){
      for(let i=0;i<board.height;i++){
        if(board.boardArray[i][j] === DiscState.Empty){
          startCol = Math.max(0,i-1);
          endCol = Math.min(board.height-1,i+1);
          startRow = Math.max(0,j-1);
          endRow = Math.min(board.width-1,j+1);
          for(let col=startCol;col<=endCol;col++){
            for(let row=startRow;row<=endRow;row++){
              if(board.boardArray[col][row] === player){
                counter++;
              }
            }
          }
        }
      }
    }
    return counter;
  }

  // give a score of how connected the player's chips are
  // defined by number of player's connected disc
  public innerConnectedness = (board:Board,player:DiscState):number=>{
    let counter = 0;
    let startCol;
    let startRow;
    let endCol;
    let endRow;
    for(let j=0;j<board.width;j++){
      for(let i=0;i<board.height;i++){
        if(board.boardArray[i][j] === player){
          startCol = Math.max(0,i-1);
          endCol = Math.min(board.height-1,i+1);
          startRow = Math.max(0,j-1);
          endRow = Math.min(board.width-1,j+1);
          for(let col=startCol;col<=endCol;col++){
            for(let row=startRow;row<=endRow;row++){
              if(col===i && row===j){
                continue;
              } else if(board.boardArray[col][row] === player){
                counter++;
              }
            }
          }
        }
      }
    }
    return counter;
  }
}