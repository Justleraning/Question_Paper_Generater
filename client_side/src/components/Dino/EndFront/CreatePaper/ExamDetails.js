// ExamDetails.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./ExamDetails.css";

function ExamDetails() {
  const navigate = useNavigate();
  const [details, setDetails] = useState({
    semester: "",
    course: "",
    month: "",
    subjectCode: "",
    subjectName: "",
    examTimings: "2 hours", // Fixed exam timing
  });

  // Moved outside component to prevent recreation on each render
  const subjectOptions = useMemo(() => [
    { code: "CA 3222", name: "C# AND DOT NET FRAMEWORK" },
    { code: "CA 3233", name: "JAVA PROGRAMMING" },
    { code: "CA 3244", name: "PYTHON BASICS" },
    { code: "CA 3255", name: "WEB DEVELOPMENT" },
    { code: "CA 3266", name: "DATABASE MANAGEMENT SYSTEMS" },
    { code: "CA 3277", name: "COMPUTER NETWORKS" },
    { code: "CA 3288", name: "DATA STRUCTURES AND ALGORITHMS" },
    { code: "CA 3299", name: "MOBILE APPLICATION DEVELOPMENT" },
    { code: "CA 3300", name: "CLOUD COMPUTING" },
    { code: "CA 3311", name: "ARTIFICIAL INTELLIGENCE" },
  ], []);

  // Course options
  const courseOptions = useMemo(() => [
    "BCA", 
    "MCA", 
    "BSc Computer Science", 
    "BTech IT", 
    "BTech CSE"
  ], []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "subjectCode") {
      const selectedSubject = subjectOptions.find(
        (subject) => subject.code === value
      );
      setDetails(prev => ({
        ...prev,
        subjectCode: value,
        subjectName: selectedSubject ? selectedSubject.name : "",
      }));
    } else {
      setDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Log for debugging
    console.log("Exam Details Submitted:", details);
    
    // Store the details in localStorage if needed for access in ExamPattern
    localStorage.setItem('examDetails', JSON.stringify(details));
    
    // Navigate to ExamPattern component
    navigate('/exam-pattern', { state: { examDetails: details } });
  };

  return (
    <div className="din6-details-container">
      <h1>Enter Exam Details</h1>
      <div className="din6-form-scroll-container">
        <form onSubmit={handleSubmit}>
          <div className="din6-form-group">
            <label htmlFor="semester">Semester</label>
            <select
              id="semester"
              name="semester"
              value={details.semester}
              onChange={handleChange}
              required
            >
              <option value="">Select Semester</option>
              {[...Array(8)].map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  Semester {index + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="din6-form-group">
            <label htmlFor="course">Course</label>
            <select
              id="course"
              name="course"
              value={details.course}
              onChange={handleChange}
              required
            >
              <option value="">Select Course</option>
              {courseOptions.map((course, index) => (
                <option key={index} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          <div className="din6-form-group">
            <label htmlFor="month">Month of Examination</label>
            <input
              type="month"
              id="month"
              name="month"
              value={details.month}
              onChange={handleChange}
              required
            />
          </div>

          <div className="din6-form-group">
            <label htmlFor="subjectCode">Subject Code</label>
            <select
              id="subjectCode"
              name="subjectCode"
              value={details.subjectCode}
              onChange={handleChange}
              required
            >
              <option value="">Select Subject Code</option>
              {subjectOptions.map((subject, index) => (
                <option key={index} value={subject.code}>
                  {subject.code} - {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="din6-form-group">
            <label htmlFor="subjectName">Subject Name</label>
            <input
              type="text"
              id="subjectName"
              name="subjectName"
              value={details.subjectName}
              readOnly
              className="din6-readonly-input"
            />
          </div>

          <div className="din6-form-group">
            <label htmlFor="examTimings">Exam Timings</label>
            <input
              type="text"
              id="examTimings"
              name="examTimings"
              value={details.examTimings}
              readOnly
              className="din6-readonly-input"
            />
          </div>

          <button type="submit" className="din6-action-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default ExamDetails;