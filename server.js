import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import marketRoutes from "./routes/marketRoutes.js";
import consumerRoutes from "./routes/consumerRoutes.js";

dotenv.config();

const app = express();
const port = 3000;
const host = process.env.HOST || "localhost";

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "ctis256-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(authRoutes);
app.use(marketRoutes);
app.use(consumerRoutes);

app.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}`);
});
