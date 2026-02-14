import { useState, useEffect } from 'react';
import apiUrl from '../../apiUrls';
import WaterLoader from '../../components/WaterLoader';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

function PollResults({ pollId, onBack }) {
    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${apiUrl}poll/${pollId}/results`, {
            headers: {
                'authorization': localStorage.getItem('jwt')
            }
        })
            .then(res => res.json())
            .then(data => {
                setPoll(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [pollId]);

    if (loading) return <WaterLoader />;
    if (!poll) return <p>Poll not found</p>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

    return (
        <div>
            <button className="btn btn-secondary mb-3" onClick={onBack}>&larr; Back to Polls</button>
            <h2 className="mb-2">{poll.title}</h2>
            <p className="text-muted mb-4">{poll.description}</p>

            {poll.questions.map((q, qIndex) => {
                const totalVotes = q.options.reduce((sum, opt) => sum + opt.votes.length, 0);
                
                // Prepare data for Chart
                const chartData = q.options.map(opt => ({
                    name: opt.text,
                    value: opt.votes.length
                })).filter(d => d.value > 0);

                return (
                    <div key={q.pollQuestionId} className="card mb-4 p-4 shadow-sm">
                        <h4 className="card-title">Q{qIndex + 1}: {q.text}</h4>
                        <div className="text-muted mb-3 small">Total Answers: {totalVotes}</div>

                        <div className="row">
                            <div className="col-md-6">
                                <h5 className="mb-3">Vote Breakdown</h5>
                                <ul className="list-group list-group-flush">
                                    {q.options.map((opt, oIndex) => {
                                        const percent = totalVotes > 0 ? ((opt.votes.length / totalVotes) * 100).toFixed(1) : 0;
                                        return (
                                            <li key={opt.pollOptionId} className="list-group-item">
                                                <div className="d-flex justify-content-between align-items-center cursor-pointer" 
                                                     data-bs-toggle="collapse" 
                                                     data-bs-target={`#collapse-users-${opt.pollOptionId}`}
                                                     style={{cursor: 'pointer'}}>
                                                    <span className="fw-bold">{opt.text}</span>
                                                    <span className="badge bg-primary rounded-pill">{opt.votes.length} ({percent}%)</span>
                                                </div>
                                                
                                                {/* Collapsible list of users */}
                                                <div className="collapse mt-2" id={`collapse-users-${opt.pollOptionId}`}>
                                                    <div className="card card-body bg-light py-2 px-3">
                                                        <small className="text-muted mb-1 d-block">Voters:</small>
                                                        {opt.votes.length > 0 ? (
                                                            <ul className="mb-0 ps-3 small">
                                                                {opt.votes.map(vote => (
                                                                    <li key={vote.voteId}>
                                                                        {vote.User ? `${vote.User.firstName} ${vote.User.lastName} (${vote.User.username})` : 'Unknown User'}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <em className="small text-muted">No votes yet</em>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                            <div className="col-md-6" style={{ minHeight: '300px' }}>
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center h-100 text-muted border rounded bg-light">
                                        No data to display
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default PollResults;
