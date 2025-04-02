import { useState } from "react";
import axios from "axios";

export default function JobSearch() {
  const [keyword, setKeyword] = useState("");
  const [jobs, setJobs] = useState([]);

  const searchJobs = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/search?keywords=${keyword}`);
      setJobs(res.data.jobs); // Ensure this matches backend response format
    } catch (error) {
      console.error("Error searching jobs:", error);
    }
  };

  return (
    <div>
      <input 
        type="text" 
        value={keyword} 
        onChange={(e) => setKeyword(e.target.value)} 
        placeholder="Enter skill (e.g. JavaScript)" 
      />
      <button onClick={searchJobs}>Search Jobs</button>

      <ul>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <li key={job.id}>
              <strong>{job.title}</strong> - {job.description}
            </li>
          ))
        ) : (
          <p>No jobs found</p>
        )}
      </ul>
    </div>
  );
}
