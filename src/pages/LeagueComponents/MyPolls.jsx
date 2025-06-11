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
    <div>
      {polls.map((poll, index) => (
        <div key={poll.surveyId} className="border-bottom border-2 border-dar-subtle">
          <div className="d-flex justify-content-between align-items-center" onClick={() => toggleExpand(index)}>
            <p className="m-0"><strong>{DateTime.fromISO(poll.episode.airDate).toLocaleString(DateTime.DATE_SHORT)}</strong>  {poll.graded ? `— Total Points: ${poll.totalPointsAwarded}` : '— Pending Results'}</p>
            <button className="btn">
              {poll.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </button>
          </div>

          {poll.expanded && (
            <div>
              {poll.questions.map(q => {

                const correctAnswers = q.answerOptions.filter(ao => ao.correct).map(ao => ao.display);

                return (
                  <div key={q.questionId}  className="border-top border-dashed">
                    <p className="mt-3">{q.prompt} ({q.points} point{q.points > 1 && 's'})</p>
                    <div>
                      {q.teamAnswers.map(a => {

                        let classList = 'btn';
                        classList += !poll.graded ? ' bg-secondary-subtle' : a.answerOption.correct ? ' text-success-emphasis bg-success-subtle' : ' text-danger-emphasis bg-danger-subtle';
  
                        return (
                          <div key={a.teamAnswerId}>
                            <p className={classList}>{a.answerOption.display}</p>
                          </div>
                        )
                      })}
                    </div>
                    {poll.graded && (() => {
                      return <p><strong>Correct:</strong> {correctAnswers.join(', ')}</p>
                    })()
                    }
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}