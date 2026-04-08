import Carousel from "react-elastic-carousel";
import React, { useRef } from "react";

const BANNERS = [
  { id: 1, linkImg: "/images/banner1.png", linkPage: "/", alt: "Banner 1" },
  { id: 2, linkImg: "/images/banner2.png", linkPage: "/", alt: "Banner 2" },
  { id: 3, linkImg: "/images/banner3.png", linkPage: "/", alt: "Banner 3" },
];

const Slide = () => {
  const carouselRef = useRef(null);
  const autoPlaySpeed = 5000; // 5 seconds per slide
  let resetTimeout;

  const handleEnd = (currentItem, pageIndex) => {
    // If we've reached the last slide, loop back to the start after 5 seconds
    if (pageIndex === BANNERS.length - 1) {
      clearTimeout(resetTimeout);
      resetTimeout = setTimeout(() => {
        if (carouselRef.current) {
          carouselRef.current.goTo(0);
        }
      }, autoPlaySpeed);
    }
  };

  return (
    <div className="home-banner-container">
      <Carousel
        ref={carouselRef}
        itemsToShow={1}
        enableAutoPlay={true}
        autoPlaySpeed={autoPlaySpeed}
        pagination={true}
        showArrows={true}
        onChange={handleEnd}
        disableArrowsOnEnd={false}
      >
        {BANNERS.map((item) => (
          <div key={item.id} style={{ width: "100%" }}>
            <a href={item.linkPage} rel="noreferrer">
              <img
                className="slide-edge"
                src={item.linkImg}
                alt={item.alt}
              />
            </a>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default Slide;
