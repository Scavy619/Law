// Admin/src/pages/Lawyer/LawyerVideoCall.jsx

import { useEffect, useState, useRef } from "react";
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
import Loader from "../../components/common/Loader";

const LawyerVideoCall = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCallEnded, setIsCallEnded] = useState(false);

  // Use a ref so the cleanup function always sees the latest call instance
  // without needing it as an effect dependency
  const callRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      initializeCall();
    }

    return () => {
      mounted = false;
      // Cleanup: leave the call if still active — use ref to avoid stale closure
      const activeCall = callRef.current;
      if (activeCall) {
        try {
          if (activeCall._eventHandlers) {
            activeCall.off(
              "call.ended",
              activeCall._eventHandlers.handleCallEnded,
            );
            activeCall.off(
              "call.session_ended",
              activeCall._eventHandlers.handleSessionEnded,
            );
          }
          activeCall.leave();
        } catch {
          // ignore cleanup errors
        }
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

      // Listen for remote call-ended events (e.g. user ends the call)
      const handleCallEnded = () => {
        setIsCallEnded(true);
        setTimeout(() => {
          toast.info("Call ended by the other participant");
          navigate("/lawyer-appointments");
        }, 100);
      };

      const handleSessionEnded = () => {
        setIsCallEnded(true);
        setTimeout(() => {
          toast.info("Call session ended");
          navigate("/lawyer-appointments");
        }, 100);
      };

      streamCall.on("call.ended", handleCallEnded);
      streamCall.on("call.session_ended", handleSessionEnded);

      // Store handlers so cleanup can remove them
      streamCall._eventHandlers = { handleCallEnded, handleSessionEnded };

      // Keep ref in sync so the effect cleanup always finds the live instance
      callRef.current = streamCall;

      setClient(streamClient);
      setCall(streamCall);

      setLoading(false);

      // Update call status to joined
      await api.post("/api/video/update-status", {
        appointmentId,
        action: "join",
      });
    } catch {
      toast.error("Failed to join video call");
      navigate("/lawyer-appointments");
    }
  };

  const handleLeaveCall = async () => {
    try {
      const activeCall = callRef.current;
      if (activeCall) {
        await activeCall.leave();
        callRef.current = null;
      }

      // Update call status to left
      await api.post("/api/video/update-status", {
        appointmentId,
        action: "leave",
      });

      toast.success("Call ended");
      navigate("/lawyer-appointments");
    } catch {
      navigate("/lawyer-appointments");
    }
  };

  const handleEndCall = async () => {
    try {
      const activeCall = callRef.current;
      if (activeCall) {
        // End the call for all participants
        await activeCall.endCall();
        callRef.current = null;
      }

      // End call for everyone
      await api.post("/api/video/update-status", {
        appointmentId,
        action: "end",
      });

      toast.success("Call ended for all participants");
      navigate("/lawyer-appointments");
    } catch {
      navigate("/lawyer-appointments");
    }
  };

  if (loading) {
    return <Loader minHeight="min-h-screen" />;
  }

  if (isCallEnded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Call ended. Redirecting...</p>
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
            <div className="str-video__call-controls">
              <CallControls onLeave={handleLeaveCall} />
              <button
                onClick={handleEndCall}
                className="str-video__call-controls__button ml-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                title="End call for everyone"
              >
                End for All
              </button>
            </div>
          </StreamCall>
        </StreamTheme>
      </StreamVideo>
    </div>
  );
};

export default LawyerVideoCall;
