import React, { useEffect, useRef, useState } from "react";
import useSocketStore from "../../stores/socketStore";

const VideoCall = ({ currentUserId, remoteUserId }) => {
  const { socket } = useSocketStore();
  const [callIncoming, setCallIncoming] = useState(false);
  const [remoteOffer, setRemoteOffer] = useState(null);
  const [callStarted, setCallStarted] = useState(false);
  const [callerId, setCallerId] = useState(null);
  const [calling, setCalling] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  
  const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoOn,
        audio: micOn,
      });
      localVideoRef.current.srcObject = stream;
      localStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      alert("Could not access camera/microphone.");
      return null;
    }
  };

  const createPeerConnection = (stream) => {
    const pc = new RTCPeerConnection(config);

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log("Sending ICE candidate:", e.candidate);
        socket.emit("iceCandidate", {
          to: callerId || remoteUserId,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      console.log("Received remote track");
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.onconnectionstatechange = () => {
      console.log("PeerConnection state:", pc.connectionState);
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed"
      ) {
        cleanup();
      }
    };

    return pc;
  };

  const cleanup = () => {
    setCallStarted(false);
    setCallIncoming(false);
    setCalling(false);
    setRemoteOffer(null);
    setCallerId(null);

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  const initiateCall = async () => {
    setCalling(true);
    const stream = await startLocalStream();
    if (!stream) {
      setCalling(false);
      return;
    }

    const pc = createPeerConnection(stream);
    peerConnectionRef.current = pc;

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log("Sending offer to", remoteUserId);
      socket.emit("callUser", {
        from: currentUserId,
        to: remoteUserId,
        offer,
      });
    } catch (err) {
      console.error("Error during offer creation or sending:", err);
      setCalling(false);
    }
  };

  const acceptCall = async () => {
    const stream = await startLocalStream();
    if (!stream) return;

    const pc = createPeerConnection(stream);
    peerConnectionRef.current = pc;

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(remoteOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answerCall", {
        to: callerId,
        answer,
      });

      setCallIncoming(false);
      setCallStarted(true);
    } catch (err) {
      console.error("Error accepting call:", err);
    }
  };

  const hangUp = () => {
    socket.emit("hangUp", { to: callerId || remoteUserId });
    cleanup();
  };

  const toggleMic = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !micOn;
    });
    setMicOn(!micOn);
  };

  const toggleVideo = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = !videoOn;
    });
    setVideoOn(!videoOn);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("incomingCall", ({ from, offer }) => {
      console.log("Incoming call from", from);
      setCallerId(from);
      setRemoteOffer(offer);
      setCallIncoming(true);
    });

    socket.on("callAnswered", async ({ answer }) => {
      console.log("Call answered");
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          setCallStarted(true);
          setCalling(false);
        } catch (err) {
          console.error("Error setting remote description on answer:", err);
        }
      }
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
          console.log("Added ICE candidate");
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    });

    socket.on("callEnded", () => {
      alert("Call ended");
      cleanup();
    });

    socket.on("callRejected", () => {
      alert("Call rejected by the other user.");
      cleanup();
    });

    socket.on("callCancelled", () => {
      alert("Call cancelled by the other user.");
      cleanup();
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callAnswered");
      socket.off("iceCandidate");
      socket.off("callEnded");
      socket.off("callRejected");
      socket.off("callCancelled");
    };
  }, [socket]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cancelCall = () => {
    socket.emit("cancelCall", { to: remoteUserId });
    cleanup();
  };

  return (
    <div
      style={{
        
        maxWidth: 700,
        margin: "auto",
        padding: 20,
        backgroundColor: "transparent",
        borderRadius: 10,
      }}
    >

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginBottom: 20,
          gap:'10px',
        }}
      >
        <div>
          <p style={{ textAlign: "center" }}>You</p>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: 300,
              height: 225,
              backgroundColor: "#000",
              borderRadius: 8,
              objectFit: "cover",
              boxShadow: "0 0 8px rgba(0,0,0,0.5)",
            }}
          />
         
        </div>

        <div>
          <p style={{ textAlign: "center" }}>Remote</p>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: 300,
              height: 225,
              backgroundColor: "#000",
              borderRadius: 8,
              objectFit: "cover",
              boxShadow: "0 0 8px rgba(0,0,0,0.5)",
            }}
          />
        </div>
      </div>

       <div style={{ marginTop: 10, textAlign: "center", paddingBottom:"10px" }}>
            <button onClick={toggleMic} style={{ marginRight: 10}}>
              {micOn ? "🎙️ Mic On" : "🔇 Mic Off"}
            </button>
            <button onClick={toggleVideo}>
              {videoOn ? "📹 Video On" : "📵 Video Off"}
            </button>
          </div>

      {!callStarted && !calling && (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={initiateCall}
            style={{ padding: "10px 20px", fontSize: 16, cursor: "pointer" }}
          >
            📞 Call
          </button>

          {callIncoming && (
            <>
              <p style={{ marginTop: 10 }}>
                Incoming call from <strong>{callerId}</strong>
              </p>
              <button
                onClick={acceptCall}
                style={{
                  marginRight: 10,
                  padding: "10px 20px",
                  cursor: "pointer",
                }}
              >
                ✅ Accept
              </button>
              <button
                onClick={() => {
                  socket.emit("rejectCall", { to: callerId });
                  setCallIncoming(false);
                }}
                style={{ padding: "10px 20px", cursor: "pointer" }}
              >
                ❌ Reject
              </button>
            </>
          )}
        </div>
      )}


      {/* {callIncoming && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <p>Incoming call...</p>
          <button onClick={acceptCall} style={{ marginRight: 10 }}>Accept</button>
          <button
            onClick={() => {
              socket.emit("rejectCall", { to: callerId });
              cleanup();
            }}
          >
            Reject
          </button>
        </div>
      )} */}

      {/* {!callStarted && !calling && (
        <button onClick={initiateCall}>Call</button>
      )} */}

      {callStarted && (
        <button onClick={hangUp} style={{ marginTop: 10, color: "red" }}>
          Hang Up
        </button>
      )}

      {/* {calling && (
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <p>Calling...</p>
          <button onClick={cancelCall}>Cancel Call</button>
        </div>
      )} */}


      {calling && (
        <div style={{ textAlign: "center", fontWeight: "bold" }}>
          Calling...
          <div style={{ marginTop: 10 }}>
            <button
              onClick={cancelCall}
              style={{
                padding: "8px 16px",
                backgroundColor: "#e67e22",
                color: "white",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Cancel Call
            </button>
          </div>
        </div>
      )}

      {callStarted && (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={hangUp}
            style={{
              padding: "10px 30px",
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            📴 Hang Up
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
