import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./ExamDetails.css";

function ExamDetails() {
  const navigate = useNavigate();
  const [details, setDetails] = useState({
    course: "",
    semester: "",
    semesterExamination: "",
    examinationConducted: "",
    subjectCode: "",
    subjectName: "",
    examTimings: "2 hours", // Fixed exam timing
  });

  // Subject options exactly as specified, with full name for reference
  const subjectOptions = useMemo(() => [
    { code: "CA 3222", name: "C# AND DOT NET FRAMEWORK" },
    { code: "CA 3233", name: "Java Programming" },
    { code: "CA 3244", name: "Python Basics" },
    { code: "DAV02", name: "Power BI"},
  ], []);

  // Course options with only BCA
  const courseOptions = useMemo(() => ["BCA"], []);

  // Semester options with Roman numerals and "SEMESTER"
  const semesterOptions = useMemo(() => [
    { value: "I", display: "I SEMESTER" },
    { value: "II", display: "II SEMESTER" },
    { value: "III", display: "III SEMESTER" },
    { value: "IV", display: "IV SEMESTER" },
    { value: "V", display: "V SEMESTER" },
    { value: "VI", display: "VI SEMESTER" }
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
    
    // Store the details in localStorage for access in other components
    localStorage.setItem('examDetails', JSON.stringify(details));
    
    // Navigate to Exam Pattern page
    navigate('/exam-pattern');
  };

  return (
    <div className="din6-details-container">
      <h1>Enter Exam Details</h1>
      <form onSubmit={handleSubmit}>
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
          <label htmlFor="semester">Semester</label>
          <select
            id="semester"
            name="semester"
            value={details.semester}
            onChange={handleChange}
            required
          >
            <option value="">Select Semester</option>
            {semesterOptions.map((semester) => (
              <option key={semester.value} value={semester.value}>
                {semester.display}
              </option>
            ))}
          </select>
        </div>

        <div className="din6-form-group">
          <label htmlFor="semesterExamination">Semester Examination</label>
          <input
            type="text"
            id="semesterExamination"
            name="semesterExamination"
            value={details.semesterExamination}
            onChange={handleChange}
            placeholder="OCTOBER 2024"
            required
          />
        </div>

        <div className="din6-form-group">
          <label htmlFor="examinationConducted">Examination Conducted</label>
          <input
            type="text"
            id="examinationConducted"
            name="examinationConducted"
            value={details.examinationConducted}
            onChange={handleChange}
            placeholder="November 2024"
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
            {subjectOptions.map((subject) => (
              <option key={subject.code} value={subject.code}>
                {subject.code}
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
  );
}

export default ExamDetails;