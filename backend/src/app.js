import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "./config/passport.js";
import userRouter from "./routes/users.routes.js";
import subscriptionsRouter from "./routes/subscriptions.routes.js";
import paymentsRouter from "./routes/payments.routes.js";
import recordsRouter from "./routes/monthyRecords.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import reportsRouter from "./routes/reports.routes.js";
import residentDashboardRouter from "./routes/residentDashboard.routes.js";
import residentSubscriptionsRouter from "./routes/residentSubscriptions.routes.js";
import residentPaymentRouter from "./routes/residentPayment.routes.js";
import profileRouter from "./routes/profile.routes.js";
import notificationsRouter from "./routes/notifications.routes.js";

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Session is required for the Google OAuth handshake (passport stores temporary state)
// After the handshake we issue a JWT so the session is not kept long-term
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 5 * 60 * 1000 }, // 5 min — only for OAuth handshake
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionsRouter);
app.use("/api/v1/payments", paymentsRouter);
app.use("/api/v1/records", recordsRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/reports", reportsRouter);
app.use("/api/v1/resident-dashboard", residentDashboardRouter);
app.use("/api/v1/resident-subscriptions", residentSubscriptionsRouter);
app.use("/api/v1/resident-payment", residentPaymentRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/notifications", notificationsRouter);

export default app;
