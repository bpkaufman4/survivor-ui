import { useEffect, useState } from "react";
import WaterLoader from "../../components/WaterLoader";
import apiUrl from "../../apiUrls";
import { DateTime } from "luxon";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function MyPolls({ leagueId }) {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [polls, setPolls] = useState(null);

  useEffect(() => {
    function fetchPolls() {
      fetch(`${apiUrl}survey/myPolls/${leagueId}`,
        {
          headers: {
            authorization: localStorage.getItem('jwt')
          }
        }
      )
      .then(response => response.json())
      .then(reply => {
        if(reply.status === 'success') {
          const withExpanded = reply.data.map(s => ({ ...s, expanded: false }));
          setPolls(withExpanded);
        } else {
          console.log(reply);
          setError(true);
        }
      })
      .catch(err => {
        console.log(err);
        setError(true);
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
        }, 300)
      })
    }

    fetchPolls();
  }, [leagueId]);

  if(loading) return <WaterLoader></WaterLoader>
  if(error) return <p>Something went wrong</p>

  const toggleExpand = (index) => {
    setPolls(prev =>
      prev.map((poll, i) =>
        i === index ? { ...poll, expanded: !poll.expanded } : poll
      )
    );
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-warning text-dark">
        <h5 className="card-title mb-0">My Poll History</h5>
      </div>
      <div className="card-body p-0">
        {polls && polls.length > 0 ? (
          polls.map((poll, index) => (
            <div key={poll.surveyId} className="border-bottom">
              <div 
                className="d-flex justify-content-between align-items-center p-3 cursor-pointer" 
                onClick={() => toggleExpand(index)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <h6 className="mb-1 fw-semibold">
                    {DateTime.fromISO(poll.episode.airDate).toLocaleString(DateTime.DATE_SHORT)}
                  </h6>
                  <div className="d-flex align-items-center gap-2">
                    {poll.graded ? (
                      <span className="badge bg-success">Total Points: {poll.totalPointsAwarded}</span>
                    ) : (
                      <span className="badge bg-secondary">Pending Results</span>
                    )}
                  </div>
                </div>
                <button className="btn btn-outline-secondary btn-sm">
                  {poll.expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </button>
              </div>

              {poll.expanded && (
                <div className="px-3 pb-3 bg-light">
                  {poll.questions.map(q => {
                    const correctAnswers = q.answerOptions.filter(ao => ao.correct).map(ao => ao.display);

                    return (
                      <div key={q.questionId} className="border-top py-3">
                        <div className="mb-3">
                          <h6 className="fw-semibold mb-1">{q.prompt}</h6>
                          <span className="badge bg-info">{q.points} point{q.points > 1 ? 's' : ''}</span>
                        </div>
                        
                        <div className="mb-3">
                          <small className="text-muted fw-semibold">Your Answer{q.teamAnswers.length > 1 ? 's' : ''}:</small>
                          <div className="mt-1">
                            {q.teamAnswers.map(a => {
                              let badgeClass = 'badge me-2 mb-1 ';
                              if (!poll.graded) {
                                badgeClass += 'bg-secondary';
                              } else {
                                badgeClass += a.answerOption.correct ? 'bg-success' : 'bg-danger';
                              }

                              return (
                                <span key={a.teamAnswerId} className={badgeClass}>
                                  {a.answerOption.display}
                                  {poll.graded && (
                                    <span className="ms-1">
                                      {a.answerOption.correct ? '✓' : '✗'}
                                    </span>
                                  )}
                                </span>
                              )
                            })}
                          </div>
                        </div>

                        {poll.graded && correctAnswers.length > 0 && (
                          <div className="alert alert-info mb-0 py-2">
                            <small className="fw-semibold">Correct Answer{correctAnswers.length > 1 ? 's' : ''}:</small>
                            <div>{correctAnswers.join(', ')}</div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-muted py-4">
            <p>No polls available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}