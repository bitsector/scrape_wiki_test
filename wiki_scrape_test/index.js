const express = require("express");
const path = require("path");
const { scrapeWreckDivingSites } = require("./utils/scrape");

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
  
app.get("/module2-endpoint", (req, res) => {
  const message = module2Function();
  res.json({ message });
});

app.get("/module2-endpoint2", (req, res) => {
  const message = module2Function2();
  res.json({ message });
});

app.get("/get-scrape-results", async (req, res) => {
  const message = await scrapeWreckDivingSites();
  res.json({ message });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});