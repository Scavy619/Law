import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";

const LawyersList = () => {
  const { lawyers, changeAvailability, getAllLawyers } =
    useContext(AdminContext);
  const { adminData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (adminData) {
      getAllLawyers().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [adminData]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="w-full max-w-7xl m-5">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">All Lawyers</h1>

      <div className="bg-white border text-sm max-h-[80vh] overflow-y-auto rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {lawyers.map((item, index) => (
            <div
              className={`border rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
                item.available ? "border-green-100" : "border-gray-200"
              }`}
              key={index}
            >
              <div className="relative overflow-hidden h-48 sm:h-52 bg-gray-50">
                <img
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  src={item.image || "/default-lawyer.png"}
                  alt={item.name}
                />
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                    item.available 
                    ? "bg-green-500/90 text-white shadow-sm" 
                    : "bg-gray-500/90 text-white shadow-sm"
                  }`}>
                    {item.available ? "Available" : "Unavailable"}
                </div>
              </div>
              
              <div className="p-5 flex flex-col justify-between">
                <div>
                   <p className="text-gray-900 text-lg font-bold truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-primary font-medium text-sm mt-0.5 mb-4">
                    {item.speciality}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={item.available || false}
                      onChange={() => changeAvailability(item._id)}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                  <span className="text-sm font-medium text-gray-600">
                    {item.available ? "Mark Unavailable" : "Mark Available"}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {(!lawyers || lawyers.length === 0) && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No lawyers found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawyersList;
