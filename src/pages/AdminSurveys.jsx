import { useEffect, useState } from "react";
import AdminMain from "../components/AdminMain";
import apiUrl from "../apiUrls";
import WaterLoader from "../components/WaterLoader";
import AddIcon from '@mui/icons-material/Add';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import DotLoader from "../components/DotLoader";
import { DateTime } from "luxon";
import Swal from "sweetalert2";

function AdminSurveys() {

  const [view, setView] = useState('table');
  const [editingSurveyId, setEditingSurveyId] = useState(null);
  
  function addSurvey() {
    setEditingSurveyId(null)
    setView('form');
  }

  function Table() {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [surveys, setSurveys] = useState(null);

    function fetchSurveys() {
      fetch(`${apiUrl}survey`, {
        headers: {
          authorization: localStorage.getItem('jwt')
        }
      })
      .then(response => response.json())
      .then(reply => {
        if(reply.status === 'success') {
          setSurveys(reply.data);
        } else {
          setError(true);
          console.log(reply);
        }
      })
      .catch(err => {
        setError(true);
        console.log(err);
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
        }, 1000)
      })
    }

    useEffect(() => {
      fetchSurveys();
    }, [])

    if(error) return <p>Error loading surveys</p>;

    if(loading) return <WaterLoader></WaterLoader>;

    function editSurvey(surveyId) {
      setEditingSurveyId(surveyId);
      setView('form');
    }

    function deleteSurvey(surveyId) {
      Swal.fire({
          title: "Delete Survey?",
          text: `Survey submissions for this survey will also be deleted. This cannot be undone.`,
          showCancelButton: true
        })
        .then(reply => {
          if(reply.isConfirmed) {
            fetch(`${apiUrl}survey/${surveyId}`, {
              method: 'DELETE',
              headers: {
                authorization: localStorage.getItem('jwt')
              }
            })
            .then(response => {
              return response.json();
            })
            .then(reply => {
              if(reply.status === 'success') {
                fetchSurveys();
              } else {
                console.log(reply);
              }
            })
            .catch(err => {
              console.log(err);
            })
          }
        })
    }

    return (
      <>
        <div className="d-flex justify-content-between py-3">
          <h2 className="w-auto">Surveys</h2>
          <button className="btn btn-primary" onClick={addSurvey}>Add Survey</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Episode</th>
              <th>Deadline</th>
              <th>Questions</th>
              <th>Submissions</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {surveys.map(s => {
              return (
                <tr key={s.surveyId}>
                  <td>{s.episode.title}</td>
                  <td>{DateTime.fromISO(s.episode.airDate).toLocaleString(DateTime.DATETIME_SHORT)}</td>
                  <td>{s.questions.length}</td>
                  <td>0</td>
                  <td>
                    <button className="btn" onClick={() => editSurvey(s.surveyId)}>
                      <ModeEditIcon></ModeEditIcon>
                    </button>
                  </td>
                  <td>
                    <button className="btn" onClick={() => deleteSurvey(s.surveyId)}>
                      <DeleteIcon></DeleteIcon>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </>
    )
  }

  function Form({ surveyId }) {
    const defaultQuestion = {
      questionId: -1,
      prompt: '',
      type: '',
      points: 0,
      answerCount: 0
    }

    const [questions, setQuestions] = useState([defaultQuestion]);
    const [tempId, setTempId] = useState(-2)
    const [submitting, setSubmitting] = useState(false);
    const [episodes, setEpisodes] = useState([]);
    const [episodeId, setEpisodeId] = useState(null);

    useEffect(() => {
      // only will run once

      function fetchSurvey() {
        fetch(`${apiUrl}survey/${surveyId}`, {
          headers: {
            authorization: localStorage.getItem('jwt')
          }
        })
        .then(response => response.json())
        .then(reply => {
          if(reply.status === 'success') {
            setQuestions(reply.data.questions);
            setEpisodeId(reply.data.episodeId);
          } else {
            console.log(reply);
          }
        })
        .catch(err => {
          console.log(err);
        })
      }

      function fetchEpisodes() {
        fetch(`${apiUrl}episode/admin`, {
          headers: {
            authorization: localStorage.getItem('jwt')
          }
        })
        .then(response => response.json())
        .then(reply => {
          if(reply.status === 'success') {
            setEpisodes(reply.data);
            if(!episodeId) setEpisodeId(reply.data[0].episodeId);
            if(surveyId) {
              fetchSurvey();
            }
          } else {
            console.log(reply);
          }
        })
        .catch(err => {
          console.log(err);
        })
      }


      fetchEpisodes();
      console.log('effect run');
    }, []);

    function changePrompt(id, value) {
      setQuestions(prev => 
        prev.map(q => {
          return q.questionId === id ? {...q, prompt: value} : q
        })
      )
    }

    function changeType(id, value) {
      console.log(value);
      setQuestions(prev => 
        prev.map(q => {
          return q.questionId === id ? {...q, type: value} : q
        })
      )
    }

    function changePoints(id, value) {
      console.log(value);
      setQuestions(prev => 
        prev.map(q => {
          return q.questionId === id ? {...q, points: value} : q
        })
      )
    }

    function changeAnswerCount(id, value) {
      console.log(value);
      setQuestions(prev => 
        prev.map(q => {
          return q.questionId === id ? {...q, answerCount: value} : q
        })
      )
    }

    function addQuestion(e) {
      e.preventDefault();
      const newQuestion = {...defaultQuestion, questionId: tempId};
      setQuestions([...questions, newQuestion])
      setTempId(tempId => tempId - 1);
    }

    function deleteQuestion(questionId) {
      setQuestions(questions.filter(q => q.questionId !== questionId));
    }

    function submitForm(e) {
      setSubmitting(true);
      let bodyJSON = {questions, episodeId};
      if(editingSurveyId) bodyJSON = {...bodyJSON, surveyId: editingSurveyId};
      
      fetch(`${apiUrl}survey`, {
        method: "POST",
        body: JSON.stringify(bodyJSON),
        headers: {
          authorization: localStorage.getItem('jwt'),
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(reply => {
        console.log(reply);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setTimeout(() => {
          setSubmitting(false);
          setView('table');
        }, 500)
      })
    }

    return (
      <form>
        <div className="form-group">
          <label htmlFor="episode">Episode</label>
          <select className="form-control" id="episode" name="episode" value={episodeId} onChange={e => setEpisodeId(e.target.value)}>
            {episodes.map(e => {
              return <option key={e.episodeId} value={e.episodeId}>{DateTime.fromISO(e.airDate).toLocaleString(DateTime.DATETIME_SHORT)} - {e.title || 'Untitled'}</option>
            })}
          </select>
        </div>
        {questions.map((q, i) => {
          return (
            <div className="row mt-3" key={`${q.questionId}`}>
              <h5 className="col-12">Question {i + 1}</h5>
              <div className="form-group col-5">
                <label htmlFor={`prompt${i}`}>Prompt</label>
                <input type="text" className="form-control" required value={q.prompt} onChange={(e) => changePrompt(q.questionId, e.target.value)}/>
              </div>
              <div className="form-group col-2">
                <label htmlFor={`points${i}`}>Points (per correct answer)</label>
                <input type="number" className="form-control" required id={`points${i}`} name={`points${i}`} value={q.points} onChange={(e) => changePoints(q.questionId, e.target.value)}/>
              </div>
              <div className="form-group col-2">
                <label htmlFor={`answerCount${i}`}># of answers</label>
                <input type="number" className="form-control" required id={`answerCount${i}`} name={`answerCount${i}`} value={q.answerCount} onChange={(e) => changeAnswerCount(q.questionId, e.target.value)}/>
              </div>
              <div className="form-group col-2">
                <label htmlFor={`type${i}`}>Options Type</label>
                {(() => {
                  if(isNaN(q.questionId)) {
                    return <input type="text" className="form-control" disabled={true} value={q.type.charAt(0).toUpperCase() + q.type.slice(1)}></input>
                  } else {
                    return (
                      <select className="form-control" name={`type${i}`} id={`type${i}`} value={q.type} onChange={(e) => changeType(q.questionId, e.target.value)}>
                        <option value=""></option>
                        <option value={'players'}>Players</option>
                        <option value={'tribes'}>Tribes</option>
                      </select>
                    )
                  }
                })()}
              </div>
              {(() => {
                if(i !== 0 || questions.length > 1) {
                  return (
                    <div className="col-1">
                      <button type="button" className="btn" onClick={() => deleteQuestion(q.questionId)}>
                        <DeleteIcon />
                      </button>
                    </div>
                  )
                }
              })()}
            </div>
          )
        })}
        <button type="button" className="btn" onClick={addQuestion}>
          <AddIcon></AddIcon>
        </button>
        <div className="d-flex justify-content-between">
          {(() => {
            if(submitting) {
              return (
                <>
                  <button disabled={true} type="button" className="btn btn-outline-primary">Back</button>
                  <button type="submit" disabled={true} className="btn btn-primary">
                    <DotLoader color={"white"}></DotLoader>
                  </button>
                </>
              )
            } else {
              return (
                <>
                  <button type="button" className="btn btn-outline-primary" onClick={() => setView('table')}>Back</button>
                  <button type="button" className="btn btn-primary" onClick={submitForm}>Save</button>
                </>
              )
            }
          })()}
        </div>
      </form>
    )
  }

  function Content() {
    switch(view) {
      default:
      case 'table':
        return <Table></Table>
      case 'form':
        return <Form surveyId={editingSurveyId}></Form>
    }
  }

  return (
    <AdminMain page={'admin-survey'}>
      <Content></Content>
    </AdminMain>
  )
}

export default AdminSurveys;