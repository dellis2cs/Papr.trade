require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
app.set("view engine", "ejs");
const userRouter = require("./routes/userRouter");
const portRouter = require("./routes/portRouter");
//middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/users", userRouter);
app.use("/port", portRouter);

app.listen(process.env.SERVER_PORT || 8080, () => {
  console.log("Loaded port:", process.env.SERVER_PORT);
});
