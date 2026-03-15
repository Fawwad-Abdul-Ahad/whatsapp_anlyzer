"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { UploadCloud, MessageCircle, Users, Activity, Loader2 } from "lucide-react";

// Amazing Colors
const COLORS = ["#a855f7", "#3b82f6", "#ec4899", "#f43f5e", "#10b981", "#f59e0b"];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze chat");
      }

      const result = await response.json();
      
      // Process result for charts
      const timeData = result.time.map((t: string, i: number) => ({
        time: t,
        year: result.year[i],
        month: result.month[i],
        day: result.day[i],
        hour: result.hour[i],
        count: i, // Accumulated messages logic can go here if needed, but we'll use a simpler representation
      }));

      // Aggregate messages by hour
      const hourCounts: Record<number, number> = {};
      result.hour.forEach((h: number) => {
        hourCounts[h] = (hourCounts[h] || 0) + 1;
      });
      const hourlyData = Object.keys(hourCounts)
        .map((h) => ({ hour: `${h}:00`, messages: hourCounts[parseInt(h)] }))
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

      // User data for Pie/Bar
      const userData = Object.keys(result.users).map((user) => ({
        name: user,
        messages: result.users[user],
      })).slice(0, 10); // Top 10 users

      setData({
        total_messages: result.total_messages,
        users: userData,
        hourlyData: hourlyData,
        raw_users: result.users,
        total_users: Object.keys(result.users).length
      });

    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const glassPillStyle = "px-6 py-2 rounded-full glass border whitespace-nowrap border-white/20 hover:bg-white/10 transition-colors text-sm font-medium tracking-wide";

  return (
    <div className="min-h-screen bg-mesh text-white p-4 md:p-8 font-sans selection:bg-fuchsia-500/30">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-7xl mx-auto"
      >
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-purple-200 tracking-tight drop-shadow-sm">
                ChatLens 3D
              </h1>
              <p className="text-indigo-200/80 font-medium">WhatsApp Analyzer Pro</p>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
            <button className={glassPillStyle}>Dashboard</button>
            <button className={glassPillStyle}>Timeline</button>
            <button className={glassPillStyle}>Users</button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!data ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto mt-20"
            >
              <div
                className="glass-card p-12 text-center border-dashed border-2 border-indigo-400/30 hover:border-indigo-400/60 transition-all duration-500 cursor-pointer group"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setFile(e.target.files[0]);
                    }
                  }}
                />
                
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:from-indigo-500/40 group-hover:to-purple-500/40 border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.2)] group-hover:shadow-[0_0_50px_rgba(168,85,247,0.4)] transition-all duration-500"
                >
                  <UploadCloud className="w-12 h-12 text-indigo-300" />
                </motion.div>
                
                <h2 className="text-2xl font-bold mb-4 text-white drop-shadow-md">
                  {file ? file.name : "Drop WhatsApp Chat File"}
                </h2>
                <p className="text-indigo-200/70 mb-8 max-w-sm mx-auto text-lg">
                  Export chat without media to .txt and drop here to unlock deep 3D insights.
                </p>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnalyze();
                  }}
                  disabled={!file || loading}
                  className="relative px-8 py-4 rounded-full font-bold text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                    </span>
                  ) : (
                    "Initialize Analysis"
                  )}
                  {/* Subtle shine effect */}
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                </button>

                {error && <p className="text-red-400 mt-6 font-medium bg-red-500/10 py-3 rounded-lg border border-red-500/20 text-sm">{error}</p>}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, staggerChildren: 0.2 }}
              className="space-y-8"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Total Messages", value: data.total_messages.toLocaleString(), icon: MessageCircle, color: "from-blue-500 to-cyan-400" },
                  { label: "Active Participants", value: data.total_users, icon: Users, color: "from-purple-500 to-pink-500" },
                  { label: "Peak Activity Hour", value: data.hourlyData.reduce((prev:any, current:any) => (prev.messages > current.messages) ? prev : current).hour, icon: Activity, color: "from-emerald-400 to-teal-500" },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 + 0.5, type: "spring" }}
                    className="glass-card glass-card-hover p-8 relative overflow-hidden group"
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-20 rounded-bl-full -mr-10 -mt-10 blur-2xl group-hover:opacity-40 transition-opacity duration-500`} />
                    <div className="relative z-10 flex flex-col gap-4">
                      <div className={`p-4 rounded-xl inline-block bg-gradient-to-br ${stat.color} w-max bg-opacity-10 backdrop-blur-md border border-white/20 shadow-lg`}>
                        <stat.icon className="w-8 h-8 text-white drop-shadow-lg" />
                      </div>
                      <div>
                        <p className="text-indigo-200/80 font-medium tracking-wide uppercase text-xs mb-1">{stat.label}</p>
                        <h3 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 drop-shadow-sm">{stat.value}</h3>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hourly Activity Chart */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="glass-card p-6 md:p-8"
                >
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
                    Activity Rhythm
                  </h3>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.hourlyData}>
                        <defs>
                          <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                          dataKey="hour" 
                          stroke="rgba(255,255,255,0.3)" 
                          tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="rgba(255,255,255,0.3)" 
                          tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} 
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            color: '#fff'
                          }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="messages" 
                          stroke="url(#colorMessages)" 
                          strokeWidth={4}
                          dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                          activeDot={{ r: 8, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }}
                          animationDuration={2000}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Top Users Bar Chart */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="glass-card p-6 md:p-8"
                >
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]"></span>
                    Top Contributors
                  </h3>
                  <div className="h-80 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.users} layout="vertical" margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          stroke="rgba(255,255,255,0.6)" 
                          width={100}
                          tick={{fill: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500}} 
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          cursor={{fill: 'rgba(255,255,255,0.05)'}}
                          contentStyle={{ 
                            backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff'
                          }}
                        />
                        <Bar 
                          dataKey="messages" 
                          radius={[0, 6, 6, 0]}
                          barSize={20}
                          animationDuration={2000}
                        >
                          {data.users.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

              {/* Bottom Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="flex justify-center mt-12"
              >
                <button
                  onClick={() => {
                    setData(null);
                    setFile(null);
                  }}
                  className="px-6 py-3 rounded-xl glass border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" /> Start New Analysis
                </button>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

