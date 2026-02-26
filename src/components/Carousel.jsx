import { useState } from "react";

export const Carousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageCount = images.length;

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % imageCount);
  };

  const goPrev = () => {
    if (currentIndex !== 0) setCurrentIndex((prev) => prev - 1);
  };

  return (
    <>
      <div className="carousel">
        <button
          className="carousel-button-back"
          disabled={currentIndex === 0}
          onClick={goPrev}
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            visibility: currentIndex === 0 ? "hidden" : "visible",
          }}
        >
          &#8249;
        </button>
        <img
          src={images[currentIndex]}
          alt={"image"}
          className="carousel-image"
        />
        <button
          className="carousel-button-next"
          disabled={currentIndex === imageCount - 1}
          onClick={goNext}
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            visibility: currentIndex === imageCount - 1 ? "hidden" : "visible",
          }}
        >
          &#8250;
        </button>
      </div>
    </>
  );
};
