import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Gavel,
  Heart,
  Home as HomeIcon,
  Building2,
  FileWarning,
  Receipt,
  ArrowRight,
  Search,
} from "lucide-react";
import useApp from "../context/useApp";

const situations = [
  {
    icon: Gavel,
    color: "purple",
    headline: "Facing a Criminal Charge or FIR?",
    body: "An FIR, arrest, or summons is frightening — especially the first time. I'll walk you through exactly what's happening, what your options are (bail, anticipatory bail, quashing), and what to expect at each stage.",
    wondering: "\"Can I get anticipatory bail?\" · \"What happens after an FIR is filed?\"",
  },
  {
    icon: Heart,
    color: "rose",
    headline: "Going Through a Divorce or Family Dispute?",
    body: "Divorce, custody, and maintenance cases are as much emotional as they are legal. I'll help you understand your rights and realistic outcomes, and handle the process with as little added stress as possible.",
    wondering: "\"How is maintenance calculated?\" · \"Can we do a mutual consent divorce?\"",
  },
  {
    icon: HomeIcon,
    color: "amber",
    headline: "Stuck in a Property or Land Dispute?",
    body: "Title disputes, illegal possession, partition among family, or a builder not delivering — property matters in India are notoriously slow. I'll help you understand where you actually stand before you spend years in court.",
    wondering: "\"Is my property title clean?\" · \"Can I get an illegal occupant evicted?\"",
  },
  {
    icon: Building2,
    color: "indigo",
    headline: "Starting or Running a Business?",
    body: "Contracts, vendor disputes, compliance, and founder agreements — most business legal trouble is preventable with the right paperwork upfront, and fixable if you catch it early.",
    wondering: "\"Do I need a formal partnership agreement?\" · \"Someone breached our contract — now what?\"",
  },
  {
    icon: FileWarning,
    color: "emerald",
    headline: "In a Contract or Civil Dispute?",
    body: "Unpaid dues, a broken agreement, a consumer complaint, or a defamation issue — civil disputes usually have more options than people realise, from a legal notice to a full suit.",
    wondering: "\"Is a legal notice enough, or do I need to sue?\" · \"How long will this actually take?\"",
  },
  {
    icon: Receipt,
    color: "cyan",
    headline: "Dealing with a Tax Notice or Dispute?",
    body: "A notice from the tax department is unsettling, but most are routine and resolvable. I'll help you understand what's actually being asked and respond correctly the first time.",
    wondering: "\"Is this notice serious?\" · \"What's the deadline to respond?\"",
  },
];

const colorClasses = {
  purple: { bg: "bg-purple-50", icon: "text-purple-600", ring: "hover:border-purple-300" },
  rose: { bg: "bg-rose-50", icon: "text-rose-600", ring: "hover:border-rose-300" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", ring: "hover:border-amber-300" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", ring: "hover:border-indigo-300" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", ring: "hover:border-emerald-300" },
  cyan: { bg: "bg-cyan-50", icon: "text-cyan-600", ring: "hover:border-cyan-300" },
};

const WaysICanHelp = () => {
  const navigate = useNavigate();
  const { lawyers } = useApp();
  const bookingPath = lawyers?.[0]?._id ? `/appointment/${lawyers[0]._id}` : "/lawyers";

  return (
    <div className="bg-gray-50 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Whatever Brought You Here, You're in the Right Place
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-6"></div>
          <p className="text-gray-600 text-lg">
            Every situation is different. Here's how I typically help people in yours.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {situations.map((s) => {
            const Icon = s.icon;
            const c = colorClasses[s.color];
            return (
              <div
                key={s.headline}
                className={`group flex flex-col bg-white border-2 border-gray-100 rounded-2xl p-6 transition-all duration-300 ${c.ring} hover:shadow-lg`}
              >
                <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${c.icon}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                  {s.headline}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
                  {s.body}
                </p>
                <p className="text-xs text-gray-400 italic mb-4">
                  You might be wondering: {s.wondering}
                </p>
                <button
                  onClick={() => {
                    navigate(bookingPath);
                    window.scrollTo(0, 0);
                  }}
                  className="flex items-center gap-1.5 text-primary font-semibold text-sm group-hover:gap-2.5 transition-all mt-auto"
                >
                  Talk about this
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Law Search promo */}
        <Link
          to="/resources?tab=law"
          className="group mt-10 flex flex-col sm:flex-row items-center gap-5 bg-gradient-to-r from-primary/10 via-fuchsia-500/10 to-pink-500/10 border-2 border-primary/20 rounded-2xl p-6 sm:p-8 hover:border-primary/40 transition-all duration-300"
        >
          <div className="w-14 h-14 shrink-0 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Search className="w-7 h-7 text-white" />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Already know the section? Look it up yourself.
            </h3>
            <p className="text-gray-600 text-sm">
              Search Bharatiya Nyaya Sanhita (BNS) sections, old IPC references, and key
              Constitutional articles — free, instant, no sign-up.
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-primary font-semibold text-sm whitespace-nowrap group-hover:gap-2.5 transition-all">
            Search Now
            <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
    </div>
  );
};

export default WaysICanHelp;
