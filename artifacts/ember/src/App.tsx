import { Switch, Route, Router as WouterRouter } from "wouter";
import HomePage from "@/pages/HomePage";
import ProjectPage from "@/pages/ProjectPage";
import SessionPage from "@/pages/SessionPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ProjectAnalyticsPage from "@/pages/ProjectAnalyticsPage";
import MenageriePage from "@/pages/MenageriePage";
import SagaPage from "@/pages/SagaPage";
import DevSkillsPage from "@/pages/DevSkillsPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/project/:id" component={ProjectPage} />
      <Route path="/session/:projectId" component={SessionPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/analytics/:projectId" component={ProjectAnalyticsPage} />
      <Route path="/saga/:projectId" component={SagaPage} />
      {import.meta.env.DEV && <Route path="/menagerie" component={MenageriePage} />}
      {import.meta.env.DEV && <Route path="/dev/skills" component={DevSkillsPage} />}
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
