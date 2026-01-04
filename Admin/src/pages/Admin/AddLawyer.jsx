import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

const AddLawyer = () => {
  const [lawyerImg, setLawyerImg] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("1 Year");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("Criminal Lawyer");
  const [degree, setDegree] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);

  const { backendUrl } = useContext(AppContext);
  const { aToken } = useContext(AdminContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!lawyerImg) {
      return toast.error("Image Not Selected");
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

      if (!aToken) {
        toast.error("Please login first");
        return;
      }

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-lawyer",
        formData,
        {
          headers: {
            Authorization: `Bearer ${aToken}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

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
      console.log(error);
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
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border rounded px-3 py-2"
                type="password"
                required
              />
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
          disabled={loading}
          className="bg-primary px-10 py-3 mt-4 text-white rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Adding lawyer..." : "Add lawyer"}
        </button>
      </div>
    </form>
  );
};

export default AddLawyer;
