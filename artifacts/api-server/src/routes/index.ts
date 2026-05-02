import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import projectsRouter from "./projects.js";
import tasksRouter from "./tasks.js";
import sessionsRouter from "./sessions.js";
import analyticsRouter from "./analytics.js";
import resumeRouter from "./resume.js";
import aiRouter from "./ai.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(tasksRouter);
router.use(sessionsRouter);
router.use(analyticsRouter);
router.use(resumeRouter);
router.use(aiRouter);

export default router;
