import React from "react";
import { Link } from "react-router-dom";
import {
  Gavel,
  Heart,
  Home,
  Building2,
  FileWarning,
  Receipt,
  Search,
  ArrowRight,
} from "lucide-react";

const WHATSAPP_BASE = "https://wa.me/919472761482?text=";

const situations = [
  {
    icon: Gavel,
    color: "purple",
    title: "Facing a Criminal Charge or FIR?",
    description:
      "An FIR, arrest, or summons is frightening — especially the first time. I'll walk you through exactly what's happening, what your options are (bail, anticipatory bail, quashing), and what to expect at each stage.",
    wondering:
      '"Can I get anticipatory bail?" · "What happens after an FIR is filed?"',
    topic: "a criminal matter / FIR",
  },
  {
    icon: Heart,
    color: "rose",
    title: "Going Through a Divorce or Family Dispute?",
    description:
      "Divorce, custody, and maintenance cases are as much emotional as they are legal. I'll help you understand your rights and realistic outcomes, and handle the process with as little added stress as possible.",
    wondering:
      '"How is maintenance calculated?" · "Can we do a mutual consent divorce?"',
    topic: "a family / divorce matter",
  },
  {
    icon: Home,
    color: "amber",
    title: "Stuck in a Property or Land Dispute?",
    description:
      "Title disputes, illegal possession, partition among family, or a builder not delivering — property matters in India are notoriously slow. I'll help you understand where you actually stand before you spend years in court.",
    wondering:
      '"Is my property title clean?" · "Can I get an illegal occupant evicted?"',
    topic: "a property / land dispute",
  },
  {
    icon: Building2,
    color: "indigo",
    title: "Starting or Running a Business?",
    description:
      "Contracts, vendor disputes, compliance, and founder agreements — most business legal trouble is preventable with the right paperwork upfront, and fixable if you catch it early.",
    wondering:
      '"Do I need a formal partnership agreement?" · "Someone breached our contract — now what?"',
    topic: "a business / corporate matter",
  },
  {
    icon: FileWarning,
    color: "emerald",
    title: "In a Contract or Civil Dispute?",
    description:
      "Unpaid dues, a broken agreement, a consumer complaint, or a defamation issue — civil disputes usually have more options than people realise, from a legal notice to a full suit.",
    wondering:
      '"Is a legal notice enough, or do I need to sue?" · "How long will this actually take?"',
    topic: "a civil / contract dispute",
  },
  {
    icon: Receipt,
    color: "cyan",
    title: "Dealing with a Tax Notice or Dispute?",
    description:
      "A notice from the tax department is unsettling, but most are routine and resolvable. I'll help you understand what's actually being asked and respond correctly the first time.",
    wondering: '"Is this notice serious?" · "What\'s the deadline to respond?"',
    topic: "a tax notice / dispute",
  },
];

const colorClasses = {
  purple: { border: "hover:border-purple-300", iconBg: "bg-purple-50", icon: "text-purple-600" },
  rose: { border: "hover:border-rose-300", iconBg: "bg-rose-50", icon: "text-rose-600" },
  amber: { border: "hover:border-amber-300", iconBg: "bg-amber-50", icon: "text-amber-600" },
  indigo: { border: "hover:border-indigo-300", iconBg: "bg-indigo-50", icon: "text-indigo-600" },
  emerald: { border: "hover:border-emerald-300", iconBg: "bg-emerald-50", icon: "text-emerald-600" },
  cyan: { border: "hover:border-cyan-300", iconBg: "bg-cyan-50", icon: "text-cyan-600" },
};

const Situations = () => {
  const openWhatsApp = (topic) => {
    const msg = encodeURIComponent(
      `Hi Shivam, I'd like to talk about ${topic}.`,
    );
    window.open(`${WHATSAPP_BASE}${msg}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-gray-50 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Whatever Brought You Here, You're in the Right Place
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-6"></div>
          <p className="text-gray-600 text-lg">
            Every situation is different. Here's how I typically help people in
            yours.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {situations.map((s) => {
            const Icon = s.icon;
            const colors = colorClasses[s.color];
            return (
              <div
                key={s.title}
                className={`group flex flex-col bg-white border-2 border-gray-100 rounded-2xl p-6 transition-all duration-300 ${colors.border} hover:shadow-lg`}
              >
                <div
                  className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                  {s.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
                  {s.description}
                </p>
                <p className="text-xs text-gray-400 italic mb-4">
                  You might be wondering: {s.wondering}
                </p>
                <button
                  onClick={() => openWhatsApp(s.topic)}
                  className="flex items-center gap-1.5 text-primary font-semibold text-sm group-hover:gap-2.5 transition-all mt-auto cursor-pointer"
                >
                  Talk about this
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

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
              Search Bharatiya Nyaya Sanhita (BNS) sections, old IPC
              references, and key Constitutional articles — free, instant, no
              sign-up.
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

export default Situations;
