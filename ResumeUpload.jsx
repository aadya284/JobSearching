import { useState } from "react";
import axios from "axios";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [keywords, setKeywords] = useState([]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("resume", file);

    const res = await axios.post("http://localhost:5000/upload", formData);
    setKeywords(res.data.keywords);
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload Resume</button>
      <p>Extracted Keywords: {keywords.join(", ")}</p>
    </div>
  );
}
