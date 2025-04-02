create database job_matching;
use job_matching;

CREATE TABLE resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    keywords TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FULLTEXT(title, description)
);

INSERT INTO jobs (title, description, company, location) VALUES
('Software Engineer', 'Develop and maintain web applications using JavaScript, React, and Node.js.', 'TechCorp', 'San Francisco, CA'),
('Data Analyst', 'Analyze large datasets and generate insights using Python, SQL, and Power BI.', 'Data Solutions', 'New York, NY'),
('Backend Developer', 'Design and implement APIs using Node.js and Express. Work with MySQL databases.', 'InnovateTech', 'Austin, TX'),
('Frontend Developer', 'Build responsive UI using React, HTML, and CSS.', 'WebWorks', 'Seattle, WA'),
('Machine Learning Engineer', 'Develop AI models for image recognition and NLP applications.', 'AI Labs', 'Boston, MA');