import { useEffect, useState } from "react";
import apiUrl from "../../apiUrls";
import WaterLoader from "../../components/WaterLoader";
import { DateTime } from "luxon";
import Swal from "sweetalert2";


export default function Grade({ surveyId, setView }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [survey, setSurvey] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [lockDown, setLockDown] = useState(false);

  useEffect(() => {
    function fetchSurvey() {
      fetch(`${apiUrl}survey/${surveyId}`, {
        headers: {
          authorization: localStorage.getItem('jwt')
        }
      })
      .then(response => response.json())
      .then(reply => {
        if(reply.status === 'success') {
          setSurvey(reply.data);
          const correctAnswerIds = reply.data.questions.flatMap(q => 
            q.answerOptions
              .filter(option => option.correct)
              .map(option => option.questionOptionId)
          )
          setCorrectAnswers(correctAnswerIds);
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

    fetchSurvey();
  }, [])


  if(loading) return <WaterLoader />
  if(error) return <p>Something went wrong</p>


  function gradeSurvey() {
    const body = JSON.stringify({correctAnswers});

    setLockDown(true);

    fetch(`${apiUrl}survey/grade/${surveyId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: localStorage.getItem('jwt')
      },
      body
    })
    .then(response => response.json())
    .then(reply => {
      if(reply.status === 'success') {
        Swal.fire({
          toast: true,
          text: 'Survey Graded',
          position: 'top',
          icon: 'success',
          showConfirmButton: false,
          timer: 2000
        })
        setView('table');
      }
    })
    .catch(err => {
      Swal.fire({
        toast: true,
        text: 'Something went wrong',
        position: 'top',
        timer: 2000,
        showConfirmButton: false,
        icon: 'error'
      });
    })
    .finally(() => {
      setLockDown(false);
    })
  }


  return (
    <>
      <h3 className="mt-3">{survey.episode.title && `${survey.episode.title} - `}{DateTime.fromISO(survey.episode.airDate).toLocaleString(DateTime.DATE_SHORT)}</h3>
      {survey.questions && survey.questions.map(q => {
        return (
          <div key={q.questionId}>
            <h5>{q.prompt}</h5>
            {q.answerOptions && q.answerOptions.map(a => {
              
              function toggleAnswer(e) {
                if(e.target.checked) {
                  setCorrectAnswers([...correctAnswers, a.questionOptionId]);
                } else {
                  setCorrectAnswers(prev => prev.filter(c => c !== a.questionOptionId));
                }
              }

              return (
                <div className="form-check text-start" key={a.questionOptionId}>
                  <input type="checkbox" className="form-check-input" id={a.questionOptionId} name={a.questionOptionId} checked={correctAnswers.includes(a.questionOptionId)} disabled={lockDown} onChange={toggleAnswer}/>
                  <label className="form-check-label text-start" htmlFor={a.questionOptionId}>{a.display}</label>
                </div>
              )
            })}
          </div>
        )
      })}
      <div className="d-flex justify-content-between">
        <button className="btn btn-outline-primary" onClick={() => setView('table')}>Back</button>
        <button className="btn btn-primary" onClick={gradeSurvey}>Save</button>
      </div>
    </>
  )
}