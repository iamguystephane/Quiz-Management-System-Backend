require("dotenv").config();
const express = require("express");
const connectDB = require("./scripts/mongoDBConnect");

const app = express();
connectDB();

app.get("/", (req, res) => {
  res.send("<h1> Hello world </h1>");
});
app.listen(5000, () => {
  console.log("server started at http://localhost:5000");
});
