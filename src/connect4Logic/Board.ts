import { DiscState } from './models';

export default class Board{
  public static getOpponent = (player: DiscState):DiscState=>{
    return player === DiscState.PlayerTwo? DiscState.PlayerOne : DiscState.PlayerTwo;
  }

  public width:number;
  public height:number;
  public firstPlayer: DiscState;
  public moveHistory:number[];
  public boardArray:DiscState[][];
  public readonly WIN_NUMBER:number;

  constructor(width:number,height:number,firstPlayer:DiscState, winNumber:number, moveHistoryInput?:number[]){
    this.width = width;
    this.height = height;
    this.firstPlayer = firstPlayer;
    this.moveHistory = [];
    this.WIN_NUMBER = winNumber;
  
    // initializing board's array with empty squares
    this.boardArray = new Array(height);
    for(let i = 0; i<height;i++){
      this.boardArray[i] = new Array(width).fill(DiscState.Empty);
    }
  
    // generate the board if move history is given
    if(moveHistoryInput){
      for(let i=0;i<moveHistoryInput.length;i++){
        if(i%2===0){
          this.makeMove(moveHistoryInput[i],firstPlayer);
        } else {
          this.makeMove(moveHistoryInput[i],Board.getOpponent(firstPlayer));
        }
      }
    }
  }

  public clone = ():Board=>{
    const cloned = new Board(this.width,this.height,this.firstPlayer,this.WIN_NUMBER, this.moveHistory);
    return cloned;
  }

  // check if column has empty square
  public colHasSpace = (col:number):boolean=>{
    return (this.boardArray[this.height-1][col]===DiscState.Empty);
  }

  // return number of chips in that column
  public numChipsInCol = (col:number):number=>{
    let num = 0;
    for(let i = 0; i<this.height;i++){
      if(this.boardArray[i][col]===DiscState.Empty){
        break;
      }
      num++;
    }
    return num;
  }

  // Make move on the column
  public makeMove = (col:number,player:DiscState):void=>{
    if(!this.colHasSpace(col)){
      // console.error("Invalid makeMove: "+col);
      return;
    }
    this.boardArray[this.numChipsInCol(col)][col] = player;
    this.moveHistory.push(col);
  }
  
  // check if board is full
  public isFull = ():boolean=>{
    return this.moveHistory.length===this.width*this.height;
  }

  // check if board is empty
  public isEmpty = ():boolean=>{
    return this.moveHistory.length===0;
  }

  // check if the player has won
  public hasWon = (player:DiscState):boolean=>{
    let counter = 0;
    // check horizontal
    for(let i = 0;i<this.height;i++){
      for(let j=0;j<this.width;j++){
        if(this.boardArray[i][j]===player){
          counter++;
          if(counter=== this.WIN_NUMBER){
            return true;
          }
        } else{
          counter = 0;
        }
      }
      counter = 0;
    }

    // check vertical
    counter = 0;
    for(let j = 0;j<this.width;j++){
      for(let i=0;i<this.height;i++){
        if(this.boardArray[i][j]===player){
          counter++;
          if(counter=== this.WIN_NUMBER){
            return true;
          }
        } else {
          counter = 0;
        }
      }
      counter = 0;
    }

    // check diagonal
    let antidiagonalCounter = 0; //  bottom-left to top-right direction
    let diagonalCounter = 0; //  bottom-right to top-left direction
    for(let x = -this.height+1;x<this.width;x++){
      for(let y = Math.max(-x,0);y<Math.min(this.height,this.width-x);y++){
        if(this.boardArray[y][x+y]===player){
          antidiagonalCounter++;
          if(antidiagonalCounter=== this.WIN_NUMBER){
            return true;
          }
        } else {
          antidiagonalCounter = 0;
        }
        if(this.boardArray[y][this.width-x-y-1]===player){
          diagonalCounter++;
          if(diagonalCounter=== this.WIN_NUMBER){
            return true;
          }
        } else {
          diagonalCounter = 0;
        }
      }
      antidiagonalCounter=0;
      diagonalCounter = 0;
    }
    return false;
  }

  // whether the game is over
  public gameOver = ():boolean=>{
    return (this.isFull()||this.hasWon(DiscState.PlayerOne)
      ||this.hasWon(DiscState.PlayerTwo));
  }

  // return number of chips on the board
  public numChips = ():number=>{
    return this.moveHistory.length;
  }

  // current player
  public currentTurn = ():DiscState=>{
    if(this.numChips()%2===0){
      return this.firstPlayer;
    } else {
      return Board.getOpponent(this.firstPlayer);
    }
  }

  // check if the player has won on a square
  public hasWonOnSquare = (player:DiscState,row:number,col:number):boolean=>{
    // return false if player does not occupy that square
    if(this.boardArray[row][col]!==player){
      return false;
    }
    // check from this.WIN_NUMBER before to this.WIN_NUMBER after that square
    // for each direction

    // check horizontal
    let counter = 0;
    for(let j = Math.max(0,col-this.WIN_NUMBER+1);j<Math.min(this.width,col+this.WIN_NUMBER);j++){
      if(this.boardArray[row][j]===player){
        counter++;
        if(counter=== this.WIN_NUMBER){
          return true;
        }
      } else {
        counter = 0;
      }
    }

    // check vertical
    counter = 0;
    for(let i = Math.max(0,row-this.WIN_NUMBER+1);i<Math.min(this.height,row+this.WIN_NUMBER);i++){
      if(this.boardArray[i][col]===player){
        counter++;
        if(counter=== this.WIN_NUMBER){
          return true;
        }
      } else {
        counter = 0;
      }
    }
    // check antidiagonal
    counter = 0;
    let startCol = col;
    let startRow = row;

    for(let i=0;i<this.WIN_NUMBER-1;i++){
      if(startCol===0||startRow===0){
        break;
      }
      startCol--;
      startRow--;
    }

    let endCol = col;
    let endRow = row;

    for(let i=0;i<this.WIN_NUMBER-1;i++){
      if(endCol===this.width-1||endRow===this.height-1){
        break;
      }
      endCol++;
      endRow++;
    }

    for(let i = startRow,j = startCol; i<=endRow; i++,j++){
      if(this.boardArray[i][j]===player){
        counter++;
        if(counter=== this.WIN_NUMBER){
          return true;
        }
      } else {
        counter = 0;
      }
    }

    // check diagonal
    counter = 0;
    startCol = col;
    startRow = row;

    for(let i=0;i<this.WIN_NUMBER-1;i++){
      if(startCol===0||startRow===this.height-1){
        break;
      }
      startCol--;
      startRow++;
    }

    endCol = col;
    endRow = row;

    for(let i=0;i<this.WIN_NUMBER-1;i++){
      if(endCol===this.width-1||endRow===0){
        break;
      }
      endCol++;
      endRow--;
    }

    for(let i = startRow,j = startCol; i>=endRow; i--,j++){
      if(this.boardArray[i][j]===player){
        counter++;
        if(counter=== this.WIN_NUMBER){
          return true;
        }
      }
      else {
        counter = 0;
      }
    }
    return false;
  }

  // reset the board
  public reset = ():void=>{
    for(let i = 0;i<this.height;i++){
      for(let j=0;j<this.width;j++){
        this.boardArray[i][j] = DiscState.Empty;
      }
    }
    this.moveHistory = [];
  }

  // undo previous move
  public undo = ():void=>{
    if(this.isEmpty()){
      return;
    }
    const lastestCol = this.moveHistory.pop() || 0;
    this.boardArray[this.numChipsInCol(lastestCol)-1][lastestCol] = DiscState.Empty;
  }

}