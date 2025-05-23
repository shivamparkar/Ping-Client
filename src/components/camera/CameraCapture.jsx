import React, { useEffect, useRef } from "react";

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const getCameraStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    getCameraStream();

    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
   console.log('stopCamera called');
    const stream = streamRef.current;
    console.log('stream', stream);
    
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      
    }

    streamRef.current = null;
  };

  const handleCapture = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current;

    if (video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/png");

      stopCamera();
      onCapture(imageDataUrl);
      onClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.cameraWindow}>
        <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
        <div style={styles.controls}>
          <button style={styles.button} onClick={handleCapture}>📸 Capture</button>
          <button style={{ ...styles.button, backgroundColor: "#e81123" }} onClick={handleClose}>✖ Close</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  cameraWindow: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    boxShadow: "0 0 20px rgba(0,0,0,0.5)",
    width: 360,
    height: 480,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 16,
  },
  video: {
    width: "100%",
    height: "auto",
    borderRadius: 8,
    backgroundColor: "#000",
    flexGrow: 1,
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 12,
  },
  button: {
    flex: 1,
    margin: "0 6px",
    padding: "12px 0",
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#0078d7",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  }
};

export default CameraCapture;
