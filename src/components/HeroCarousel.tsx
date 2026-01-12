"use client";
import React from "react";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import clsx from "clsx";

type Props = {
  images: string[];
  isMobile?: boolean;
};

export default function HeroCarousel({ images, isMobile }: Props) {
  return (
    <Slide autoplay infinite duration={3500} transitionDuration={600} pauseOnHover>
      {(() => {
        const chunkSize = isMobile ? 1 : 1;
        const slidesArr: string[][] = [];
        for (let i = 0; i < images.length; i += chunkSize) {
          slidesArr.push(images.slice(i, i + chunkSize));
        }
        if (!isMobile && slidesArr.length) {
          const last = slidesArr[slidesArr.length - 1];
          if (last.length < chunkSize) {
            let idx = 0;
            while (last.length < chunkSize) {
              last.push(images[idx % images.length]);
              idx++;
            }
          }
        }

        return slidesArr.map((group, sidx) => (
          <div key={sidx} className="w-full">
            <div className={clsx("flex gap-2", { "flex-col": isMobile })}>
              {group.map((src, idx) => (
                <div key={idx} className={`w-full ${isMobile ? "h-60" : "h-60 md:w-1/1"} mx-2 rounded bg-center bg-cover overflow-hidden`} style={{ backgroundImage: `url(${src})` }}>
                  <div className="h-full w-full bg-black/8" />
                </div>
              ))}
            </div>
          </div>
        ));
      })()}
    </Slide>
  );
}
