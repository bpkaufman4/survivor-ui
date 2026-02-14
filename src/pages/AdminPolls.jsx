import { useState, useEffect } from 'react';
import apiUrl from '../apiUrls';
import WaterLoader from '../components/WaterLoader';
import DotLoader from '../components/DotLoader';
import Swal from 'sweetalert2';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PollResults from './AdminPollsComponents/PollResults';

function AdminPolls() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list', 'create', 'results'
  const [selectedPollId, setSelectedPollId] = useState(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = () => {
    setLoading(true);
    fetch(`${apiUrl}poll?isAdmin=true`, {
      headers: {
        'authorization': localStorage.getItem('jwt')
      }
    })
      .then(res => {
        if (res.status === 500 || !res.ok) {
          console.error("Server error:", res);
          setPolls([]);
          setLoading(false);
          return;
        }
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data)) {
          setPolls(data);
        } else {
          console.error("Expected array from polls API but got:", data);
          setPolls([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = (pollId) => {
    // Implement delete logic if needed (not strictly asked for but useful for admin)
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${apiUrl}poll/${pollId}`, {
            method: 'DELETE',
            headers: {
              'authorization': localStorage.getItem('jwt')
            }
          });

          if (res.ok) {
            Swal.fire('Deleted!', 'Poll has been deleted.', 'success');
            fetchPolls();
          } else {
            Swal.fire('Error', 'Failed to delete poll', 'error');
          }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'An error occurred', 'error');
        }
      }
    })
  };

  const handleViewResults = (pollId) => {
    setSelectedPollId(pollId);
    setView('results');
  };

  if (loading) return <WaterLoader />;

  if (view === 'results' && selectedPollId) {
    return <PollResults pollId={selectedPollId} onBack={() => { setView('list'); setSelectedPollId(null); }} />;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Polls</h2>
        {view === 'list' && (
          <button className="btn btn-primary" onClick={() => setView('create')}>
            <AddIcon /> Create Poll
          </button>
        )}
        {view === 'create' && (
          <button className="btn btn-secondary" onClick={() => setView('list')}>
            Back to List
          </button>
        )}
      </div>

      {view === 'list' ? (
        <div className="list-group">
          {polls.length === 0 && <p>No active polls found.</p>}
          {polls.map(poll => (
            <div key={poll.pollId} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              <div onClick={() => handleViewResults(poll.pollId)} style={{cursor: 'pointer', flex: 1}}>
                  <h5 className="mb-1">{poll.title}</h5>
                  <p className="mb-1">{poll.description}</p>
                  <small className="text-muted">Questions: {poll.questions?.length || 0} (Click to view results)</small>
              </div>
              <button className="btn btn-outline-danger btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(poll.pollId); }}>
                  <DeleteIcon />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <CreatePollForm onCancel={() => setView('list')} onSuccess={() => { setView('list'); fetchPolls(); }} />
      )}
    </div>
  );
}

function CreatePollForm({ onCancel, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { text: '', questionType: 'single', options: [{ text: '' }, { text: '' }] }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', questionType: 'single', options: [{ text: '' }, { text: '' }] }]);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({ text: '' });
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex].text = value;
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
    setQuestions(newQuestions);
  };

  const removeQuestion = (qIndex) => {
    const newQuestions = questions.filter((_, i) => i !== qIndex);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      title,
      description,
      questions
    };

    try {
      const res = await fetch(`${apiUrl}poll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': localStorage.getItem('jwt')
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Swal.fire('Success', 'Poll created successfully', 'success');
        onSuccess();
      } else {
        Swal.fire('Error', 'Failed to create poll', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'An error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      <div className="mb-3">
        <label className="form-label">Poll Title</label>
        <input required type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} />
      </div>

      <hr />
      <h4>Questions</h4>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="card mb-3 p-3 bg-light">
          <div className="d-flex justify-content-between">
            <h5 className="mb-3">Question {qIndex + 1}</h5>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeQuestion(qIndex)}><DeleteIcon /></button>
          </div>

          <div className="mb-2">
            <label>Question Text</label>
            <input required type="text" className="form-control" value={q.text} onChange={e => updateQuestion(qIndex, 'text', e.target.value)} />
          </div>
          <div className="mb-2">
            <label>Type</label>
            <select className="form-select" value={q.questionType} onChange={e => updateQuestion(qIndex, 'questionType', e.target.value)}>
              <option value="single">Single Choice</option>
              <option value="multiple">Multiple Choice</option>
            </select>
          </div>

          <div className="mt-3">
            <label>Options</label>
            {q.options.map((opt, oIndex) => (
              <div key={oIndex} className="d-flex mb-2 gap-2">
                <input required type="text" className="form-control" placeholder={`Option ${oIndex + 1}`} value={opt.text} onChange={e => updateOption(qIndex, oIndex, e.target.value)} />
                <button type="button" className="btn btn-outline-danger" onClick={() => removeOption(qIndex, oIndex)}>X</button>
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => addOption(qIndex)}>+ Add Option</button>
          </div>
        </div>
      ))}

      <button type="button" className="btn btn-info mb-4 text-white" onClick={addQuestion}>+ Add Another Question</button>

      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-success" disabled={submitting}>
          {submitting ? <DotLoader /> : 'Create Poll'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>Cancel</button>
      </div>
    </form>
  );
}

export default AdminPolls;
