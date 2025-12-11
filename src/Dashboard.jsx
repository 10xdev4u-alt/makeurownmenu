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
    opinionWords: []
  });

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const response = await fetch('/submissions');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSubmissions(data);
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

    MEALS.forEach(meal => {
      mealSuggestions[meal] = {};
    });

    data.forEach(submission => {
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

    setStats({ totalSubmissions, mealSuggestions, opinionWords: wordCloudData });
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Menu Submissions Dashboard 📊
          </h1>
          <p className="text-slate-500">
            Overview of all menu suggestions from SVCE Boys Hostel.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            </CardContent>
          </Card>
          {MEALS.map(meal => (
            <Card key={meal}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{meal} Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.mealSuggestions[meal] && stats.mealSuggestions[meal].length > 0 ? (
                  <ul className="text-sm">
                    {stats.mealSuggestions[meal].slice(0, 3).map((item, index) => (
                      <li key={index}>{item.suggestion} ({item.count})</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">No suggestions</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Breakfast Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.mealSuggestions.Breakfast?.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="suggestion" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Common Opinion Words</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: 300, width: '100%' }}>
                {stats.opinionWords.length > 0 ? (
                  <WordCloud data={stats.opinionWords} />
                ) : (
                  <p className="text-center text-gray-500">Not enough opinion data for a word cloud.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <p className="text-center text-gray-500">No submissions yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Submitted On</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.name}</TableCell>
                        <TableCell>{submission.email}</TableCell>
                        <TableCell>{submission.room}</TableCell>
                        <TableCell>{new Date(submission.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <details className="cursor-pointer">
                            <summary>View Feedback</summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded-md text-xs overflow-x-auto">
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
