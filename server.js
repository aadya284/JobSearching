const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());
console.log("Starting server.js...");

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Subodh38@",
  database: "job_matching",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.message);
  } else {
    console.log("Connected to MySQL database");
  }
});

// Upload and process resume
app.post("/upload", async (req, res) => {
  console.log("Request received at /upload");

  if (!req.files || !req.files.resume) {
    console.log("No file uploaded.");
    return res.status(400).send("No file uploaded.");
  }

  console.log("File received:", req.files.resume.name);

  try {
    const resume = req.files.resume;
    const text = await pdfParse(resume.data);
    
    // Extract keywords with at least 4 letters
    const extractedKeywords = text.text
      .replace(/\n/g, " ")
      .match(/\b[a-zA-Z]{4,}\b/g) || [];
    
    // Convert all keywords to uppercase (ETL, perfomed Transform Operation)
    const uppercaseKeywords = extractedKeywords.map(keyword => keyword.toUpperCase());
    
    // Remove duplicates using Set
    const uniqueKeywords = [...new Set(uppercaseKeywords)].join(", ");

    if (!uniqueKeywords) {
      console.log("No keywords extracted.");
      return res.status(400).send("No keywords found.");
    }

    const query = "INSERT INTO resumes (keywords) VALUES (?)";
    db.query(query, [uniqueKeywords], (err) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).send("Database Error");
      }
      res.send({ keywords: uniqueKeywords });
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).send("Error extracting text from PDF.");
  }
});

// Search jobs by keywords (Load Operaion Used by ETL)
app.get("/search", (req, res) => {
  const { keywords } = req.query;
  const query = `SELECT * FROM jobs WHERE MATCH(title, description) AGAINST (?)`;
  db.query(query, [keywords], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send({ jobs: results });
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});