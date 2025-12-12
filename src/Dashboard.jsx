import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WordCloud } from '@isoterik/react-word-cloud';
import { MessageSquare, User, Utensils } from 'lucide-react';
import { Button } from './components/ui/button'; // Import Button for DialogTrigger
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from './components/ui/dialog'; // Import Dialog components

const MEALS = ["Breakfast", "Lunch", "Snacks", "Dinner"];

export default function Dashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    mealSuggestions: {},
    opinionWords: [],
    mostActiveUser: null,
  });
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const response = await fetch('/submissions');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Dashboard: Data received from API:", data);
        setSubmissions(data);
        console.log("Dashboard: Submissions state after setSubmissions:", data);
        processSubmissions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, []);

  const processSubmissions = (data) => {
    const totalSubmissions = data.length;
    const mealSuggestions = {};
    const opinionWords = [];
    const userSubmissionCounts = {};

    MEALS.forEach(meal => {
      mealSuggestions[meal] = {};
    });

    data.forEach(submission => {
      if (submission.email) {
        userSubmissionCounts[submission.email] = (userSubmissionCounts[submission.email] || 0) + 1;
      }

      for (const day in submission.menu_feedback) {
        for (const meal in submission.menu_feedback[day]) {
          const suggestion = submission.menu_feedback[day][meal]?.suggestion;
          if (suggestion && MEALS.includes(meal)) {
            mealSuggestions[meal][suggestion] = (mealSuggestions[meal][suggestion] || 0) + 1;
          }
          const opinion = submission.menu_feedback[day][meal]?.opinion;
          if (opinion) {
            opinion.split(/\s+/).forEach(word => {
              if (word.length > 3) {
                opinionWords.push(word.toLowerCase());
              }
            });
          }
        }
      }
    });

    let mostActiveUser = null;
    let maxSubmissions = 0;
    for (const email in userSubmissionCounts) {
      if (userSubmissionCounts[email] > maxSubmissions) {
        maxSubmissions = userSubmissionCounts[email];
        const userSubmission = data.find(s => s.email === email);
        mostActiveUser = { email, count: maxSubmissions, name: userSubmission?.name || 'N/A' };
      }
    }

    for (const meal in mealSuggestions) {
      const sortedSuggestions = Object.entries(mealSuggestions[meal])
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([suggestion, count]) => ({ suggestion, count }));
      mealSuggestions[meal] = sortedSuggestions;
    }

    const wordFrequencies = opinionWords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    const wordCloudData = Object.entries(wordFrequencies)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50);

    setStats({ totalSubmissions, mealSuggestions, opinionWords: wordCloudData, mostActiveUser });
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-indigo-800 drop-shadow-sm">
            Menu Submissions Dashboard 📊
          </h1>
          <p className="text-indigo-600 text-lg">
            Overview of all menu suggestions from SVCE Boys Hostel.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Submissions</CardTitle>
              <MessageSquare className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-700">{stats.totalSubmissions}</div>
            </CardContent>
          </Card>
          {MEALS.map(meal => (
            <Card key={meal} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{meal} Suggestions</CardTitle>
                <Utensils className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                {stats.mealSuggestions[meal] && stats.mealSuggestions[meal].length > 0 ? (
                  <ul className="text-sm space-y-1">
                    {stats.mealSuggestions[meal].slice(0, 3).map((item, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span className="text-slate-700">{item.suggestion}</span>
                        <span className="text-xs font-semibold text-indigo-500">({item.count})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">No suggestions</p>
                )}
              </CardContent>
            </Card>
          ))}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Most Active User</CardTitle>
              <User className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              {stats.mostActiveUser ? (
                <div>
                  <div className="text-lg font-bold text-purple-700">{stats.mostActiveUser.name}</div>
                  <p className="text-xs text-slate-500">{stats.mostActiveUser.email}</p>
                  <p className="text-sm text-slate-600 mt-1">Submissions: <span className="font-semibold">{stats.mostActiveUser.count}</span></p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No submissions yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg text-slate-700">Top Breakfast Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.mealSuggestions.Breakfast?.slice(0, 5)} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="suggestion" angle={-30} textAnchor="end" height={60} interval={0} style={{ fontSize: '12px' }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Legend />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg text-slate-700">Top Lunch Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.mealSuggestions.Lunch?.slice(0, 5)} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="suggestion" angle={-30} textAnchor="end" height={60} interval={0} style={{ fontSize: '12px' }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Legend />
                  <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} /> {/* Green color */}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg text-slate-700">Top Snacks Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.mealSuggestions.Snacks?.slice(0, 5)} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="suggestion" angle={-30} textAnchor="end" height={60} interval={0} style={{ fontSize: '12px' }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Legend />
                  <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} /> {/* Orange color */}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg text-slate-700">Top Dinner Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.mealSuggestions.Dinner?.slice(0, 5)} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="suggestion" angle={-30} textAnchor="end" height={60} interval={0} style={{ fontSize: '12px' }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Legend />
                  <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} /> {/* Red color */}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg text-slate-700">Common Opinion Words</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: 300, width: '100%' }}>
                {stats.opinionWords.length > 0 ? (
                  <WordCloud 
                    data={stats.opinionWords} 
                    fontSizeMapper={word => Math.log2(word.value) * 5 + 16}
                    rotate={0}
                    padding={2}
                    fill="#4f46e5"
                  />
                ) : (
                  <p className="text-center text-gray-500">Not enough opinion data for a word cloud.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg text-slate-700">All Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <p className="text-center text-gray-500">No submissions yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-600">Name</TableHead>
                      <TableHead className="text-slate-600">Email</TableHead>
                      <TableHead className="text-slate-600">Room</TableHead>
                      <TableHead className="text-slate-600">Submitted On</TableHead>
                      <TableHead className="text-slate-600">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium text-slate-800">{submission.name}</TableCell>
                        <TableCell className="text-slate-700">{submission.email}</TableCell>
                        <TableCell className="text-slate-700">{submission.room}</TableCell>
                        <TableCell className="text-slate-700">{new Date(submission.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 text-indigo-600 hover:text-indigo-800">View Feedback</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[800px]">
                              <DialogHeader>
                                <DialogTitle>Feedback for {submission.name}</DialogTitle>
                                <DialogDescription>
                                  Detailed menu suggestions and opinions submitted on {new Date(submission.created_at).toLocaleString()}.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                                {Object.entries(submission.menu_feedback).map(([day, meals]) => (
                                  <div key={day} className="mb-2 border-b pb-2 last:border-b-0">
                                    <h4 className="font-bold text-md text-indigo-700 mb-1">{day}</h4>
                                    <ul className="list-disc list-inside ml-4 space-y-1">
                                      {Object.entries(meals).map(([meal, feedback]) => (
                                        <li key={meal}>
                                          <span className="font-semibold">{meal}:</span>
                                          {feedback.suggestion && (
                                            <p className="ml-4 text-slate-700">Suggestion: {feedback.suggestion}</p>
                                          )}
                                          {feedback.opinion && (
                                            <p className="ml-4 text-slate-700">Opinion: {feedback.opinion}</p>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
