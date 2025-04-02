import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [resumeData, setResumeData] = useState({
    resume_id: "",
    keywords: "",
    experience: "",
    education: "",
    lastPosition: ""
  });
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisStats, setAnalysisStats] = useState(null);
  const [showDataInsights, setShowDataInsights] = useState(false);

  // Handle file selection
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Upload resume and extract keywords
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume file to upload.");
      return;
    }
  
    const formData = new FormData();
    formData.append("resume", file);
    
    try {
      setError(null);
      setLoading(true);
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      const extractedData = {
        resume_id: response.data.resume_id || "",
        keywords: response.data.keywords || "",
        experience: response.data.experience_years || "",
        education: response.data.education_level || "",
        lastPosition: response.data.last_position || "",
      };
  
      setResumeData(extractedData); // Update state
  
      if (extractedData.keywords) {
        handleSearchJobs(extractedData.keywords, extractedData); // Pass keywords directly
      }
  
    } catch (error) {
      console.error("Error uploading resume:", error);
      setError(error.response?.data?.message || "Failed to upload resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Search for jobs based on keywords and resume data
  // Search for jobs based on keywords and resume data
const handleSearchJobs = async (keywords = null, data = null) => {
  const keywordsToUse = keywords || resumeData.keywords;
  
  console.log("Searching for jobs with keywords:", keywordsToUse);

  if (!keywordsToUse) {
    setError("No keywords found. Please upload a resume or enter keywords first.");
    return;
  }

  try {
    setError(null);
    setLoading(true);
    setJobs([]); // Clear existing jobs to prevent duplicates
    
    // Simple GET request with just keywords
    const response = await axios.get(`http://localhost:5000/search?keywords=${encodeURIComponent(keywordsToUse)}`);

    console.log("Backend Response:", response.data);

    // Create a Set to track unique job IDs and prevent duplicates
    const uniqueJobIds = new Set();
    let processedJobs = [];
    
    // Handle different response formats
    let jobsArray = [];
    if (Array.isArray(response.data)) {
      jobsArray = response.data;
    } else if (response.data.jobs && Array.isArray(response.data.jobs)) {
      jobsArray = response.data.jobs;
      
      // Set analysis stats if available
      if (response.data.analysis) {
        setAnalysisStats(response.data.analysis);
      }
    } else {
      setError("Received an unexpected response format from the server.");
      setJobs([]);
      setLoading(false);
      return;
    }

    // Process jobs and filter out duplicates using a unique identifier
    processedJobs = jobsArray
      .filter(job => {
        // Create a unique identifier (using job ID if available, or combination of title and company)
        const jobId = job.id || `${job.title}-${job.company}`;
        
        // Check if we've seen this job before
        if (uniqueJobIds.has(jobId)) {
          return false; // Skip duplicate
        }
        
        // Add to set and keep this job
        uniqueJobIds.add(jobId);
        return true;
      })
      .map(job => ({
        ...job,
        // Ensure consistent field names and apply default values only where needed
        match_score: job.match_score !== undefined ? job.match_score : Math.random() * 0.3 + 0.5,
        keywords: job.keywords || job.skills || "No skills listed",
        title: job.title || "Untitled Position",
        company: job.company || "Unnamed Company",
        location: job.location || "Remote/Unspecified",
        description: job.description || "No description provided"
      }));

    console.log("Processed jobs (after deduplication):", processedJobs);
    setJobs(processedJobs);

  } catch (error) {
    console.error("Error fetching jobs:", error);
    setError(error.response?.data?.message || "Failed to fetch jobs. Please try again.");
    setJobs([]);
  } finally {
    setLoading(false);
  }
};
  // Function for the standalone search button
  const handleJobSearchClick = () => {
    handleSearchJobs(resumeData.keywords);
  };

  // Toggle data insights view
  const toggleDataInsights = () => {
    setShowDataInsights(!showDataInsights);
  };

  // Update experience and education manually
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResumeData({
      ...resumeData,
      [name]: value
    });
  };

  // Handle manual keyword input
  const handleKeywordChange = (e) => {
    setResumeData({
      ...resumeData,
      keywords: e.target.value
    });
  };

  // Function to check if a keyword matches with resume keywords
  const isKeywordMatch = (jobKeyword, resumeKeywords) => {
    if (!resumeKeywords || !jobKeyword) return false;
    
    const jobKeywordLower = jobKeyword.toLowerCase().trim();
    const resumeKeywordsArray = resumeKeywords.toLowerCase().split(',').map(k => k.trim());
    
    return resumeKeywordsArray.some(k => k === jobKeywordLower || 
                                   jobKeywordLower.includes(k) || 
                                   k.includes(jobKeywordLower));
  };

  return (
    <div className="container">
      <h1>Smart Resume & Job Matching System</h1>

      {/* Error Display */}
      {error && (
        <div className="error-section">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="loading-section">
          <div className="spinner"></div>
          <p>Processing your request...</p>
        </div>
      )}

      {/* Resume Upload Section */}
      <div className="upload-section">
        <h3>Upload Your Resume</h3>
        <input 
          type="file" 
          accept=".pdf,.docx,.doc" 
          onChange={handleFileChange} 
        />
        <button 
          onClick={handleUpload} 
          disabled={!file || loading}
          className="primary-button"
        >
          {loading ? "Processing..." : "Upload & Analyze Resume"}
        </button>
      </div>

      {/* Manual Keyword Search */}
      <div className="manual-search-section">
        <h3>Search Jobs Directly</h3>
        <input
          type="text"
          placeholder="Enter keywords (e.g., Python, React)"
          value={resumeData.keywords}
          onChange={handleKeywordChange}
          className="keyword-input"
        />
        <button 
          onClick={handleJobSearchClick} 
          disabled={!resumeData.keywords || loading}
          className="search-button"
        >
          Search Jobs
        </button>
      </div>

      {/* Display Extracted Information */}
      {resumeData.keywords && (
        <div className="resume-data-section">
          <h3>Resume Analysis Results:</h3>
          
          <div className="data-row">
            <label>Extracted Keywords:</label>
            <p className="keyword-chips">
              {resumeData.keywords.split(',').map((keyword, idx) => (
                <span key={idx} className="keyword-chip">{keyword.trim()}</span>
              ))}
            </p>
          </div>
          
          <div className="data-row">
            <label>Years of Experience:</label>
            <input
              type="number"
              name="experience"
              value={resumeData.experience}
              onChange={handleInputChange}
              placeholder="Years of experience"
              min="0"
              max="50"
            />
          </div>
          
          <div className="data-row">
            <label>Education Level:</label>
            <select 
              name="education" 
              value={resumeData.education} 
              onChange={handleInputChange}
            >
              <option value="">Select Education</option>
              <option value="High School">High School</option>
              <option value="Associate">Associate Degree</option>
              <option value="Bachelor">Bachelor's Degree</option>
              <option value="Master">Master's Degree</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
          
          <div className="data-row">
            <label>Last Position:</label>
            <input
              type="text"
              name="lastPosition"
              value={resumeData.lastPosition}
              onChange={handleInputChange}
              placeholder="Last job position"
            />
          </div>
        </div>
      )}

      {/* Data Mining Insights Toggle */}
      {analysisStats && (
        <div className="insights-toggle">
          <button 
            onClick={toggleDataInsights}
            className="toggle-button"
          >
            {showDataInsights ? "Hide Data Insights" : "Show Data Mining Insights"}
          </button>
        </div>
      )}
 
      {/* Data Mining Insights */}
      {showDataInsights && analysisStats && (
        <div className="data-insights-section">
          <h3>Data Mining Insights</h3>
          
          <div className="insight-card">
            <h4>Match Overview</h4>
            <p>Total Matches: <strong>{analysisStats.totalMatches}</strong></p>
            <p>Average Match Score: <strong>{analysisStats.averageMatchScore?.toFixed(2) || 'N/A'}</strong></p>
          </div>
          
          <div className="insight-card">
            <h4>Top Skills in Demand</h4>
            <ul className="skill-list">
              {analysisStats.topSkillsNeeded?.map((skill, idx) => (
                <li key={idx}>
                  <span className="skill-name">{skill.name}</span>
                  <div className="skill-bar">
                    <div 
                      className="skill-bar-fill" 
                      style={{width: `${skill.frequency}%`}}
                    ></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="insight-card">
            <h4>Skill Gaps</h4>
            <p className="skill-gap-info">
              {analysisStats.skillGaps?.length > 0 ? 
                "Consider adding these skills to improve your job matches:" :
                "No significant skill gaps identified."
              }
            </p>
            <div className="skill-gap-tags">
              {analysisStats.skillGaps?.map((skill, idx) => (
                <span key={idx} className="skill-gap-tag">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Display Job Listings */}
      <div className="jobs-section">
        <h3>Matching Jobs ({jobs.length}):</h3>
        {jobs.length > 0 ? (
          <ul>
            {jobs.map((job, index) => ( 
              
              <li key={index} className="job-card">
                <div className="job-header">
                  <h4>{job.title || 'Untitled Position'}</h4>
                  <span className="match-score">
                    Match: {Math.round((job.match_score || 0.5) * 100)}%
                  </span>
                </div>
                <div className="job-details">
                  <p><strong>Company:</strong> {job.company || 'Not specified'}</p>
                  <p><strong>Location:</strong> {job.location || 'Not specified'}</p>
                  <p>{job.description || 'No description provided'}</p>
                </div>
                <div className="job-keywords">
                  <strong>Required Skills:</strong>
                  <div className="keyword-chips">
                    {(job.keywords || '').split(',').map((keyword, idx) => (
                      <span 
                        key={idx} 
                        className={`keyword-chip ${isKeywordMatch(keyword, resumeData.keywords) ? 'matched' : 'missing'}`}
                      >
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="job-requirements">
                  <p>
                    <strong>Experience Required:</strong> {job.required_experience || 0} years
                    {Number(resumeData.experience) >= Number(job.required_experience || 0) ? 
                      <span className="match-indicator">✅</span> : 
                      <span className="gap-indicator">⚠️</span>}
                  </p>
                  <p>
                    <strong>Education Required:</strong> {job.required_education || 'Not specified'}
                    {!job.required_education || ['Master', 'PhD'].includes(resumeData.education) || resumeData.education === job.required_education ? 
                      <span className="match-indicator">✅</span> : 
                      <span className="gap-indicator">⚠️</span>}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-jobs">No matching jobs found. Try adjusting your resume or keywords.</p>
        )}
      </div>
    </div>
  );
}

export default App;