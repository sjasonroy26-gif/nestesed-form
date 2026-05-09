import React, { useState, useEffect } from 'react';

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- RECURSIVE QUESTION COMPONENT ---
const QuestionItem = ({ question, prefix, onUpdate, onDelete, onAddChild }) => {
  // Handle text input changes
  const handleTextChange = (e) => {
    onUpdate(question.id, { ...question, text: e.target.value });
  };

  // Handle type dropdown changes
  const handleTypeChange = (e) => {
    onUpdate(question.id, { ...question, type: e.target.value, answer: '' });
  };

  // Handle the interactive answer change (used to trigger the child condition)
  const handleAnswerChange = (e) => {
    onUpdate(question.id, { ...question, answer: e.target.value });
  };

  // Condition 4a: Show "Add Child" if it's a True/False question AND the answer is "True"
  const showAddChild = question.type === 'True/False' && question.answer === 'True';

  return (
    <div style={{ marginLeft: '20px', marginBottom: '15px', padding: '10px', borderLeft: '2px solid #ccc' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <strong>Q{prefix}</strong>
        
        <input
          type="text"
          placeholder="Enter your question here..."
          value={question.text}
          onChange={handleTextChange}
          style={{ padding: '5px', width: '250px' }}
        />

        <select value={question.type} onChange={handleTypeChange} style={{ padding: '5px' }}>
          <option value="Short Answer">Short Answer</option>
          <option value="True/False">True/False</option>
        </select>

        {/* Interactive Answer Input to trigger Condition 4a */}
        {question.type === 'True/False' ? (
          <select value={question.answer} onChange={handleAnswerChange} style={{ padding: '5px' }}>
            <option value="">Select Answer</option>
            <option value="True">True</option>
            <option value="False">False</option>
          </select>
        ) : (
          <input 
            type="text" 
            placeholder="Answer..." 
            value={question.answer} 
            onChange={handleAnswerChange}
            style={{ padding: '5px' }}
          />
        )}

        <button onClick={() => onDelete(question.id)} style={{ color: 'red', cursor: 'pointer' }}>
          Delete
        </button>
      </div>

      {showAddChild && (
        <button onClick={() => onAddChild(question.id)} style={{ marginBottom: '10px', cursor: 'pointer' }}>
          + Add Nested Child Question
        </button>
      )}

      {/* RECURSIVE CALL: Render children if they exist */}
      {question.children && question.children.length > 0 && (
        <div className="children-container">
          {question.children.map((child, index) => (
            <QuestionItem
              key={child.id}
              question={child}
              prefix={`${prefix}.${index + 1}`}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN FORM COMPONENT ---
export default function NestedForm() {
  const [questions, setQuestions] = useState([]);
  const [submittedData, setSubmittedData] = useState(null);

  // Bonus Challenge: Load from Local Storage on initial mount
  useEffect(() => {
    const savedData = localStorage.getItem('nestedFormData');
    if (savedData) {
      setQuestions(JSON.parse(savedData));
    }
  }, []);

  // Bonus Challenge: Save to Local Storage whenever questions change
  useEffect(() => {
    localStorage.setItem('nestedFormData', JSON.stringify(questions));
  }, [questions]);

  // Add a top-level parent question
  const addParentQuestion = () => {
    const newQuestion = {
      id: generateId(),
      text: '',
      type: 'Short Answer',
      answer: '',
      children: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  // Recursively update a question by ID
  const updateQuestionTree = (nodes, id, updatedQuestion) => {
    return nodes.map((node) => {
      if (node.id === id) return updatedQuestion;
      if (node.children.length > 0) {
        return { ...node, children: updateQuestionTree(node.children, id, updatedQuestion) };
      }
      return node;
    });
  };

  const handleUpdate = (id, updatedQuestion) => {
    setQuestions(updateQuestionTree(questions, id, updatedQuestion));
  };

  // Recursively delete a question by ID
  const deleteFromTree = (nodes, id) => {
    return nodes
      .filter((node) => node.id !== id)
      .map((node) => ({
        ...node,
        children: deleteFromTree(node.children, id),
      }));
  };

  const handleDelete = (id) => {
    setQuestions(deleteFromTree(questions, id));
  };

  // Recursively find a node and add a child to it
  const addChildToTree = (nodes, parentId, newChild) => {
    return nodes.map((node) => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, newChild] };
      }
      if (node.children.length > 0) {
        return { ...node, children: addChildToTree(node.children, parentId, newChild) };
      }
      return node;
    });
  };

  const handleAddChild = (parentId) => {
    const newChild = {
      id: generateId(),
      text: '',
      type: 'Short Answer',
      answer: '',
      children: [],
    };
    setQuestions(addChildToTree(questions, parentId, newChild));
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedData(questions);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <h2>Dynamic Nested Form</h2>
      
      <button 
        onClick={addParentQuestion} 
        style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}
      >
        + Add New Parent Question
      </button>

      <form onSubmit={handleSubmit}>
        {questions.map((q, index) => (
          <QuestionItem
            key={q.id}
            question={q}
            prefix={`${index + 1}`}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onAddChild={handleAddChild}
          />
        ))}

        {questions.length > 0 && (
          <button 
            type="submit" 
            style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}
          >
            Submit Form
          </button>
        )}
      </form>

      {/* Display Submitted Data */}
      {submittedData && (
        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', border: '1px solid #ddd' }}>
          <h3>Submitted Data (Hierarchical View)</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}