import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import Home from "../pages/Home.jsx";
import Lawyers from "../pages/Lawyers.jsx";
import Login from "../pages/Login.jsx";
import OAuthCallback from "../pages/OAuthCallback.jsx";
import MyProfile from "../pages/MyProfile.jsx";
import MyAppointments from "../pages/MyAppointments.jsx";
import Appointment from "../pages/Appointment.jsx";
import Chatbot from "../pages/Chatbot.jsx";
import VideoCall from "../pages/VideoCall.jsx";
import NotFound from "../pages/NotFound.jsx";

import Loader from "../components/common/Loader.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import Layout from "../layouts/layout.jsx";

const About = lazy(() => import("../pages/About.jsx"));
const Contact = lazy(() => import("../pages/Contact.jsx"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy.jsx"));
const TermsAndConditions = lazy(
  () => import("../pages/TermsAndConditions.jsx"),
);
const RefundPolicy = lazy(() => import("../pages/RefundPolicy.jsx"));
const ContactUs = lazy(() => import("../pages/ContactUs.jsx"));
const Resources = lazy(() => import("../pages/Resources.jsx"));
const ResetPassword = lazy(() => import("../pages/ResetPassword.jsx"));
const Verify = lazy(() => import("../pages/Verify.jsx"));
const VerifyEmail = lazy(() => import("../pages/VerifyEmail.jsx"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path="/chatbot"
        element={
          <ProtectedRoute>
            <Chatbot />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chatbot/:sessionId"
        element={
          <ProtectedRoute>
            <Chatbot />
          </ProtectedRoute>
        }
      />

      <Route element={<Layout />}>
        <Route index element={<Home />} />

        <Route path="lawyers" element={<Lawyers />} />
        <Route path="lawyers/:speciality" element={<Lawyers />} />

        <Route path="login" element={<Login />} />
        <Route path="oauth/callback" element={<OAuthCallback />} />

        <Route
          path="verify-email"
          element={
            <Suspense fallback={<Loader />}>
              <VerifyEmail />
            </Suspense>
          }
        />

        <Route
          path="about"
          element={
            <Suspense fallback={<Loader />}>
              <About />
            </Suspense>
          }
        />

        <Route
          path="contact"
          element={
            <Suspense fallback={<Loader />}>
              <Contact />
            </Suspense>
          }
        />

        <Route
          path="resources"
          element={
            <Suspense fallback={<Loader />}>
              <Resources />
            </Suspense>
          }
        />

        <Route
          path="my-profile"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="my-appointments"
          element={
            <ProtectedRoute>
              <MyAppointments />
            </ProtectedRoute>
          }
        />

        <Route path="appointment/:lawyerId" element={<Appointment />} />

        <Route
          path="video-call/:appointmentId"
          element={
            <ProtectedRoute>
              <VideoCall />
            </ProtectedRoute>
          }
        />

        <Route
          path="privacy-policy"
          element={
            <Suspense fallback={<Loader />}>
              <PrivacyPolicy />
            </Suspense>
          }
        />

        <Route
          path="terms-and-conditions"
          element={
            <Suspense fallback={<Loader />}>
              <TermsAndConditions />
            </Suspense>
          }
        />

        <Route
          path="refund-policy"
          element={
            <Suspense fallback={<Loader />}>
              <RefundPolicy />
            </Suspense>
          }
        />

        <Route
          path="contact-us"
          element={
            <Suspense fallback={<Loader />}>
              <ContactUs />
            </Suspense>
          }
        />

        <Route
          path="verify-email/:token"
          element={
            <Suspense fallback={<Loader />}>
              <Verify />
            </Suspense>
          }
        />

        <Route
          path="reset-password/:token"
          element={
            <Suspense fallback={<Loader />}>
              <ResetPassword />
            </Suspense>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </>,
  ),
);

export default router;
