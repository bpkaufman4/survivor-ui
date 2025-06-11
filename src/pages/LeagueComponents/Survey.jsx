import { useEffect, useState } from "react";
import PollIcon from '@mui/icons-material/Poll';
import LockIcon from '@mui/icons-material/Lock';
import apiUrl from "../../apiUrls";
import Swal from "sweetalert2";
import withReactContent from 'sweetalert2-react-content'
import { DateTime } from "luxon";

export default function Survey({ leagueId }) {
  const [latestSurvey, setLatestSurvey] = useState(null);
  const [teamSurvey, setTeamSurvey] = useState(null);
  const [error, setError] = useState(false);
  const [lockDown, setLockDown] = useState(true);
  
  function fetchLatestSurvey() {
    fetch(`${apiUrl}survey/latest/${leagueId}`, {
      headers: {
        authorization: localStorage.getItem('jwt')
      }
    })
    .then(response => response.json())
    .then(reply => {
      console.log(reply);
      if(reply.status === 'success') {
        setLatestSurvey(reply.data.survey)
        setTeamSurvey(reply.data.teamSurvey)
        setLockDown(reply.data.lockDown);
      } else {
        setError(true);
      }
    })
    .catch(err => {
      console.error(err);
      setError(true);
    });
  }

  useEffect(() => {
    fetchLatestSurvey();
  }, []);

  function Form() {
    if(error) return <p>Something went wrong</p>;

    return(
      <>
        <h5>{latestSurvey.episode.title ? `${latestSurvey.episode.title} - ` : ''}{DateTime.fromISO(latestSurvey.episode.airDate).toLocaleString(DateTime.DATE_SHORT)}</h5>
        {lockDown && (<>
          <LockIcon />
          <p>The show is in progress. Good luck!</p>
        </>)}
        {latestSurvey.questions && latestSurvey.questions.map(q => {
          let labelText = q.prompt;
          if(q.answerCount > 1) labelText += ` (choose ${q.answerCount})`;

          let surveyAnswerIds = [];

          if(teamSurvey && teamSurvey.teamAnswers) {
            surveyAnswerIds = teamSurvey.teamAnswers.map(a => a.answerOptionId);
          }

          return (
            <div key={q.questionId} data-answer-count={q.answerCount} data-question-id={q.questionId} className="question py-3 border-bottom">
                <p>{labelText}</p>
                {q.answerOptions && q.answerOptions.map(a => {
                  const name = (q.answerCount > 1) ? a.questionOptionId : a.questionId;
                  const type = (q.answerCount > 1) ? 'checkbox' : 'radio';

                  return (
                    <div className="form-check text-start" key={a.questionOptionId}>
                      <input type={type} className="form-check-input" id={a.questionOptionId} name={name} defaultChecked={surveyAnswerIds.includes(a.questionOptionId)} disabled={lockDown}/>
                      <label className="form-check-label text-start" htmlFor={a.questionOptionId}>{a.display}</label>
                    </div>
                  )
                })}
            </div>
          )
        })}
      </>
    )
  }

  function showPopup() {

    if(latestSurvey === null) {
      Swal.fire({
        text: "No poll available",
        icon: 'info'
      })
      return;
    }

    const MySwal = withReactContent(Swal);

    const icon = error ? 'error' : '';
    MySwal.fire({
      html: <Form/>,
      icon,
      showConfirmButton: !lockDown,
      showCancelButton: lockDown,
      cancelButtonText: 'Close',
      preConfirm: () => {

        let body = {
          questions: [],
          leagueId,
          surveyId: latestSurvey.surveyId,
          teamSurveyId: teamSurvey ? teamSurvey.teamSurveyId : null
        };

        
        
        return new Promise((resolve, reject) => {
          
          const questions = [...document.querySelectorAll('.question')].map(elem => {
            let q = {
              questionId: elem.dataset.questionId,
            }
            
            q.answers = [...elem.querySelectorAll('input:checked')].map(check => {
              return check.id;
            })
            
            if(q.answers.length != elem.dataset.answerCount) {
              elem.classList.add('required');
              return false;
            } else {
              elem.classList.remove('required')
              return q;
            }
          })

          if(questions.includes(false)) {
            MySwal.showValidationMessage(`One or more questions have the incorrect number of answers`)
            resolve({message: 'Invalid answers'})
            return;
          }

          if(questions.length > 0) body.questions = questions;

          fetch(`${apiUrl}survey/submit`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
              authorization: localStorage.getItem('jwt'),
              "Content-Type": "application/json"
            }
          })
          .then(response => response.json())
          .then(reply => {
            fetchLatestSurvey();
            resolve(reply);
          })
          .catch(err => {
            reject(err);
          })
        })
      }
    })
    .then(reply => {
      console.log(reply);
    })
  }

  let buttonClasses = "btn";
  if(latestSurvey && !teamSurvey) buttonClasses += " unread";
  if(lockDown) buttonClasses += " live"

  return (
    <button className={buttonClasses} onClick={showPopup}>
      <PollIcon />
    </button>
  );
}