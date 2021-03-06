import * as React from "react";
import { Route, Switch } from "react-router-dom";

import { Game } from "./screens/Game";
import { Home } from "./screens/Home";
import { Stat } from "./screens/Stat";

export const RouterOutlet = () => {
  return (
    <div className="App">
      <Switch>
        <Route path="/1player" component={Game} />
        <Route path="/2players" component={Game} />
        <Route path="/stat" component={Stat} />
        <Route component={Home} />
      </Switch>
    </div>
  );
};
