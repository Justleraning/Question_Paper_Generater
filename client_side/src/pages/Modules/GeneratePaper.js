import { useState, useEffect } from "react";
import { generateQuestionPaper, getAvailableCourses } from "../../services/paperService.js";
import { useNavigate } from "react-router-dom";

const GeneratePaper = () => {
  const [course, setCourse] = useState(""); // Selected course
  const [customSubject, setCustomSubject] = useState(""); // Custom subject
  const [courses, setCourses] = useState([]); // Available courses
  const [subjects, setSubjects] = useState([]); // Subjects of selected course
  const [showSubjects, setShowSubjects] = useState(false); // Show subjects after generating
  const navigate = useNavigate();

  // Fetch available courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const availableCourses = await getAvailableCourses();
        console.log("✅ Courses received:", availableCourses);
        setCourses(availableCourses);
      } catch (error) {
        console.error("❌ Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // Handle course selection and set corresponding subjects
  const handleCourseChange = (e) => {
    const selectedCourseId = e.target.value;
    setCourse(selectedCourseId);

    const selectedCourse = courses.find((c) => c.id === selectedCourseId);
    if (selectedCourse) {
      setSubjects([...selectedCourse.subjects]); // Spread operator to avoid mutation
    } else {
      setSubjects([]);
    }
  };

  const handleGenerate = async () => {
    if (!course) {
      alert("Please select a course.");
      return;
    }

    if (!customSubject.trim()) {
      alert("Please enter a custom subject.");
      return;
    }

    try {
      await generateQuestionPaper(course, customSubject.trim().toLowerCase());
      setShowSubjects(true); // Show subjects after generating paper
    } catch (error) {
      console.error("❌ Error generating paper:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Generate Question Paper</h1>

      {/* Course Selection Dropdown */}
      <div className="mt-4">
        <label className="block text-lg">Select Course:</label>
        <select
          value={course}
          onChange={handleCourseChange}
          className="border p-2 rounded w-full mt-2"
        >
          <option value="">-- Select a Course --</option>
          {courses.map((courseItem, index) => (
            <option key={`${courseItem.id}-${index}`} value={courseItem.id}>
              {courseItem.name}
            </option>
          ))}
        </select>
      </div>

      {/* Show Subjects of the Selected Course */}
      {subjects.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Subjects for {course}:</h3>
          <ul className="list-disc pl-6 mt-2">
            {subjects.map((subject, index) => (
              <li key={`${subject}-${index}`} className="text-gray-700">
                {subject}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Custom Subject Input */}
      <div className="mt-4">
        <label className="block text-lg">Enter Custom Subject:</label>
        <input
          type="text"
          value={customSubject}
          onChange={(e) => setCustomSubject(e.target.value)}
          className="border p-2 rounded w-full mt-2"
          placeholder="Enter custom subject (e.g., AI, Web Development)"
        />
      </div>

      {/* Generate Paper Button */}
      <button
        onClick={handleGenerate}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
      >
        Generate Paper
      </button>
    </div>
  );
};

export default GeneratePaper;
