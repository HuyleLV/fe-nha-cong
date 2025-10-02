"use client";

import Image, { StaticImageData } from "next/image";
import { useState } from "react";
import defaultImage from "@/assets/image/default-image.jpg";

type MyImageProps = {
  src?: string | StaticImageData;
  alt?: string;       
  className?: string;
  priority?: boolean;
};

export default function MyImage({
  src,
  alt,
  className = "",
  priority = false,
  ...props
}: MyImageProps) {
  const [imgSrc, setImgSrc] = useState<string | StaticImageData>(
    src || defaultImage
  );

  return (
    <div className={`relative ${className}`}>
      <Image
        {...props}
        src={imgSrc}
        alt={alt || "Nhà cộng"}
        fill
        priority
        sizes="(max-width: 768px) 100vw,
               (max-width: 1200px) 50vw,
               272px"
        className="object-cover rounded-md"
        onError={() => setImgSrc(defaultImage)}
      />
    </div>
  );
}
