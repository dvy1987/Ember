import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import projectsRouter from "./projects.js";
import tasksRouter from "./tasks.js";
import sessionsRouter from "./sessions.js";
import analyticsRouter from "./analytics.js";
import resumeRouter from "./resume.js";
import aiRouter from "./ai.js";
import settingsRouter from "./settings.js";
import projectAnalyticsRouter from "./projectAnalytics.js";
import ritualsRouter from "./rituals.js";
import sagaRouter from "./saga.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(tasksRouter);
router.use(sessionsRouter);
router.use(analyticsRouter);
router.use(resumeRouter);
router.use(aiRouter);
router.use(settingsRouter);
router.use(ritualsRouter);
router.use(sagaRouter);
// Per-project analytics must be registered AFTER global analytics
// to avoid route conflicts with /analytics/:projectId vs /analytics
router.use(projectAnalyticsRouter);

export default router;
