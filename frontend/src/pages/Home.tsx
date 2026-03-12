import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, BookOpen, FlaskConical, Star, BarChart2, CheckCircle2 } from "lucide-react";
import { listActivities, type Activity } from "@/lib/api";
import { ICON_MAP, DEFAULT_ICON } from "@/lib/utils";
import { getCompletedActivities } from "@/lib/progress";

const FEATURES = [
  {
    icon: Zap,
    iconBg: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
    badge: "Playground",
    badgeBg: "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
    title: "Free Exploration",
    description:
      "Experiment with any marketing prompt, try different AI roles, and adjust creativity to see what works best.",
    href: "/playground",
    linkColor: "text-violet-600 hover:text-violet-700 dark:text-violet-400",
  },
  {
    icon: BookOpen,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    badge: "Activities",
    badgeBg: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    title: "Guided Learning",
    description:
      "Follow structured exercises designed by marketing experts to master specific AI-powered marketing skills.",
    href: "/activities",
    linkColor: "text-blue-600 hover:text-blue-700 dark:text-blue-400",
  },
  {
    icon: FlaskConical,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badge: "Experiment Lab",
    badgeBg: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    title: "A/B Testing",
    description:
      "Compare two prompts side-by-side across different models to find the best approach for your campaigns.",
    href: "/compare",
    linkColor: "text-emerald-600 hover:text-emerald-700 dark:text-emerald-400",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Choose a mode",
    desc: "Start with the playground for free exploration or pick a guided activity.",
  },
  {
    step: "2",
    title: "Craft your prompt",
    desc: "Use the built-in role presets or write a custom system prompt to shape the AI's behaviour.",
  },
  {
    step: "3",
    title: "Iterate & compare",
    desc: "Adjust creativity, swap models, and use the Experiment Lab to find what delivers best results.",
  },
];

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    listActivities().then(setActivities).catch(console.error);
    setCompletedSlugs(getCompletedActivities());
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center space-y-5 py-10">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 px-3 py-1.5 rounded-full">
          <Star className="w-3 h-3 fill-violet-500" /> GenAI Marketing Lab
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight tracking-tight">
          Master AI-Powered Marketing
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Practice generative AI skills through free experimentation and expert-designed guided
          activities.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            to="/activities"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            Start Activities <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/playground"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition-all"
          >
            <Zap className="w-4 h-4 text-violet-500" /> Open Playground
          </Link>
        </div>
      </div>

      {/* 3 feature cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {FEATURES.map(
          ({ icon: Icon, iconBg, iconColor, badge, badgeBg, title, description, href, linkColor }) => (
            <div
              key={title}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 hover:shadow-md transition-all"
            >
              <div
                className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${badgeBg}`}>
                {badge}
              </span>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
              <Link
                to={href}
                className={`inline-flex items-center gap-1 text-xs font-semibold ${linkColor}`}
              >
                Get started <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )
        )}
      </div>

      {/* Activities grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Guided Activities</h2>
          <Link
            to="/activities"
            className="text-sm font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {activities.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Skill progress
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {completedSlugs.size}/{activities.length} completed
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${activities.length ? (completedSlugs.size / activities.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activities.slice(0, 8).map((activity) => (
            <Link
              key={activity.slug}
              to={`/activities/${activity.slug}`}
              className={`group bg-white dark:bg-slate-900 border rounded-2xl p-4 hover:shadow-md transition-all relative ${
                completedSlugs.has(activity.slug)
                  ? "border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700"
                  : "border-slate-200 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800"
              }`}
            >
              {completedSlugs.has(activity.slug) && (
                <CheckCircle2 className="absolute top-3 right-3 w-3.5 h-3.5 text-emerald-500" />
              )}
              <div className="text-2xl mb-2">
                {ICON_MAP[activity.icon as keyof typeof ICON_MAP] ?? DEFAULT_ICON}
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mt-2 leading-snug">
                {activity.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                {activity.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-bold text-white">How It Works</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">{step}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-violet-400 mb-1 tracking-wide">STEP {step}</p>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

