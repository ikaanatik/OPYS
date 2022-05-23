import express from "express";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import cors from "cors";
import hpp from "hpp";
import morgan from "morgan";
import index from "./routers/index.js";
import errorHandler from "./middlewares/error/errorHandler.js";
import loaders from "./loaders/index.js";
import "moment/locale/tr.js";
// Loaders

loaders();

// App Setup
const PORT = process.env.PORT;
const app = express();
app.use(express.json({ extended: false, limit: "50mb" }));
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(cors());
app.use(morgan("dev"));

app.use("/api/v1", index);

// Error Handler Middleware
app.use(errorHandler);

// Starting Our Server
app.listen(PORT, () => {
  console.log("Server is running =>" + PORT);
});
