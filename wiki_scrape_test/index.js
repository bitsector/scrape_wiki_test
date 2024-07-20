const express = require("express");
const path = require("path");
const randomString = require("./utils/randomString");

const app = express();
const PORT = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/generate-string", (req, res) => {
    const message = `hello world ${randomString()}`;
    res.json({ message });
  });
  
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});