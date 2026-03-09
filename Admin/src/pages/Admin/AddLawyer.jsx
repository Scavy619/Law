import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import api from "../../api/axiosClient";
import Loading from "../../components/Loading";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

const AddLawyer = () => {
  const [lawyerImg, setLawyerImg] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [experience, setExperience] = useState("1 Year");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("Criminal Lawyer");
  const [degree, setDegree] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);

  const { adminData } = useContext(AppContext);

  // ===================== PASSWORD VALIDATION ==========================
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasLength = password.length >= 8;
  const passwordValid =
    hasUpper && hasLower && hasSpecial && hasNumber && hasLength;

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!lawyerImg) {
      return toast.error("Image Not Selected");
    }

    if (!passwordValid) {
      return toast.error("Password does not meet the requirements");
    }

    if (lawyerImg.size > MAX_SIZE_BYTES) {
      return toast.error("Image size must be less than 2MB");
    }

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("image", lawyerImg);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("experience", experience);
      formData.append("fees", Number(fees));
      formData.append("about", about);
      formData.append("speciality", speciality);
      formData.append("degree", degree);
      formData.append(
        "address",
        JSON.stringify({
          Location: location,
          City: city,
          State: state,
        }),
      );

      if (!adminData) {
        toast.error("Please login first");
        return;
      }

      const { data } = await api.post("/api/admin/add-lawyer", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        toast.success(data.message);
        setLawyerImg(false);
        setName("");
        setEmail("");
        setPassword("");
        setLocation("");
        setCity("");
        setState("");
        setDegree("");
        setAbout("");
        setFees("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <form onSubmit={onSubmitHandler} className="m-5 w-full">
      <p className="mb-3 text-lg font-medium">Add Lawyer</p>

      <div className="bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll">
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="lawyer-img">
            <img
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
              src={
                lawyerImg ? URL.createObjectURL(lawyerImg) : assets.upload_area
              }
              alt=""
            />
          </label>
          <input
            type="file"
            id="lawyer-img"
            hidden
            accept="image/png, image/jpeg"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              if (!ALLOWED_TYPES.includes(file.type)) {
                toast.error("Only JPG and PNG images are allowed");
                e.target.value = "";
                return;
              }

              if (file.size > MAX_SIZE_BYTES) {
                toast.error("Image size must be less than 2MB");
                e.target.value = "";
                return;
              }

              setLawyerImg(file);
            }}
          />
          <p>
            Upload lawyer <br /> picture
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p>Your name</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border rounded px-3 py-2"
                type="text"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <p>Lawyer Email</p>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border rounded px-3 py-2"
                type="email"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <p>Set Password</p>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border rounded px-3 py-2 w-full pr-10"
                  type={showPassword ? "text" : "password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {password.length > 0 && (
                <ul className="mt-1 text-xs">
                  <li className={hasLength ? "text-green-600" : "text-red-500"}>
                    {hasLength ? "✔" : "✖"} At least 8 characters
                  </li>
                  <li className={hasUpper ? "text-green-600" : "text-red-500"}>
                    {hasUpper ? "✔" : "✖"} One uppercase letter
                  </li>
                  <li className={hasLower ? "text-green-600" : "text-red-500"}>
                    {hasLower ? "✔" : "✖"} One lowercase letter
                  </li>
                  <li className={hasNumber ? "text-green-600" : "text-red-500"}>
                    {hasNumber ? "✔" : "✖"} One number
                  </li>
                  <li
                    className={hasSpecial ? "text-green-600" : "text-red-500"}
                  >
                    {hasSpecial ? "✔" : "✖"} One special character (!@#$%^&*...)
                  </li>
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <p>Experience</p>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="border rounded px-2 py-2"
              >
                <option>1 Year</option>
                <option>2 Year</option>
                <option>3 Year</option>
                <option>4 Year</option>
                <option>5 Year</option>
                <option>6 Year</option>
                <option>8 Year</option>
                <option>9 Year</option>
                <option>10 Year</option>
                <option>&gt;10 Year</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <p>Fees</p>
              <input
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                className="border rounded px-3 py-2"
                type="number"
                required
              />
            </div>
          </div>

          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p>Speciality</p>
              <select
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                className="border rounded px-2 py-2"
              >
                <option>Criminal Lawyer</option>
                <option>Family & Divorce Lawyer</option>
                <option>Corporate Lawyer</option>
                <option>Civil Litigation Lawyer</option>
                <option>Intellectual Property Lawyer</option>
                <option>Tax Lawyer</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <p>Degree</p>
              <input
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="border rounded px-3 py-2"
                type="text"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <p>Address</p>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="Location"
                required
              />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="City"
                required
              />
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="State"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <p className="mt-4 mb-2">About Lawyer</p>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="w-full px-4 pt-2 border rounded"
            rows={5}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !passwordValid}
          className="bg-primary px-10 py-3 mt-4 text-white rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Adding lawyer..." : "Add lawyer"}
        </button>
      </div>
    </form>
  );
};

export default AddLawyer;
