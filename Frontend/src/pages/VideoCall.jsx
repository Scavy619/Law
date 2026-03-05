// Frontend/src/pages/VideoCall.jsx

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
import { getVideoToken, joinVideoCall, leaveVideoCall } from "../api/video.api";

const VideoCall = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  useEffect(() => {
    let mounted = true;

    const initCall = async () => {
      if (mounted && !isCallEnded) {
        await initializeCall();
      }
    };

    initCall();

    return () => {
      mounted = false;
      // Simple cleanup without calling handleLeaveCall to avoid loops
      if (call && !isCallEnded) {
        try {
          // Remove specific event handlers
          if (call._eventHandlers) {
            call.off("call.ended", call._eventHandlers.handleCallEnded);
            call.off(
              "call.session_ended",
              call._eventHandlers.handleSessionEnded,
            );
          }
          call.leave();
        } catch (error) {
          // console.log("Cleanup error:", error);
        }
      }
    };
  }, [appointmentId]);

  const initializeCall = async () => {
    try {
      // Get Stream token and call details from backend
      const { data } = await getVideoToken(appointmentId);

      if (!data.success) {
        toast.error(data.message);
        navigate("/my-appointments");
        return;
      }

      // Initialize Stream client
      const streamClient = new StreamVideoClient({
        apiKey: data.apiKey,
        user: {
          id: data.userId,
          name: "User",
        },
        token: data.token,
      });

      // Join the call (create if doesn't exist)
      const streamCall = streamClient.call("default", data.callId);
      await streamCall.join({ create: true });

      // Add event listeners for call events
      const handleCallEnded = () => {
        // console.log("Call ended by another participant");
        setIsCallEnded(true);
        setTimeout(() => {
          toast.info("Call ended by lawyer");
          navigate("/my-appointments");
        }, 100);
      };

      const handleSessionEnded = () => {
        // console.log("Call session ended");
        setIsCallEnded(true);
        setTimeout(() => {
          toast.info("Call session ended");
          navigate("/my-appointments");
        }, 100);
      };

      streamCall.on("call.ended", handleCallEnded);
      streamCall.on("call.session_ended", handleSessionEnded);

      // Store event handlers for cleanup
      streamCall._eventHandlers = { handleCallEnded, handleSessionEnded };

      setClient(streamClient);
      setCall(streamCall);
      setConnectionStatus("connected");
      setLoading(false);

      // Update call status to joined
      await joinVideoCall(appointmentId);
    } catch (error) {
      // console.error("Video call initialization error:", error);
      toast.error("Failed to join video call");
      navigate("/my-appointments");
    }
  };

  const handleLeaveCall = async () => {
    try {
      if (call) {
        await call.leave();
      }

      // Update call status to left
      await leaveVideoCall(appointmentId);

      toast.success("Call ended");
      navigate("/my-appointments");
    } catch (error) {
      // console.error("Leave call error:", error);
      navigate("/my-appointments");
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
            <CallControls onLeave={handleLeaveCall} />
          </StreamCall>
        </StreamTheme>
      </StreamVideo>
    </div>
  );
};

export default VideoCall;
