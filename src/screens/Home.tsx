import * as React from 'react';
import { NavLink } from 'react-router-dom';

export class Home extends React.Component {
  public render() {
    return (
      <div>
        <div style={{ textAlign: 'center' }}>
          <h1>
            Connect 4
          </h1>
        </div>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <NavLink exact={true} to="/1player" className="nav-link" activeClassName="active">1 Player</NavLink>
          </li>
          <li className="nav-item">
            <NavLink exact={true} to="/stat" className="nav-link" activeClassName="active">Stat</NavLink>
          </li>
        </ul>
      </div>
    );
  }
}