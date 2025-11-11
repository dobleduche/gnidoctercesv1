// server/index.ts
import "dotenv/config";
// Fix: Use default express import to avoid type conflicts.
import express from "express";
import cors from "cors";
import path from "path";
import process from "process";

// Remove legacy routes that are not defined in the project
// import { router as generate } from "./routes/generate";
// import { router as discovery } from "./routes/discovery";
// import { router as publish } from "./routes/publish";
// import { router as clips } from "./routes/clips";
import { router as billing } from "./routes/billing";

// NEW Routers
import { ai } from "./routes/ai";
import { scaffold } from "./routes/scaffold";
import { github } from "./routes/github";
import { proxy } from "./routes/proxy";
import { referral } from "./routes/referral";

// Boot background workers (idempotent import)
// import "../clipWorker";

const app = express();

/* =========================
   Global middleware
========================= */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true })); // for form bodies

/* =========================
   Routes
========================= */
// app.use("/api/generate", generate);
// app.use("/api/discovery", discovery);
// app.use("/api/publish", publish);
// app.use("/api/clips", clips);
app.use("/api/billing", billing);

// NEW: AI routes
app.use("/api/ai", ai);

// NEW: Scaffolder route
app.use("/api/scaffold", scaffold);

// NEW: GitHub route
app.use("/api/github", github);

// NEW: Proxy for 3rd party APIs
app.use("/api/proxy", proxy);

// NEW: Referrals route
app.use("/api/referral", referral);

// Simple health check
// Fix: Use explicit express types for req and res.
app.get("/api/health", (_req: express.Request, res: express.Response) => {
  res.status(200).json({ status: "ok" });
});

// API 404 Handler - This must be after all other API routes.
// It will catch any request to a '/api/*' endpoint that hasn't been handled.
// Fix: Use explicit express types for req and res.
app.use('/api/*', (req: express.Request, res: express.Response) => {
    res.status(404).json({
        ok: false,
        error: "Not Found",
        message: `The API endpoint ${req.method} ${req.originalUrl} does not exist.`
    });
});

/* =========================
   Non-API Routes
========================= */

// NEW: Preview server for generated apps
const previewRouter = express.Router({ mergeParams: true });

// Mock API endpoint for the generated app's client server to hit
// Fix: Use explicit express types for req and res.
previewRouter.post('/api/test', (req: express.Request, res: express.Response) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    res.json({ message: `Hello, ${name}! Your full-stack smoke test was successful.` });
});


// Static file serving for the generated app's client build
// Fix: Use explicit express types for req, res, and next.
previewRouter.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { projectId } = req.params;
    if (!projectId || projectId.includes('..') || projectId.includes('/')) {
        return res.status(400).send('Invalid Project ID');
    }
    const staticPath = path.join(process.cwd(), 'generated', projectId, 'client', 'dist');
    express.static(staticPath)(req, res, next);
});

// Catch-all for the SPA to work correctly
// Fix: Use explicit express types for req and res.
previewRouter.get('*', (req: express.Request, res: express.Response) => {
    const { projectId } = req.params;
    if (!projectId || projectId.includes('..') || projectId.includes('/')) {
        return res.status(400).send('Invalid Project ID');
    }
    const indexPath = path.join(process.cwd(), 'generated', projectId, 'client', 'dist', 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            res.status(404).send('Preview not found. The build may have failed.');
        }
    });
});
app.use('/preview/:projectId', previewRouter);

// Serve generated app source files for download browsing
app.use("/generated", express.static(path.join(process.cwd(), 'generated')));

/* =========================
   Central error handler
========================= */
// Fix: Use explicit express types for req, res, and next.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server] Unhandled error:", err);
  res.status(err?.status || 500).json({
    ok: false,
    error: err?.message ?? "Internal Server Error",
  });
});

/* =========================
   Startup
========================= */
const port = Number(process.env.PORT) || 5174;
app.listen(port, () => {
  console.log(`API up on :${port}`);
});

export default app;