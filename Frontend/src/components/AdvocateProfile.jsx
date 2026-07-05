import React from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Award, ShieldCheck, Clock, MessageCircle } from "lucide-react";
import useApp from "../context/useApp";
import Loader from "./common/Loader";
import { lawyerProfile, whatsappLink } from "../siteConfig";

const stats = [
  { icon: Award, label: lawyerProfile.experience, sub: "Experience" },
  { icon: ShieldCheck, label: "Verified", sub: "Bar Council Enrolled" },
  { icon: Clock, label: "< 24 hrs", sub: "Typical Response" },
];

const AdvocateProfile = () => {
  const navigate = useNavigate();
  const { lawyers } = useApp();

  if (!lawyers || lawyers.length === 0) {
    return <Loader minHeight="min-h-[400px]" />;
  }

  const lawyer = lawyers[0];

  return (
    <div className="max-w-6xl mx-auto my-20 px-4 sm:px-6 lg:px-0">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
          Meet Your Advocate
        </h2>
        <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-6"></div>
        <p className="text-gray-600 text-lg">
          You'll talk to {lawyer.name} directly, every time — no hand-offs, no
          rotating team, no starting your story over.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-8 md:gap-10 items-center bg-white border-2 border-gray-100 rounded-3xl p-6 md:p-10 shadow-sm shadow-primary/5">
        <div className="md:col-span-2">
          <img
            src={lawyer.image}
            alt={lawyer.name}
            className="w-full h-72 md:h-96 object-cover rounded-2xl"
            style={{ objectPosition: "center 25%" }}
          />
        </div>

        <div className="md:col-span-3 flex flex-col gap-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
              {lawyer.name}
            </h3>
            <p className="text-primary font-medium">{lawyer.speciality}</p>
          </div>

          <div className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>{lawyer.degree}</span>
          </div>

          <p className="text-gray-600 leading-relaxed">{lawyer.about}</p>

          <div className="flex flex-wrap gap-2 mt-1">
            {lawyerProfile.specialities.map((spec) => (
              <span
                key={spec}
                className="text-xs md:text-sm bg-primary/5 text-primary border border-primary/20 rounded-full px-3 py-1"
              >
                {spec}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
            {stats.map(({ icon: Icon, label, sub }) => (
              <div key={sub} className="text-center">
                <Icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="font-bold text-gray-900 text-sm md:text-base">
                  {label}
                </p>
                <p className="text-gray-500 text-xs">{sub}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-3.5 rounded-full font-semibold hover:bg-[#20bd5a] transition-all duration-300 hover:shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Chat First
            </a>
            <button
              onClick={() => {
                navigate(`/appointment/${lawyer._id}`);
                window.scrollTo(0, 0);
              }}
              className="bg-primary text-white px-6 py-3.5 rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 hover:shadow-lg"
            >
              Book a Consultation — ₹{lawyer.fees}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvocateProfile;
