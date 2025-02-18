import React, { useState } from "react";
import "./ExamDetails.css";

function ExamDetails() {
  const [details, setDetails] = useState({
    semester: "",
    course: "",
    month: "",
    subjectCode: "",
    subjectName: "",
    examTimings: "2 hours", // Fixed exam timing
  });

  const subjectOptions = [
    { code: "CA 3222", name: "C# AND DOT NET FRAMEWORK" },
    // Add more subject options here
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "subjectCode") {
      const selectedSubject = subjectOptions.find(
        (subject) => subject.code === value
      );
      setDetails({
        ...details,
        subjectCode: value,
        subjectName: selectedSubject ? selectedSubject.name : "",
      });
    } else {
      setDetails({ ...details, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Exam Details Submitted!");
  };

  return (
    <div className="details-container">
      <h1>Enter Exam Details</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="semester">Semester</label>
          <select
            id="semester"
            name="semester"
            value={details.semester}
            onChange={handleChange}
            required
          >
            <option value="">Select Semester</option>
            {[...Array(6)].map((_, index) => (
              <option key={index + 1} value={index + 1}>
                Semester {index + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="course">Course</label>
          <select
            id="course"
            name="course"
            value={details.course}
            onChange={handleChange}
            required
          >
            <option value="">Select Course</option>
            <option value="BCA">BCA</option>
            {/* Add more courses here */}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="month">Month of Examination</label>
          <input
            type="text"
            id="month"
            name="month"
            placeholder="e.g., June 2025"
            value={details.month}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="subjectCode">Subject Code</label>
          <input
            list="subjectCodes"
            id="subjectCode"
            name="subjectCode"
            value={details.subjectCode}
            onChange={handleChange}
            placeholder="Type or select"
            required
          />
          <datalist id="subjectCodes">
            {subjectOptions.map((subject, index) => (
              <option key={index} value={subject.code}>
                {subject.name}
              </option>
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="subjectName">Subject Name</label>
          <input
            type="text"
            id="subjectName"
            name="subjectName"
            value={details.subjectName}
            readOnly
          />
        </div>

        <div className="form-group">
          <label htmlFor="examTimings">Exam Timings</label>
          <input
            type="text"
            id="examTimings"
            name="examTimings"
            value={details.examTimings}
            readOnly
          />
        </div>

        <button type="submit" className="action-btn">
          Submit
        </button>
      </form>
    </div>
  );
}

export default ExamDetails;
