import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WordCloud } from '@isoterik/react-word-cloud';

const MEALS = ["Breakfast", "Lunch", "Snacks", "Dinner"];

export default function Dashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    mealSuggestions: {},
    opinionWords: [],
    mostActiveUser: null, // New state for most active user
  });

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const response = await fetch('/submissions');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Dashboard: Data received from API:", data); // Log received data
        setSubmissions(data);
        console.log("Dashboard: Submissions state after setSubmissions:", data); // Log state after update
        processSubmissions(data); // Process data for stats
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
    const userSubmissionCounts = {}; // To track submissions per user

    MEALS.forEach(meal => {
      mealSuggestions[meal] = {};
    });

    data.forEach(submission => {
      // Count submissions per user
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
              if (word.length > 3) { // Filter out short words
                opinionWords.push(word.toLowerCase());
              }
            });
          }
        }
      }
    });

    // Determine most active user
    let mostActiveUser = null;
    let maxSubmissions = 0;
    for (const email in userSubmissionCounts) {
      if (userSubmissionCounts[email] > maxSubmissions) {
        maxSubmissions = userSubmissionCounts[email];
        // Find the name associated with this email from the first submission
        const userSubmission = data.find(s => s.email === email);
        mostActiveUser = { email, count: maxSubmissions, name: userSubmission?.name || 'N/A' };
      }
    }

    // Sort suggestions by count for each meal
    for (const meal in mealSuggestions) {
      const sortedSuggestions = Object.entries(mealSuggestions[meal])
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([suggestion, count]) => ({ suggestion, count }));
      mealSuggestions[meal] = sortedSuggestions;
    }

    // Process opinion words for word cloud
    const wordFrequencies = opinionWords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    const wordCloudData = Object.entries(wordFrequencies)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50); // Take top 50 words

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <CardTitle className="text-lg text-slate-700">Common Opinion Words</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: 300, width: '100%' }}>
                {stats.opinionWords.length > 0 ? (
                  <WordCloud 
                    data={stats.opinionWords} 
                    fontSizeMapper={word => Math.log2(word.value) * 5 + 16} // Custom font size mapping
                    rotate={0} // No rotation for better readability
                    padding={2}
                    fill="#4f46e5" // Tailwind indigo-600
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
                          <details className="cursor-pointer text-indigo-600 hover:text-indigo-800">
                            <summary>View Feedback</summary>
                            <pre className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-md text-xs overflow-x-auto text-slate-700">
                              {JSON.stringify(submission.menu_feedback, null, 2)}
                            </pre>
                          </details>
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
