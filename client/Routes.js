import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Chat from "./components/Chat";
import Whiteboard from "./components/Whiteboard";

class Routes extends Component {
  render() {
    return (
      <div>
        <Switch>
          <Route path="/:nameplustopic" exact component={Chat} />
          <Route path="/board/:topic" exact component={Whiteboard} />
        </Switch>
      </div>
    );
  }
}

export default Routes;
