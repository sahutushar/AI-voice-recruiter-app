"use client";

import { useEffect, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { VideoOffIcon, UserIcon } from "@hugeicons/core-free-icons";

interface WebcamViewProps {
  stream: MediaStream | null;
  isCameraOff: boolean;
  candidateName: string;
}

export default function WebcamView({ stream, isCameraOff, candidateName }: WebcamViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/10">
      {!isCameraOff && stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover scale-x-[-1]"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            {isCameraOff
              ? <HugeiconsIcon icon={VideoOffIcon} size={28} className="text-white/40" strokeWidth={2} />
              : <HugeiconsIcon icon={UserIcon} size={28} className="text-white/40" strokeWidth={2} />
            }
          </div>
          <p className="text-white/30 text-sm">{isCameraOff ? "Camera off" : "No camera"}</p>
        </div>
      )}

      {/* Name tag */}
      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
        <p className="text-white text-xs font-semibold">{candidateName}</p>
      </div>
    </div>
  );
}
