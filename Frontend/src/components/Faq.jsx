import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { lawyerProfile } from "../siteConfig";

const faqs = [
  {
    question: "How do I book a consultation?",
    answer:
      "Click 'Book a Consultation' anywhere on the site, pick an available date and time slot, and confirm your appointment — you'll be meeting directly with " +
      lawyerProfile.name +
      ", not a rotating team.",
  },
  {
    question: "Can I chat with the AI Legal Assistant for free?",
    answer:
      "Yes, the AI Legal Assistant is available 24/7 to answer general legal queries and help you understand basic procedures — free of charge, before or after you book.",
  },
  {
    question: "What kind of legal issues can I discuss?",
    answer:
      "You can discuss criminal, civil, family, corporate, property, or tax matters. If your situation doesn't fit neatly into one category, that's fine too — bring it up during the consultation.",
  },
  {
    question: "Do I need to meet in person?",
    answer:
      "No. Consultations can be done over secure video call, or in person if you prefer — whichever is more convenient for you.",
  },
  {
    question: "Is my data and conversation secure?",
    answer:
      "Chatbot conversations are not end-to-end encrypted, but your data is encrypted in transit and at rest using industry-standard protections, and is never shared with third parties.",
  },
];

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq-section" className="py-16 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
          Questions Before You Reach Out?
        </h2>
        <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-6"></div>
        <p className="text-slate-500 text-lg">
          You're probably not the first person to wonder about this. Here are the
          things people usually ask before their first chat.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-slate-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
          >
            <button
              onClick={() => toggleFaq(index)}
              className="w-full flex justify-between items-center text-left px-6 py-5 focus:outline-none"
            >
              <span className="text-lg font-medium text-slate-800">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${
                  activeIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`px-6 overflow-hidden transition-all duration-500 ${
                activeIndex === index ? "max-h-40 pb-5" : "max-h-0"
              }`}
            >
              <p className="text-slate-600 text-base leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-slate-500">
          Still not sure?{" "}
          <Link
            to="/contact"
            className="text-primary font-semibold hover:underline"
          >
            Just ask — I'm happy to clarify
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Faq;
