import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Edit, Trash2, Eye } from 'lucide-react';
import axios from 'axios';

export function EndSemSide() {
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await axios.get('/api/endpapers', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        setPapers(response.data.papers || []);
        setFilteredPapers(response.data.papers || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  // View/Preview Paper
  const viewPaper = (paper) => {
    navigate('/create-papers', { 
      state: { 
        paperDetails: paper,
        previewMode: true,
        disableReplaceButtons: true // New flag to remove replace buttons
      } 
    });
  };

  // Download Paper
  const downloadPaper = (paper) => {
    // Implement download logic
    console.log('Downloading paper:', paper);
  };

  // Edit Paper
  const editPaper = (paper) => {
    navigate('/create-papers', { 
      state: { 
        paperDetails: paper,
        editMode: true,
        enableInlineEditing: true,
        disableReplaceButtons: true // New flag to remove replace buttons
      } 
    });
  };

  // Delete Paper
  const deletePaper = async (paper) => {
    try {
      await axios.delete(`/api/endpapers/${paper._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setPapers(papers.filter(p => p._id !== paper._id));
      setFilteredPapers(filteredPapers.filter(p => p._id !== paper._id));
    } catch (error) {
      console.error('Error deleting paper:', error);
      setError('Failed to delete paper');
    }
  };

  // Filtering
  const handleFilter = (e) => {
    const { name, value } = e.target;
    const filtered = papers.filter(paper => 
      (!value || paper.examDetails[name] === value)
    );
    setFilteredPapers(filtered);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Question Papers</h1>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select 
          name="course"
          onChange={handleFilter}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Courses</option>
          <option value="BSC">BSC</option>
          <option value="BCA">BCA</option>
        </select>

        <select 
          name="semester"
          onChange={handleFilter}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Semesters</option>
          <option value="THIRD">Third</option>
          <option value="FOURTH">Fourth</option>
        </select>

        <select 
          name="subjectCode"
          onChange={handleFilter}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Subjects</option>
          <option value="BSC301">BSC301</option>
          <option value="BCA401">BCA401</option>
        </select>

        <select 
          name="status"
          onChange={handleFilter}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Papers List */}
      <div className="grid gap-4">
        {filteredPapers.map((paper) => (
          <div 
            key={paper._id} 
            className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <FileText className="text-blue-500 w-10 h-10" />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {paper.examDetails.subjectName} - {paper.examDetails.subjectCode}
                </h2>
                <p className="text-sm text-gray-600">
                  {paper.examDetails.course} | {paper.examDetails.semester} Semester
                </p>
                <span 
                  className={`inline-block px-2 py-1 rounded-full text-xs font-bold 
                    ${paper.metadata.status === 'draft' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : paper.metadata.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'}`}
                >
                  {paper.metadata.status}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => viewPaper(paper)}
                className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                title="View"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button 
                onClick={() => downloadPaper(paper)}
                className="text-green-500 hover:bg-green-50 p-2 rounded-full transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={() => editPaper(paper)}
                className="text-yellow-500 hover:bg-yellow-50 p-2 rounded-full transition-colors"
                title="Edit"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button 
                onClick={() => deletePaper(paper)}
                className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EndSemSide;