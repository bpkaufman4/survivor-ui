import { useState, useEffect } from 'react';
import apiUrl from '../../apiUrls';
import Swal from 'sweetalert2';
import DotLoader from '../../components/DotLoader';

function UserPoll() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState({}); // { pollQuestionId: [pollOptionId, ...] }
  const [submitting, setSubmitting] = useState({}); // { pollId: boolean }
  const [submittedPolls, setSubmittedPolls] = useState(new Set());

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = () => {
    fetch(`${apiUrl}poll`, {
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
          // Sort data so newest is first
          data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          setPolls(data);
          
          // Check existing votes and populate state
          const newSubmitted = new Set();
          const newVotes = {};

          data.forEach(poll => {
              let hasVoted = false;
              
              poll.questions.forEach(q => {
                  // Check if the current user has voted on this question
                  const userVotes = q.votes || [];
                  if (userVotes.length > 0) {
                      hasVoted = true;
                      newVotes[q.pollQuestionId] = userVotes.map(v => v.pollOptionId);
                  }
              });

              if (hasVoted) {
                  newSubmitted.add(poll.pollId);
              }
          });

          setSubmittedPolls(newSubmitted);
          setVotes(newVotes);
        } else {
           setPolls([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleOptionChange = (pollId, questionId, optionId, type) => {
    if (submittedPolls.has(pollId)) return; // Prevent changing if already submitted

    setVotes(prev => {
      const currentVotes = prev[questionId] || [];
      if (type === 'single') {
        return { ...prev, [questionId]: [optionId] };
      } else {
        // Multiple choice
        if (currentVotes.includes(optionId)) {
          return { ...prev, [questionId]: currentVotes.filter(id => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...currentVotes, optionId] };
        }
      }
    });
  };

  const handleSubmit = async (pollId) => {
    const poll = polls.find(p => p.pollId === pollId);
    if (!poll) return;

    // Validation: Check if all questions have at least one answer? 
    // Or is it optional? Assuming required for now.
    const unanswered = poll.questions.some(q => !votes[q.pollQuestionId] || votes[q.pollQuestionId].length === 0);
    if (unanswered) {
      Swal.fire('Warning', 'Please answer all questions before submitting', 'warning');
      return;
    }

    setSubmitting(prev => ({ ...prev, [pollId]: true }));

    // Transform votes state to expected API format
    // { pollId: "...", votes: [ { pollQuestionId, pollOptionId } ] }
    const votesToSubmit = [];
    poll.questions.forEach(q => {
      const selectedOptions = votes[q.pollQuestionId] || [];
      selectedOptions.forEach(optId => {
        votesToSubmit.push({
          pollQuestionId: q.pollQuestionId,
          pollOptionId: optId
        });
      });
    });

    try {
      const res = await fetch(`${apiUrl}poll/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': localStorage.getItem('jwt')
        },
        body: JSON.stringify({ pollId, votes: votesToSubmit })
      });

      if (res.ok) {
        Swal.fire('Success', 'Thanks for voting!', 'success');
        setSubmittedPolls(prev => new Set(prev).add(pollId));
      } else {
        const errData = await res.json();
        Swal.fire('Error', errData.message || 'Failed to submit vote', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'An error occurred', 'error');
    } finally {
      setSubmitting(prev => ({ ...prev, [pollId]: false }));
    }
  };

  if (loading) return null; // Or a small loader
  if (polls.length === 0) return null;

  return (
    <div className="container mt-4 mb-4">
      {polls.map(poll => {
        const isSubmitted = submittedPolls.has(poll.pollId);
        return (
          <div key={poll.pollId} className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">{poll.title}</h5>
            </div>
            <div className="card-body">
              {poll.description && <p className="lead">{poll.description}</p>}

              {poll.questions.map((question, qIndex) => (
                <div key={question.pollQuestionId} className="mb-4">
                  <h6 className="fw-bold">{qIndex + 1}. {question.text}</h6>
                  {question.options.map(option => {
                    const isSelected = votes[question.pollQuestionId]?.includes(option.pollOptionId);
                    return (
                      <div key={option.pollOptionId} className="form-check">
                        <input
                          className="form-check-input"
                          type={question.questionType === 'single' ? 'radio' : 'checkbox'}
                          name={`q-${question.pollQuestionId}`}
                          id={`opt-${option.pollOptionId}`}
                          checked={isSelected || false}
                          onChange={() => handleOptionChange(poll.pollId, question.pollQuestionId, option.pollOptionId, question.questionType)}
                          disabled={isSubmitted}
                        />
                        <label className="form-check-label" htmlFor={`opt-${option.pollOptionId}`}>
                          {option.text}
                        </label>
                      </div>
                    );
                  })}
                </div>
              ))}

              {!isSubmitted ? (
                <button
                  className="btn btn-success"
                  onClick={() => handleSubmit(poll.pollId)}
                  disabled={submitting[poll.pollId]}
                >
                  {submitting[poll.pollId] ? <DotLoader /> : 'Submit Vote'}
                </button>
              ) : (
                <div className="alert alert-success">
                  You have already voted on this poll.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default UserPoll;
