// Admin/src/pages/Lawyer/LawyerVideoCall.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  CallControls,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";
import { toast } from "react-toastify";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import api from "../../api/axiosClient";

const LawyerVideoCall = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  useEffect(() => {
    initializeCall();

    return () => {
      if (call) {
        handleLeaveCall();
      }
    };
  }, [appointmentId]);

  const initializeCall = async () => {
    try {
      // Get Stream token and call details from backend
      const { data } = await api.post("/api/video/get-token", {
        appointmentId,
      });

      if (!data.success) {
        toast.error(data.message);
        navigate("/lawyer-appointments");
        return;
      }

      // Initialize Stream client
      const streamClient = new StreamVideoClient({
        apiKey: data.apiKey,
        user: {
          id: data.userId,
          name: "Lawyer",
        },
        token: data.token,
      });

      // Join the call (create if doesn't exist)
      const streamCall = streamClient.call("default", data.callId);
      await streamCall.join({ create: true });

      setClient(streamClient);
      setCall(streamCall);
      setConnectionStatus("connected");
      setLoading(false);

      // Update call status to joined
      await api.post("/api/video/update-status", {
        appointmentId,
        action: "join",
      });
    } catch (error) {
      // console.error("Video call initialization error:", error);
      toast.error("Failed to join video call");
      navigate("/lawyer-appointments");
    }
  };

  const handleLeaveCall = async () => {
    try {
      if (call) {
        await call.leave();
      }

      // Update call status to left
      await api.post("/api/video/update-status", {
        appointmentId,
        action: "leave",
      });

      toast.success("Call ended");
      navigate("/lawyer-appointments");
    } catch (error) {
      // console.error("Leave call error:", error);
      navigate("/lawyer-appointments");
    }
  };

  const handleEndCall = async () => {
    try {
      if (call) {
        // End the call for all participants
        await call.endCall();
      }

      // End call for everyone
      await api.post("/api/video/update-status", {
        appointmentId,
        action: "end",
      });

      toast.success("Call ended for all participants");
      navigate("/lawyer-appointments");
    } catch (error) {
      // console.error("End call error:", error);
      navigate("/lawyer-appointments");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to video call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <StreamVideo client={client}>
        <StreamTheme>
          <StreamCall call={call}>
            <SpeakerLayout />
            <CallControls onLeave={handleLeaveCall} />
          </StreamCall>
        </StreamTheme>
      </StreamVideo>
    </div>
  );
};

export default LawyerVideoCall;
