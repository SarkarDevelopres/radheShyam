"use client";
import { useEffect, useRef, useLayoutEffect, useState } from "react";
import styles from "./styles/infinite.module.css";

export default function InfiniteSlider() {
  const trackRef = useRef(null);
  const firstSlideRef = useRef(null);

  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [slideWidth, setSlideWidth] = useState(0);

  const slides = [
    { name: "AustraliaVSAfrica", image: "/slide-1.png" },
    { name: "NewZealandVSZimbabwe", image: "/slide-2.jpeg" },
    { name: "AustiraVSWels", image: "/slide-3.jpg" },
  ];
  const extendedSlides = [...slides, ...slides]; // for seamless loop feel

  // Measure the actual slide width (once ready) and keep it updated
  useLayoutEffect(() => {
    if (!firstSlideRef.current) return;

    const measure = () => {
      const { width } = firstSlideRef.current.getBoundingClientRect();
      setSlideWidth(width);
    };

    // Initial measure
    measure();

    // Update on element resize (more reliable than window resize)
    const ro = new ResizeObserver(measure);
    ro.observe(firstSlideRef.current);

    // Fallback: update on window resize as well
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Auto-advance (pause on hover)
  useEffect(() => {
    if (isHovered) return;
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = prev + 1;
        return next >= slides.length ? 0 : next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, [isHovered, slides.length]);

  // Apply transform using the real measured slide width
  useEffect(() => {
    if (!trackRef.current || !slideWidth) return;
    const track = trackRef.current;
    track.style.transition = "transform 0.3s ease-in-out";
    track.style.transform = `translateX(-${index * slideWidth}px)`;
  }, [index, slideWidth]);

  return (
    <div
      className={styles.sliderWrapper}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div ref={trackRef} className={styles.sliderTrack}>
        {extendedSlides.map((e, i) => (
          <div
            key={i}
            ref={i === 0 ? firstSlideRef : null}
            className={styles.slide}
            style={{ backgroundImage: `url(${e.image})` }}
          />
        ))}
      </div>
    </div>
  );
}
