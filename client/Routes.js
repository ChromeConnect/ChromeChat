import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Chat from "./components/Chat";

class Routes extends Component {
  render() {
    return (
      <div>
        <Switch>
          <Route path="/:website/:nameplustopic" exact component={Chat} />
        </Switch>
      </div>
    );
  }
}

export default Routes;
