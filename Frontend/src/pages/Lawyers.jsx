import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useApp from "../context/useApp";
import Loader from "../components/common/Loader";
import {
  Search,
  Filter,
  X,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
} from "lucide-react";

const Lawyers = () => {
  const { speciality } = useParams();
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpeciality, setSelectedSpeciality] = useState(
    speciality || "",
  );
  const [selectedCity, setSelectedCity] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const navigate = useNavigate();
  const { lawyers } = useApp();

  // Specialities list
  const specialities = [
    "Criminal Lawyer",
    "Family & Divorce Lawyer",
    "Corporate Lawyer",
    "Civil Litigation Lawyer",
    "Intellectual Property Lawyer",
    "Tax Lawyer",
  ];

  // Extract unique cities from lawyers data
  const cities = [
    ...new Set(lawyers.map((lawyer) => lawyer.address?.City).filter(Boolean)),
  ];

  // Experience ranges
  const experienceRanges = [
    { label: "0-2 Years", min: 0, max: 2 },
    { label: "3-5 Years", min: 3, max: 5 },
    { label: "6-10 Years", min: 6, max: 10 },
    { label: "10+ Years", min: 10, max: 100 },
  ];

  const applyFilters = () => {
    let filtered = lawyers.filter((lawyer) => lawyer.available);

    // Speciality filter
    if (selectedSpeciality) {
      filtered = filtered.filter(
        (lawyer) => lawyer.speciality === selectedSpeciality,
      );
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(
        (lawyer) => lawyer.address?.City === selectedCity,
      );
    }

    // Experience filter
    if (experienceFilter) {
      const range = experienceRanges.find((r) => r.label === experienceFilter);
      if (range) {
        filtered = filtered.filter((lawyer) => {
          const exp = parseInt(lawyer.experience);
          return exp >= range.min && exp <= range.max;
        });
      }
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (lawyer) =>
          lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lawyer.speciality.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lawyer.address?.City?.toLowerCase().includes(
            searchQuery.toLowerCase(),
          ),
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "experience":
          return parseInt(b.experience) - parseInt(a.experience);
        case "fees-low":
          return a.fees - b.fees;
        case "fees-high":
          return b.fees - a.fees;
        default:
          return 0;
      }
    });

    setFilteredLawyers(filtered);
  };

  useEffect(() => {
    setSelectedSpeciality(speciality || "");
  }, [speciality]);

  useEffect(() => {
    applyFilters();
  }, [
    lawyers,
    selectedSpeciality,
    selectedCity,
    experienceFilter,
    searchQuery,
    sortBy,
  ]);

  const clearFilters = () => {
    setSelectedSpeciality("");
    setSelectedCity("");
    setExperienceFilter("");
    setSearchQuery("");
    setSortBy("name");
    navigate("/lawyers");
  };

  const activeFiltersCount = [
    selectedSpeciality,
    selectedCity,
    experienceFilter,
  ].filter(Boolean).length;

  if (!lawyers || lawyers.length === 0) {
    return <Loader minHeight="min-h-screen" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Header */}
      <div className="text-center py-8 md:py-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Find a Lawyer
        </h1>
        <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-4" />
        <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto mb-4">
          Browse our network of verified legal professionals and find the right
          specialist for your situation.
        </p>
        <div className="inline-block bg-blue-50 text-blue-700 text-xs md:text-sm px-4 py-2 rounded-lg border border-blue-100 mx-auto text-left max-w-xl">
          <span className="font-semibold">Booking Policy:</span> You can book a
          maximum of 2 appointments per day, and up to 3 appointments within a
          5-day period.
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, speciality, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>
      </div>

      {/* Filter Toggle Button (Mobile) */}
      <div className="flex items-center justify-between mb-6 lg:hidden">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-white text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="name">Sort by Name</option>
          <option value="experience">Most Experienced</option>
          <option value="fees-low">Fees: Low to High</option>
          <option value="fees-high">Fees: High to Low</option>
        </select>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div
          className={`${
            showFilter ? "block" : "hidden"
          } lg:block w-full lg:w-72 flex-shrink-0`}
        >
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>

            {/* Speciality Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Speciality
              </h4>
              <div className="space-y-2">
                {specialities.map((spec) => (
                  <label
                    key={spec}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="speciality"
                      checked={selectedSpeciality === spec}
                      onChange={() => {
                        setSelectedSpeciality(spec);
                        navigate(`/lawyers/${spec}`);
                      }}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">
                      {spec}
                    </span>
                  </label>
                ))}
                {selectedSpeciality && (
                  <button
                    onClick={() => {
                      setSelectedSpeciality("");
                      navigate("/lawyers");
                    }}
                    className="text-sm text-primary hover:text-primary/80 font-medium mt-2"
                  >
                    Show All
                  </button>
                )}
              </div>
            </div>

            {/* City Filter */}
            {cities.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  City
                </h4>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Experience Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Experience
              </h4>
              <div className="space-y-2">
                {experienceRanges.map((range) => (
                  <label
                    key={range.label}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="experience"
                      checked={experienceFilter === range.label}
                      onChange={() => setExperienceFilter(range.label)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">
                      {range.label}
                    </span>
                  </label>
                ))}
                {experienceFilter && (
                  <button
                    onClick={() => setExperienceFilter("")}
                    className="text-sm text-primary hover:text-primary/80 font-medium mt-2"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Sort By (Desktop) */}
            <div className="hidden lg:block">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Sort By
              </h4>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              >
                <option value="name">Name (A-Z)</option>
                <option value="experience">Most Experienced</option>
                <option value="fees-low">Fees: Low to High</option>
                <option value="fees-high">Fees: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lawyers Grid */}
        <div className="flex-1">
          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600 text-sm">
              Showing{" "}
              <span className="font-semibold">{filteredLawyers.length}</span>{" "}
              {filteredLawyers.length === 1 ? "lawyer" : "lawyers"}
              {selectedSpeciality && (
                <span>
                  {" "}
                  in <span className="font-semibold">{selectedSpeciality}</span>
                </span>
              )}
            </p>
          </div>

          {filteredLawyers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No lawyers found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search criteria
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLawyers.map((lawyer) => (
                <div
                  key={lawyer._id}
                  onClick={() => {
                    navigate(`/appointment/${lawyer._id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  {/* Lawyer Image */}
                  <div className="relative w-full h-56 overflow-hidden bg-gray-100">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      style={{ objectPosition: "center 35%" }}
                      src={lawyer.image}
                      alt={lawyer.name}
                    />
                  </div>

                  {/* Lawyer Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                      {lawyer.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                      <Briefcase className="w-4 h-4" />
                      <span>{lawyer.speciality}</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <GraduationCap className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{lawyer.degree}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Award className="w-4 h-4 flex-shrink-0" />
                        <span>{lawyer.experience} Experience</span>
                      </div>

                      {lawyer.address?.City && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {lawyer.address.City}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{lawyer.fees}
                        </span>
                      </div>
                      <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lawyers;
