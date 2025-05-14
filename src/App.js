import React from 'react';
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings'; // Add this import
import { ThemeProvider } from './components/ThemeManager';
import './styles/main.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Switch>
            <Route path="/journal" exact>
              <Dashboard defaultTab="journal" />
            </Route>
            <Route path="/history" exact>
              <Dashboard defaultTab="history" />
            </Route>
            <Route path="/mood-tracker" exact>
              <Dashboard defaultTab="mood" />
            </Route>
            <Route path="/breathing" exact>
              <Dashboard defaultTab="breathing" />
            </Route>
            <Route path="/weather-mood" exact>
              <Dashboard defaultTab="weather" />
            </Route>
            <Route path="/daily-quote" exact>
              <Dashboard defaultTab="quote" />
            </Route>
            <Route path="/crisis-hotlines" exact>
              <Dashboard defaultTab="hotlines" />
            </Route>
            <Route path="/emergency-contacts" exact>
              <Dashboard defaultTab="contacts" />
            </Route>
            <Route path="/settings" exact>
              <Dashboard defaultTab="settings" />
            </Route>
            <Route path="/" exact>
              <Redirect to="/journal" />
            </Route>
            <Route path="*">
              <Redirect to="/journal" />
            </Route>
          </Switch>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;