import { Suspense, lazy } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import HomePage from "@/pages/HomePage";
import ProjectPage from "@/pages/ProjectPage";
import SessionPage from "@/pages/SessionPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ProjectAnalyticsPage from "@/pages/ProjectAnalyticsPage";
import MenageriePage from "@/pages/MenageriePage";
import SagaPage from "@/pages/SagaPage";
import NotFound from "@/pages/not-found";

// DEV-only scaffolding — gated via dynamic import so the production bundle
// does not include the dev test page module. Vite tree-shakes the import
// expression away when `import.meta.env.DEV` is false at build time.
const DevSkillsPage = import.meta.env.DEV
  ? lazy(() => import("@/pages/DevSkillsPage"))
  : null;

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
      {import.meta.env.DEV && DevSkillsPage && (
        <Route path="/dev/skills">
          <Suspense fallback={null}>
            <DevSkillsPage />
          </Suspense>
        </Route>
      )}
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
