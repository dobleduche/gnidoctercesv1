import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import process from "process";

import { router as billing } from "./routes/billing";

// NEW Routers
import { ai } from "./routes/ai";
import { scaffold } from "./routes/scaffold";
import { github } from "./routes/github";
import { proxy } from "./routes/proxy";
import { referral } from "./routes/referral";

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
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/* =========================
   Routes
========================= */
app.use("/api/billing", billing);
app.use("/api/ai", ai);
app.use("/api/scaffold", scaffold);
app.use("/api/github", github);
app.use("/api/proxy", proxy);
app.use("/api/referral", referral);

// Simple health check
app.get("/api/health", (_req: express.Request, res: express.Response) => {
  res.status(200).json({ status: "ok", message: "Server is working!" });
});

// API 404 Handler - FIXED ROUTE PATTERN
app.use('/api/:any*', (req: express.Request, res: express.Response) => {
    res.status(404).json({
        ok: false,
        error: "Not Found",
        message: `The API endpoint ${req.method} ${req.originalUrl} does not exist.`
    });
});

/* =========================
   Non-API Routes
========================= */

// Preview server for generated apps
const previewRouter = express.Router({ mergeParams: true });

// Mock API endpoint
previewRouter.post('/api/test', (req: express.Request, res: express.Response) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    res.json({ message: `Hello, ${name}! Your full-stack smoke test was successful.` });
});

// Static file serving
previewRouter.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { projectId } = req.params;
    if (!projectId || projectId.includes('..') || projectId.includes('/')) {
        return res.status(400).send('Invalid Project ID');
    }
    const staticPath = path.join(process.cwd(), 'generated', projectId, 'client', 'dist');
    express.static(staticPath)(req, res, next);
});

// Catch-all for the SPA
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

// Serve generated app source files
app.use("/generated", express.static(path.join(process.cwd(), 'generated')));

/* =========================
   Central error handler
========================= */
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
const port = Number(process.env.PORT) || 3001; // Changed to 3001 to match your frontend
app.listen(port, () => {
  console.log(`✅ API server running on http://localhost:${port}`);
});
