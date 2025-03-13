import { useState, useEffect } from "react";
import { getAvailableCourses } from "../../services/paperService.js";
import { useNavigate } from "react-router-dom";

const GeneratePaper = () => {
  const [course, setCourse] = useState(""); // Selected Course ID
  const [customSubject, setCustomSubject] = useState(""); // Custom subject input
  const [courses, setCourses] = useState([]); // Available courses
  const [subjects, setSubjects] = useState([]); // Subjects for selected course
  const [showSubjects, setShowSubjects] = useState(false); // Controls subject visibility
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [subjectError, setSubjectError] = useState(""); // Validation error for custom subject

  const navigate = useNavigate();

  // Function to validate custom subject input with improved detection
  const validateCustomSubject = (input) => {
    // Convert input to lowercase and remove all spaces for more flexible matching
    const lowerInput = input.toLowerCase().trim();
    const lowerInputNoSpaces = lowerInput.replace(/\s+/g, '');
    
    // Reserved subject names (both with spaces and without)
    const reservedSubjects = [
      // With spaces
      "quantitative problem solving",
      "logical reasoning",
      "english",
      // Without spaces
      "quantitativeproblemssolving",
      "quantitativeproblemsolving", 
      "logicalreasoning",
      "english"
    ];
    
    // Reserved subject patterns (more flexible matching)
    const reservedPatterns = [
      /^quantitative\s*problem\s*solving$/i,
      /^logical\s*reasoning$/i,
      /^english$/i
    ];
    
    // Check if input matches any reserved subject (with or without spaces)
    const isReservedExact = reservedSubjects.some(subject => 
      lowerInput === subject || lowerInputNoSpaces === subject.replace(/\s+/g, '')
    );
    
    // Check if input matches any reserved pattern
    const isReservedPattern = reservedPatterns.some(pattern => 
      pattern.test(lowerInput)
    );
    
    // Check for special characters (allow letters, numbers, spaces and basic punctuation)
    const hasSpecialChars = /[^\w\s.,'-]/.test(input);
    
    // Create error message based on validation results
    let errorMessage = "";
    
    if (isReservedExact || isReservedPattern) {
      errorMessage = `"${input}" is a reserved subject name. Please use a different name or add a number (e.g. "${input} 2").`;
    } else if (hasSpecialChars) {
      errorMessage = "Subject name should not contain special characters.";
    }
    
    return {
      isValid: !(isReservedExact || isReservedPattern || hasSpecialChars),
      errorMessage
    };
  };

  // ✅ Fetch available courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const availableCourses = await getAvailableCourses();
        console.log("✅ Fetched Courses:", availableCourses);

        if (!Array.isArray(availableCourses) || availableCourses.length === 0) {
          console.warn("⚠️ No courses available or invalid format.");
          setCourses([]);
          return;
        }

        setCourses(availableCourses);
        setError(null);
      } catch (error) {
        console.error("❌ Error fetching courses:", error);
        setError("Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // ✅ Handle course selection
  const handleCourseChange = (e) => {
    const selectedCourseId = e.target.value;
    setCourse(selectedCourseId);
    setShowSubjects(false); // Hide subjects until selected

    // Find the selected course
    const selectedCourse = courses.find((c) => String(c.id) === String(selectedCourseId));

    console.log("📌 Selected Course:", selectedCourse);
    console.log("📌 Subjects for selected course:", selectedCourse?.subjects || "No subjects found");

    // Ensure subjects exist before setting state
    if (selectedCourse && Array.isArray(selectedCourse.subjects) && selectedCourse.subjects.length > 0) {
      setSubjects(selectedCourse.subjects);
      setShowSubjects(true); // Show subjects only after selection
    } else {
      setSubjects([]); // Prevent undefined errors
      setShowSubjects(false);
    }
  };

  // Handle custom subject change with validation
  const handleCustomSubjectChange = (e) => {
    const newValue = e.target.value;
    setCustomSubject(newValue);
    
    // Only show validation error if there's actually input
    if (newValue.trim()) {
      const validation = validateCustomSubject(newValue);
      setSubjectError(validation.isValid ? "" : validation.errorMessage);
    } else {
      setSubjectError("");
    }
  };

  // ✅ Handle paper generation with validation
  const handleGenerate = () => {
    if (!course) {
      alert("⚠️ Please select a course.");
      return;
    }
    
    const customSubjectTrimmed = customSubject.trim();
    if (!customSubjectTrimmed) {
      alert("⚠️ Please enter a custom subject.");
      return;
    }
    
    // Validate custom subject input
    const validation = validateCustomSubject(customSubjectTrimmed);
    if (!validation.isValid) {
      alert(`⚠️ ${validation.errorMessage}`);
      return;
    }
    
    // Get course name properly
    const selectedCourse = courses.find((c) => String(c.id) === String(course));
    const courseName = selectedCourse ? selectedCourse.name : "Unknown Course";

    console.log("✅ Selected Course Name:", courseName);
    console.log("✅ Selected Subject:", customSubjectTrimmed);

    // Navigate with proper encoding
    const redirectPath = `/enter-questions/${encodeURIComponent(courseName)}/${encodeURIComponent(customSubjectTrimmed)}`;
    console.log("🔀 Navigating to:", redirectPath);
    navigate(redirectPath);
  };

  return (
    <div className="flex flex-col w-full px-12 py-10">
      <h1 className="text-3xl font-bold mb-6">Generate Question Paper</h1>

      {/* Show loading state */}
      {loading && <p className="text-gray-500">Loading courses...</p>}

      {/* Show error if fetching courses fails */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Course Selection */}
      {!loading && !error && (
        <div className="mt-4 w-full max-w-3xl">
          <label className="block text-lg">Select Course:</label>
          <select
            value={course}
            onChange={handleCourseChange}
            className="border p-2 rounded w-full mt-2"
          >
            <option value="">-- Select a Course --</option>
            {courses.map((courseItem) => (
              <option key={courseItem.id} value={courseItem.id}>
                {courseItem.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Display Subjects Only After Selection */}
      {showSubjects && subjects.length > 0 && (
        <div className="mt-4 w-full max-w-3xl">
          <label className="block text-lg">Subjects:</label>
          <ul className="border p-2 rounded w-full mt-2 bg-gray-100">
            {subjects.map((subject, index) => (
              <li key={index} className="py-1 px-2 border-b last:border-none">
                {subject}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Custom Subject Input with Validation - Warnings Only */}
      <div className="mt-4 w-full max-w-3xl">
        <label className="block text-lg">Enter Custom Subject:</label>
        <input
          type="text"
          value={customSubject}
          onChange={handleCustomSubjectChange}
          className={`border p-2 rounded w-full mt-2 ${subjectError ? 'border-red-500' : ''}`}
          placeholder="Enter custom subject"
        />
        {subjectError && (
          <p className="text-red-500 text-sm mt-1">{subjectError}</p>
        )}
      </div>

      {/* Generate Paper Button */}
      <button
        onClick={handleGenerate}
        className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition w-full max-w-3xl"
        disabled={loading || !!error || !!subjectError}
      >
        Generate Paper
      </button>
    </div>
  );
};

export default GeneratePaper;