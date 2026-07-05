import { Switch, Route, Router as WouterRouter } from "wouter";
import HomePage from "@/pages/HomePage";
import ProjectPage from "@/pages/ProjectPage";
import SessionPage from "@/pages/SessionPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ProjectAnalyticsPage from "@/pages/ProjectAnalyticsPage";
import MenageriePage from "@/pages/MenageriePage";
import SagaPage from "@/pages/SagaPage";
import NotFound from "@/pages/not-found";
import { DemoModeProvider } from "@/lib/DemoModeContext";
import { SessionDurationProvider } from "@/lib/SessionDurationContext";
import DemoModeBanner from "@/components/DemoModeBanner";

// NOTE (F2): the former /dev/skills scaffold has been retired now that the
// real co-work surface (ChatPanel) is wired into the project + session pages.
// MenageriePage remains DEV-only for asset previewing.

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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <DemoModeProvider>
        <SessionDurationProvider>
          <DemoModeBanner />
          <Router />
        </SessionDurationProvider>
      </DemoModeProvider>
    </WouterRouter>
  );
}

export default App;
