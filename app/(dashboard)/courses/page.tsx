"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const categories = ["All", "Tech", "Data Science", "Design", "Business", "Language", "Finance"];
const levels = ["All", "Beginner", "Intermediate", "Advanced"];

const courses = [
  { id:"c1", emoji:"🐍", title:"Python for Data Science — Zero to Hero",    instructor:"Dr. Amit Kumar",  org:"IIT Bombay",       duration:"8 weeks",  level:"Beginner",      price:0,    enrolled:42000, rating:4.9, reviews:5800, category:"Data Science", gradient:"from-blue-500 to-cyan-600",     badge:"🔥 Top Rated" },
  { id:"c2", emoji:"⚛️", title:"React & Next.js — Build Production Apps",   instructor:"Rohan Mehta",   org:"TechMentor",       duration:"6 weeks",  level:"Intermediate",  price:2999, enrolled:18000, rating:4.8, reviews:2300, category:"Tech",         gradient:"from-violet-500 to-blue-600",  badge:"Bestseller" },
  { id:"c3", emoji:"📊", title:"Data Analytics with Excel & SQL",           instructor:"Sanya Gupta",   org:"DataFirst",        duration:"4 weeks",  level:"Beginner",      price:999,  enrolled:28000, rating:4.7, reviews:3400, category:"Data Science", gradient:"from-emerald-500 to-teal-600", badge:"" },
  { id:"c4", emoji:"🎨", title:"Complete Graphic Design Bootcamp",          instructor:"Neha Joshi",    org:"Designo Labs",     duration:"5 weeks",  level:"Beginner",      price:1499, enrolled:12000, rating:4.8, reviews:1900, category:"Design",       gradient:"from-pink-500 to-rose-600",   badge:"New" },
  { id:"c5", emoji:"💹", title:"Stock Market & Investing Fundamentals",     instructor:"CA Mohit Gupta",org:"FinLearn India",   duration:"3 weeks",  level:"Beginner",      price:0,    enrolled:55000, rating:4.9, reviews:7200, category:"Finance",      gradient:"from-amber-500 to-orange-500",badge:"🔥 Top Rated" },
  { id:"c6", emoji:"🤖", title:"Machine Learning A–Z with Python",          instructor:"Dr. Priya Nair",org:"IIT Madras Online",duration:"12 weeks", level:"Intermediate",  price:4999, enrolled:9800,  rating:4.9, reviews:1400, category:"Tech",         gradient:"from-indigo-500 to-purple-600",badge:"Premium" },
  { id:"c7", emoji:"💼", title:"MBA Essentials — Business Strategy",        instructor:"Arjun Kapoor",  org:"ISB Online",       duration:"8 weeks",  level:"Advanced",      price:8999, enrolled:4200,  rating:4.8, reviews:680,  category:"Business",     gradient:"from-slate-600 to-slate-800", badge:"" },
  { id:"c8", emoji:"🗣️", title:"Spoken English — Fluency in 30 Days",     instructor:"Vikram Nair",   org:"EnglishPro",       duration:"4 weeks",  level:"Beginner",      price:0,    enrolled:82000, rating:4.6, reviews:9100, category:"Language",     gradient:"from-cyan-500 to-blue-500",   badge:"Free" },
];

export default function CoursesPage() {
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel]       = useState("All");

  const filtered = courses.filter((c) => {
    const matchCat    = category === "All" || c.category === category;
    const matchLevel  = level    === "All" || c.level === level;
    const matchSearch = !search  || c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchLevel && matchSearch;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Courses & Programs</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-0.5">Learn at your own pace from top educators</p>
        </div>
        <span className="text-sm text-[var(--muted-foreground)]"><strong className="text-[var(--foreground)]">{filtered.length}</strong> courses</span>
      </div>

      <Input type="search" placeholder="Search courses, instructors…" value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
      />

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0 transition-all ${category === c ? "gradient-brand text-white shadow-sm" : "bg-[var(--card)] border border-[var(--border)] hover:border-brand-400"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="flex gap-1 flex-wrap">
        <span className="text-xs text-[var(--muted-foreground)] self-center mr-1">Level:</span>
        {levels.map((l) => (
          <button key={l} onClick={() => setLevel(l)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${level === l ? "bg-slate-900 text-white" : "bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--muted)]"}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((course, i) => (
          <div key={course.id} style={{ animationDelay:`${i * 60}ms` }}
            className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-card hover-lift overflow-hidden flex flex-col animate-slide-up">

            <div className={`h-28 bg-gradient-to-br ${course.gradient} relative flex items-center justify-center`}>
              <span className="text-5xl group-hover:scale-110 transition-transform">{course.emoji}</span>
              {course.badge && (
                <span className="absolute top-3 left-3 text-[10px] font-bold bg-white/90 text-slate-800 px-2 py-0.5 rounded-full">{course.badge}</span>
              )}
              <span className="absolute top-3 right-3 text-xs font-bold text-white bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                {course.price === 0 ? "Free" : `₹${course.price.toLocaleString("en-IN")}`}
              </span>
            </div>

            <div className="flex flex-col flex-1 p-4">
              <h3 className="font-semibold text-sm text-[var(--foreground)] line-clamp-2 mb-1 group-hover:text-[var(--primary)] transition-colors">{course.title}</h3>
              <p className="text-xs text-[var(--muted-foreground)] mb-1">by {course.instructor}</p>
              <p className="text-xs text-[var(--muted-foreground)] mb-3">{course.org} · {course.duration}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                <Badge variant="outline" size="sm">{course.level}</Badge>
              </div>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-1">
                  <span className="text-amber-500">★</span>
                  <span className="text-xs font-bold">{course.rating}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">({course.reviews.toLocaleString()})</span>
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">{course.enrolled.toLocaleString()} enrolled</span>
              </div>

              <Button variant="gradient" size="sm" className="w-full mt-3">
                {course.price === 0 ? "Enroll Free →" : "Enroll Now →"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
