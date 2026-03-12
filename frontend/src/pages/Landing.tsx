import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Mail,
  Share2,
  Brain,
  BarChart3,
  Lightbulb,
  CheckCircle2,
  Users,
  Layers,
  FlaskConical,
} from "lucide-react";

// ─────────────────────────────────────────────
// Navbar
// ─────────────────────────────────────────────
function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0d0f1a]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm leading-tight">
            Marketing AI<br />
            <span className="text-violet-400 font-semibold text-xs tracking-wide">Playground</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-slate-300 hover:text-white transition-colors">Features</a>
          <a href="#purpose" className="text-sm text-slate-300 hover:text-white transition-colors">Why GenAI</a>
          <Link to="/dashboard" className="text-sm text-slate-300 hover:text-white transition-colors">Dashboard</Link>
        </nav>

        {/* CTA */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-lg shadow-violet-900/40"
        >
          Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0d0f1a]">
      {/* Gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-900/40 blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-indigo-900/30 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-violet-950/50 blur-[80px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-24 pb-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-violet-950/80 border border-violet-700/50 text-violet-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          Generative AI for Modern Marketers
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
          Practice AI Marketing<br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            with Real Campaigns
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          The hands-on playground where marketers experiment with Generative AI for
          campaign creation, ad copy, email marketing, and social media — guided by
          expert prompts and real workflows.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#features"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all"
          >
            Explore Features
          </a>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-lg shadow-violet-900/40 transition-all"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Floating labels */}
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          {["Ad Copywriting", "Email Campaigns", "Social Media", "Prompt Engineering", "Brand Voice", "A/B Testing"].map((tag) => (
            <span
              key={tag}
              className="text-xs text-slate-400 border border-slate-700 bg-slate-800/60 px-3 py-1.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Stats
// ─────────────────────────────────────────────
const STATS = [
  { icon: Layers,     value: "100+",  label: "Marketing Workflows" },
  { icon: FlaskConical, value: "20+", label: "AI Playgrounds"      },
  { icon: Users,      value: "1k+",   label: "Active Users"        },
];

function Stats() {
  return (
    <section className="bg-[#0d0f1a] border-y border-white/5">
      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
        {STATS.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex flex-col items-center py-8 sm:py-4 gap-2">
            <Icon className="w-5 h-5 text-violet-400 mb-1" />
            <span className="text-4xl font-extrabold text-white tracking-tight">{value}</span>
            <span className="text-sm text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Features
// ─────────────────────────────────────────────
const FEATURES = [
  {
    icon: Zap,
    color: "text-violet-400",
    bg: "bg-violet-950/60",
    border: "border-violet-800/40",
    title: "AI Ad Copy Generator",
    description:
      "Craft high-converting ad headlines, descriptions, and CTAs for Google, Meta, and LinkedIn — with role-based prompts.",
    href: "/activities/ad-copy-workshop",
  },
  {
    icon: Mail,
    color: "text-blue-400",
    bg: "bg-blue-950/60",
    border: "border-blue-800/40",
    title: "Email Campaign Builder",
    description:
      "Generate subject lines, preview text, and complete email body copy optimized for opens and clicks.",
    href: "/activities/email-campaign-builder",
  },
  {
    icon: Share2,
    color: "text-emerald-400",
    bg: "bg-emerald-950/60",
    border: "border-emerald-800/40",
    title: "Social Media Generator",
    description:
      "Platform-specific posts for Instagram, LinkedIn, Twitter/X, and TikTok with the right tone and hashtags.",
    href: "/activities/social-media-generator",
  },
  {
    icon: Brain,
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-950/60",
    border: "border-fuchsia-800/40",
    title: "Marketing Strategy AI",
    description:
      "Get strategic marketing insights, campaign frameworks, and positioning advice from an AI strategist.",
    href: "/activities/brand-voice-lab",
  },
  {
    icon: Lightbulb,
    color: "text-amber-400",
    bg: "bg-amber-950/60",
    border: "border-amber-800/40",
    title: "Prompt Engineering Practice",
    description:
      "Use the A/B tester to compare prompts side-by-side and develop intuition for what works in marketing.",
    href: "/compare",
  },
  {
    icon: BarChart3,
    color: "text-cyan-400",
    bg: "bg-cyan-950/60",
    border: "border-cyan-800/40",
    title: "SEO Content Optimizer",
    description:
      "Optimize blog posts, landing pages, and meta descriptions with AI-driven keyword integration.",
    href: "/activities/seo-content-optimizer",
  },
];

function Features() {
  return (
    <section id="features" className="bg-[#0f1120] py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">
            What's Inside
          </span>
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Every Marketing AI Workflow,<br />One Playground
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
            Structured activities and a free-form playground covering every major
            marketing use case for Generative AI.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, color, bg, border, title, description, href }) => (
            <div
              key={title}
              className="group relative bg-[#141626] border border-white/5 rounded-2xl p-6 flex flex-col gap-4 hover:border-violet-700/50 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`w-10 h-10 ${bg} border ${border} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1.5">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
              <Link
                to={href}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors group-hover:gap-2.5"
              >
                Try Playground <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Purpose / Why GenAI
// ─────────────────────────────────────────────
const REASONS = [
  {
    title: "Automate Campaign Creation",
    description:
      "Generate complete campaign briefs, copy variations, and content calendars in minutes instead of days.",
  },
  {
    title: "Faster Content at Scale",
    description:
      "Produce dozens of ad variations, email sequences, and social posts without sacrificing quality or brand voice.",
  },
  {
    title: "Data-Driven Decisions",
    description:
      "Use prompt A/B testing to measure which messaging resonates — before spending a dollar on ads.",
  },
  {
    title: "Master Prompt Engineering",
    description:
      "Learn which prompts produce the best results for your industry, brand, and specific marketing objectives.",
  },
];

function Purpose() {
  return (
    <section id="purpose" className="bg-[#0d0f1a] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left text */}
          <div>
            <span className="inline-block text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">
              Why It Matters
            </span>
            <h2 className="text-4xl font-extrabold text-white mb-5 leading-tight">
              GenAI is Reshaping Marketing.<br />
              <span className="text-slate-400">Are You Ready?</span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              Generative AI is already being used by leading marketing teams to move
              faster, test more, and create better content. This playground lets you
              build those skills safely — with structured guidance and real workflows.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-900/40"
            >
              Start Practising Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {REASONS.map(({ title, description }) => (
              <div
                key={title}
                className="bg-[#141626] border border-white/5 rounded-2xl p-5 hover:border-violet-800/40 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-violet-500 mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// CTA Banner
// ─────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="bg-[#0f1120] py-20">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-950/80 border border-violet-700/40 text-violet-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Free to use · No credit card required
        </div>
        <h2 className="text-4xl font-extrabold text-white mb-5">
          Ready to Supercharge Your<br />Marketing with AI?
        </h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Jump into any activity, open the free playground, or compare prompts
          side-by-side in the Experiment Lab. Everything is free to try.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/activities"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all"
          >
            Browse Activities
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-lg shadow-violet-900/40 transition-all"
          >
            Open Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#0d0f1a] border-t border-white/5 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-400">Marketing AI Playground</span>
        </div>
        <p className="text-xs text-slate-600">© 2026 Marketing AI Playground. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0d0f1a]">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Purpose />
      <CTABanner />
      <Footer />
    </div>
  );
}
