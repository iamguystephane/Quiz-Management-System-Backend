require("dotenv").config();
const express = require("express");
const connectDB = require("./scripts/mongoDBConnect");
const cors = require("cors");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/protected", require("./routes/protected"));
app.use("/api", require("./routes/loggedinUser"));

app.get("/", (req, res) => {
  res.send("<h1> Hello world </h1>");
});

app.listen(5000, () => {
  console.log("server started at http://localhost:5000");
});
