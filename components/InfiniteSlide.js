"use client";
import { useEffect, useRef, useState } from 'react';
import styles from './styles/infinite.module.css';

export default function InfiniteSlider() {
    const trackRef = useRef(null);
    const [index, setIndex] = useState(0);

    const [isHovered, setIsHovered] = useState(false);


    const slides = [{name:"AustraliaVSAfrica",image:"/slide-1.png"},{name:"NewZealandVSZimbabwe",image:"/slide-2.jpeg"},{name:"AustiraVSWels",image:"/slide-3.jpg"}];
    const extendedSlides = [...slides, ...slides]; // for seamless loop

    useEffect(() => {
        if (isHovered) return;

        const interval = setInterval(() => {
            setIndex(prev => {
                const newIndex = prev + 1;
                return newIndex >= slides.length ? 0 : newIndex;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [isHovered]);

    useEffect(() => {
        const slideWidth = window.innerWidth; // each slide is 100vw
        const track = trackRef.current;
        if (track) {
            track.style.transition = 'transform 0.3s ease-in-out';
            track.style.transform = `translateX(-${index * slideWidth}px)`;
        }
    }, [index]);

    return (
        <div className={styles.sliderWrapper}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            <div ref={trackRef} className={styles.sliderTrack}>
                {extendedSlides.map((e, i) => (
                    <div className={styles.slide} style={{backgroundImage:`url(${e.image})`}} key={i}>
                        
                    </div>
                ))}
            </div>
        </div>
    );
}
