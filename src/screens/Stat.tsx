import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { connect } from 'react-redux';
import { IRootState } from '../redux/store';

interface IPureStatProps {
  numLose: number;
  numTie: number;
  numWin: number;
  totalGamesPlayed: number;
}

class PureStat extends React.Component<IPureStatProps> {
  public render() {
    return (
      <div>
        <NavLink exact={true} to="/" className="nav-link" activeClassName="active">Back</NavLink>
        <ul className="nav nav-tabs">
            Stat
          <li className="nav-item">
            Total number of games played against AI: {this.props.totalGamesPlayed}
          </li>
          <li className="nav-item">
            Number of Wins: {this.props.numWin}
          </li>          
          <li className="nav-item">
            Number of Loses: {this.props.numLose}
          </li>    
          <li className="nav-item">
            Number of Tied games: {this.props.numTie}
          </li>    
          <li className="nav-item">
            Win percentage: {this.winPercentage()}%
          </li>    
        </ul>
      </div>
    );
  }
  private winPercentage = ()=>{
    if(this.props.numWin===0){
      return 0;
    }
    return  parseFloat(''+this.props.numWin / this.props.totalGamesPlayed * 100).toFixed(2);
  }
}

const mapStateToProps = (state: IRootState) => ({
  numLose: state.stat.numLose,
  numTie: state.stat.numTie,
  numWin: state.stat.numWin,
  totalGamesPlayed: state.stat.totalGamesPlayed,
});

export const Stat = connect(mapStateToProps)(PureStat);