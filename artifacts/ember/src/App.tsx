import { Switch, Route, Router as WouterRouter } from "wouter";
import HomePage from "@/pages/HomePage";
import ProjectPage from "@/pages/ProjectPage";
import SessionPage from "@/pages/SessionPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ProjectAnalyticsPage from "@/pages/ProjectAnalyticsPage";
import MenageriePage from "@/pages/MenageriePage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/project/:id" component={ProjectPage} />
      <Route path="/session/:projectId" component={SessionPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/analytics/:projectId" component={ProjectAnalyticsPage} />
      {import.meta.env.DEV && <Route path="/menagerie" component={MenageriePage} />}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;
