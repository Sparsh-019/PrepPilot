import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

/**
 * Renders a horizontal bar chart of solved DSA problems grouped by topic.
 * Accepts a plain object like { Arrays: 12, Graphs: 4, ... }.
 */
export default function ProgressChart({ topicBreakdown = {} }) {
  const data = Object.entries(topicBreakdown)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  if (data.length === 0) {
    return (
      <div className="text-sm text-slate-400 text-center py-8">
        No problems logged yet — start solving to see your topic breakdown here.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="topic" width={110} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#4f46e5" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
