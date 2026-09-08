"use client";

import { useEffect, useState } from "react";
import { Clock, Zap } from "lucide-react";

interface CountdownTimerProps {
  endTime: Date;
  onExpired?: () => void;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

export default function CountdownTimer({
  endTime,
  onExpired,
  compact = false,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
        });
        onExpired?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        expired: false,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endTime, onExpired]);

  if (timeLeft.expired) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
        <Clock className="w-4 h-4 text-red-600" />
        <span className="text-sm font-semibold text-red-700">Deal Expired</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Zap className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-bold text-orange-600">
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200">
      <Zap className="w-6 h-6 text-orange-600 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-700 mb-2">Deal Ends In</p>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-orange-600">
              {String(timeLeft.days).padStart(2, "0")}
            </div>
            <div className="text-xs text-slate-600">Days</div>
          </div>
          <span className="text-2xl font-bold text-orange-300">:</span>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-orange-600">
              {String(timeLeft.hours).padStart(2, "0")}
            </div>
            <div className="text-xs text-slate-600">Hours</div>
          </div>
          <span className="text-2xl font-bold text-orange-300">:</span>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-orange-600">
              {String(timeLeft.minutes).padStart(2, "0")}
            </div>
            <div className="text-xs text-slate-600">Mins</div>
          </div>
          <span className="text-2xl font-bold text-orange-300">:</span>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-orange-600">
              {String(timeLeft.seconds).padStart(2, "0")}
            </div>
            <div className="text-xs text-slate-600">Secs</div>
          </div>
        </div>
      </div>
    </div>
  );
}
