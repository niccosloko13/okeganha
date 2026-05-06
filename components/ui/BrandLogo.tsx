"use client";

import { useState } from "react";
import Image from "next/image";

type BrandLogoProps = {
  height?: number;
  className?: string;
  textClassName?: string;
};

export function BrandLogo({ height = 42, className = "", textClassName = "" }: BrandLogoProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <span
        className={`inline-flex items-center font-[family-name:var(--font-sora)] text-xl font-bold tracking-tight text-white ${textClassName}`}
        style={{ height }}
      >
        okeganha
      </span>
    );
  }

  return (
    <Image
      src="/logo-okeganha.png"
      alt="okeganha"
      width={220}
      height={52}
      priority
      className={`w-auto object-contain ${className}`}
      style={{ height }}
      onError={() => setImageError(true)}
    />
  );
}
