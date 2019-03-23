import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { connect } from 'react-redux';
import { IRootState } from '../redux/store';

import { incrementLoseStat, incrementTieStat, incrementWinStat } from '../redux/stat/actions';

import Board from '../connect4Logic/Board';
import Connect4AI from '../connect4Logic/Connect4AI';

import { DiscState } from '../connect4Logic/models';

import * as FontAwesome from 'react-fontawesome';
// import FontAwesomeIcon = require('react-fontawesome');

import './Game.css';

interface IPureGameProps {
  incrementWinStat: () => void;
  incrementLoseStat: () => void;
  incrementTieStat: () => void;
}

interface IPureGameState {
  board: DiscState[][];
  height: number;
  width: number;
  humanPlayer: DiscState.PlayerOne | DiscState.PlayerTwo;
  aiPlayer: DiscState.PlayerOne | DiscState.PlayerTwo;
  humanScore: number;
  aiScore: number;
  humanTurn: boolean;
  aiTurn: boolean;
  humanMoveFirst: boolean;
  canStartNewGame: boolean;
}

class PureGame extends React.Component<IPureGameProps,IPureGameState> {
  public moveHistory: number[];
  public placeable: boolean;
  constructor(props:IPureGameProps){
    super(props);
    const WIDTH = 7;
    const HEIGHT = 6;
    const board = new Array(HEIGHT);
    for(let i=0;i<board.length;i++){
      board[i] = new Array(WIDTH).fill(DiscState.Empty);
    }
    this.moveHistory = [];
    this.placeable = true;

    const humanMoveFirst = true;
    const humanTurn = humanMoveFirst;
    const aiTurn = !humanMoveFirst;
    
    this.state = {
      aiPlayer: DiscState.PlayerTwo,
      aiScore: 0,
      aiTurn,
      board,
      canStartNewGame: false,
      height: HEIGHT,
      humanMoveFirst,
      humanPlayer: DiscState.PlayerOne,
      humanScore: 0,
      humanTurn,
      width: WIDTH,
    };
  }

  public newGame = ()=>{
    const WIDTH = 7;
    const HEIGHT = 6;
    const board = new Array(HEIGHT);
    for(let i=0;i<board.length;i++){
      board[i] = new Array(WIDTH).fill(DiscState.Empty);
    }
    this.moveHistory = [];
    this.placeable = !this.state.humanMoveFirst;

    const humanMoveFirst = !this.state.humanMoveFirst;
    const humanTurn = humanMoveFirst;
    const aiTurn = !humanMoveFirst;
    
    this.setState({
      aiTurn,
      board,
      canStartNewGame: false,
      humanMoveFirst,
      humanTurn
    });

    if(!humanMoveFirst){
      setTimeout(()=>{this.aiMakeAMove();},100);
    }
  }

  public render() {
    const constructedBoard = <div className="GameBoard">
      {this.reverseArray(this.state.board).map((row,rowIndex)=>{
        return (<div key={this.state.board.length-rowIndex-1} className="GameBoard-row">
          {row.map((disc,colIndex)=>{
            let classname = "GameBoard-disc ";
            switch(disc){
              case DiscState.Empty:
                classname += 'empty';
                break;
              case DiscState.PlayerOne:
                classname += 'player_one';
                break;
              case DiscState.PlayerTwo:
                classname += 'player_two';
                break;
            }
            return (
              <div key={colIndex} className="GameBoard-grid" onClick={this.columnClicked(colIndex)}>
                <div className={classname}/>
              </div>
            );
          })}
        </div>);
      })}
    </div>;

    return (
      <div>
        <div>
          <NavLink exact={true} to="/" className="nav-link" activeClassName="active">Back</NavLink>
          <button onClick={this.newGame} disabled={!this.state.canStartNewGame}>New Game</button>
        </div>

        <div className="ScoreDashboard">
          <div className={this.state.humanTurn?'ScoreBoard current-turn player_one':'ScoreBoard player_one'}>
            You
            <br/>
            {this.state.humanScore}
          </div>
          {this.state.aiTurn?
            <FontAwesome style={{color:'#605c5c',fontSize:'2em'}} name='spinner' spin={true} stack='2x'/>:''
          }
          <div className={this.state.aiTurn?'ScoreBoard current-turn player_two':'ScoreBoard player_two'}>
            AI
            <br/>
            {this.state.aiScore}
          </div>
        </div>
        <div style={{textAlign:'center'}}>
          {constructedBoard}
        </div>
      </div>
    );
  }

  private aiMakeAMove = ()=>{
    const currentBoard = new Board(this.state.width,this.state.height,this.state.humanMoveFirst?this.state.humanPlayer:this.state.aiPlayer,4,this.moveHistory);
    if(this.checkGameOver(currentBoard)){
      return;
    }
    const ai = new Connect4AI(currentBoard,this.state.aiPlayer,6);
    const aiMove = ai.getMove();
    this.moveHistory.push(aiMove);
    this.discDropAnimation(aiMove,this.state.aiPlayer,false);
    this.setState({
      aiTurn: false,
      humanTurn: true
    })
    this.checkGameOver(new Board(this.state.width,this.state.height,this.state.aiPlayer,4,this.moveHistory));
    return;
  }

  private discDropAnimation = (col:number,player:DiscState,callAIMove:boolean)=>{
    const newHeight = this.colHeight(col);
    const board = Array.from(this.state.board);

    for(let i=this.state.height-1;i>=newHeight;i--){
      setTimeout(()=>{
        board[i][col] = player;
        if(i!==this.state.height-1){
          board[i+1][col] = DiscState.Empty;
        }
        this.setState({
          board,
        });
        this.placeable = i===newHeight && !callAIMove;
        if(i===newHeight && callAIMove){
          setTimeout(()=>{this.aiMakeAMove();},0);
        }
      },(this.state.height-i)*80);
    }
  }

  private checkGameOver = (board:Board):boolean=>{
    if(board.gameOver()){
      let newHumanScore = this.state.humanScore;
      let newAiScore = this.state.aiScore;

      if(board.hasWon(this.state.humanPlayer)){
        newHumanScore++;
        this.props.incrementWinStat();
      } else if(board.hasWon(this.state.aiPlayer)){
        newAiScore++;
        this.props.incrementLoseStat();
      } else {
        this.props.incrementTieStat();
      }

      this.setState({
        aiScore: newAiScore,
        aiTurn: false,
        canStartNewGame: true,
        humanScore: newHumanScore,
        humanTurn: false
      })
      return true;
    } else {
      return false;
    }
  }

  private columnClicked = (col:number)=>{
    return ()=>{
      if(!this.placeable){
        return;
      }
      this.placeable = false;
      const currentBoard = new Board(this.state.width,this.state.height,DiscState.PlayerOne,4,this.moveHistory);
      if(currentBoard.gameOver()){
        return;
      }
      const newHeight = this.colHeight(col);
      if(newHeight===this.state.height){
        this.placeable = true;
        return;
      }
      this.setState({
        aiTurn: true,
        humanTurn: false
      })
      this.moveHistory.push(col);
      this.discDropAnimation(col,this.state.humanPlayer,true);
      if(this.checkGameOver(currentBoard)){
        return;
      }
    }
  }

  private reverseArray = (arr:DiscState[][])=>{
    const newArr = [];
    for(let i=arr.length-1;i>=0;i--){
      newArr.push(arr[i]);
    }
    return newArr;
  }

  private colHeight = (col:number)=>{
    let count=0;
    for(let i=0;i<this.state.height;i++){
      if(this.state.board[i][col]===DiscState.Empty){
        break;
      }
      count++;
    }
    return count;
  }
}

const mapStateToProps = (state: IRootState) => ({
  numLose: state.stat.numLose,
  numTie: state.stat.numTie,
  numWin: state.stat.numWin,
  totalGamesPlayed: state.stat.totalGamesPlayed,
});

// tslint:disable-next-line:no-any
const mapDispatchToProps = (dispatch: any ) => ({
  incrementLoseStat: () => dispatch(incrementLoseStat()),
  incrementTieStat: () => dispatch(incrementTieStat()),
  incrementWinStat: () => dispatch(incrementWinStat()),
});

export const Game = connect(mapStateToProps,mapDispatchToProps)(PureGame);