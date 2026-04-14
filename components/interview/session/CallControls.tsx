"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  CallEnd01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

interface CallControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
  disabled: boolean;
}

export default function CallControls({
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onEndCall,
  disabled,
}: CallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {/* Mute */}
      <button
        onClick={onToggleMute}
        disabled={disabled}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 border ${
          isMuted
            ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
            : "bg-white/10 border-white/15 text-white/70 hover:bg-white/20 hover:text-white"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
        title={isMuted ? "Unmute" : "Mute"}
      >
        <HugeiconsIcon icon={isMuted ? MicOffIcon : MicIcon} size={20} strokeWidth={2} />
      </button>

      {/* Camera */}
      <button
        onClick={onToggleCamera}
        disabled={disabled}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 border ${
          isCameraOff
            ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
            : "bg-white/10 border-white/15 text-white/70 hover:bg-white/20 hover:text-white"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
        title={isCameraOff ? "Turn on camera" : "Turn off camera"}
      >
        <HugeiconsIcon icon={isCameraOff ? VideoOffIcon : VideoIcon} size={20} strokeWidth={2} />
      </button>

      {/* End call */}
      <Button
        onClick={onEndCall}
        className="h-12 px-6 bg-red-600 hover:bg-red-500 text-white border-0 rounded-full font-semibold gap-2 shadow-lg shadow-red-500/25"
      >
        <HugeiconsIcon icon={CallEnd01Icon} size={20} strokeWidth={2} />
        End Interview
      </Button>
    </div>
  );
}
