import { Link } from "react-router-dom";
import { Sparkles, Clock, ArrowRight } from "lucide-react";

export default function Subscription() {
  // Use Formspree API key/endpoint from environment, or fallback placeholder
  const formspreeEndpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT || "https://formspree.io/f/YOUR_FORM_ID";

  return (
    <div className="min-h-screen bg-[#0d0f1a] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-900/20 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/40 mx-auto mb-6">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Your Free Trial Has Expired</h1>
          <p className="text-slate-400 text-base max-w-md mx-auto">
            We hope you enjoyed your 10-minute preview of the GenAI Marketing Lab. To continue using the platform, please request subscription access below.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center gap-2 text-violet-300 font-medium mb-6">
            <Sparkles className="w-5 h-5" />
            <span>Subscription Interest Form</span>
          </div>
          
          <form action={formspreeEndpoint} method="POST" className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="John Doe"
                className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="john@example.com"
                className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                placeholder="+1 (555) 000-0000"
                className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-violet-900/40"
              >
                Submit Request <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 text-center mt-4">
              By submitting this form, you will be notified about subscription plans and pricing.
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-8">
          <Link to="/" className="hover:text-slate-400 transition-colors">← Return to Home</Link>
        </p>
      </div>
    </div>
  );
}
