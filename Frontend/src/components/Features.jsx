import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, MessageCircle, MessageSquare, Video, ArrowRight } from 'lucide-react';
import { whatsappLink } from '../siteConfig';

export default function Features() {
  const navigate = useNavigate();

  const handleNavigation = (path, isExternal = false) => {
    if (isExternal) {
      window.open(path, '_blank');
    } else {
      navigate(path);
    }
  };

  const features = [
      {
        icon: MessageCircle,
        title: "Chat on WhatsApp",
        mobileTitle: "WhatsApp Chat",
        description: "The simplest way to reach out — message your question whenever it's on your mind, and get a personal reply, no forms or waiting rooms.",
        action: "Message on WhatsApp",
        color: "emerald",
        path: whatsappLink(),
        isExternal: true
      },
      {
        icon: MessageSquare,
        title: "AI Legal Assistant",
        mobileTitle: "AI Assistant",
        description: "Not ready to talk yet? Ask the free AI assistant first — a judgment-free way to understand your rights before your first conversation.",
        action: "Start Conversation",
        color: "violet",
        path: "/chatbot",
        isExternal: false
      },
      {
        icon: Video,
        title: "Learning Resources",
        mobileTitle: "Learning Resources",
        description: "Access easy to follow video guides, legal tutorials, and educational content to build your understanding of law and legal processes.",
        action: "Browse Resources",
        color: "amber",
        path: "/resources",
        isExternal: false
      },
      {
        icon: BookOpen,
        title: "Legal Blog & Insights",
        mobileTitle: "Legal Blog",
        description: "Access real legal stories, expert written articles, and community discussions to stay informed about legal trends and precedents.",
        action: "Explore Articles",
        color: "blue",
        path: "https://blogspace-alpha.vercel.app/",
        isExternal: true
      },
    ];

  const colorClasses = {
    blue: {
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      hoverBorder: "hover:border-blue-500/30",
      actionColor: "text-blue-500",
      shadow: "hover:shadow-blue-500/5"
    },
    emerald: {
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      hoverBorder: "hover:border-emerald-500/30",
      actionColor: "text-emerald-500",
      shadow: "hover:shadow-emerald-500/5"
    },
    violet: {
      gradient: "from-violet-500/10 via-violet-500/5 to-transparent",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-500",
      hoverBorder: "hover:border-violet-500/30",
      actionColor: "text-violet-500",
      shadow: "hover:shadow-violet-500/5"
    },
    amber: {
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      hoverBorder: "hover:border-amber-500/30",
      actionColor: "text-amber-500",
      shadow: "hover:shadow-amber-500/5"
    }
  };

  return (
    <div className="bg-white py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            However You'd Like to Start
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-6"></div>
          <p className="text-gray-600 text-lg">
            Everyone processes a legal worry differently. Pick whichever feels most comfortable.
          </p>
        </div>

        {/* Features Grid - 4 cards in one row on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorClasses[feature.color];
            
            return (
              <div
                key={index}
                onClick={() => handleNavigation(feature.path, feature.isExternal)}
                className={`group relative bg-white border-2 border-gray-100 rounded-lg p-6 transition-all duration-200 ease-in-out cursor-pointer overflow-hidden ${colors.hoverBorder} hover:shadow-xl ${colors.shadow} hover:scale-105 flex flex-col h-full`}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                
                {/* Content */}
                <div className="relative flex flex-col h-full">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-fit p-3 ${colors.iconBg} rounded-xl transition-transform duration-200 group-hover:scale-110 mb-4`}>
                    <Icon className={`w-6 h-6 ${colors.iconColor}`} />
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                      <span className="sm:hidden">{feature.mobileTitle || feature.title}</span>
                      <span className="hidden sm:inline">{feature.title}</span>
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 flex-1 text-justify">
                      {feature.description}
                    </p>
                    
                    {/* Action Link */}
                    <div className={`flex items-center ${colors.actionColor} font-semibold text-sm group/link mt-auto`}>
                      <span>{feature.action}</span>
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover/link:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
