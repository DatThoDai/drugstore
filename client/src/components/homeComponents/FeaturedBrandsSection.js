import React from "react";

const BRAND_LOGOS = [
  { id: 1, src: "/images/product-item1.png", alt: "Brand 1" },
  { id: 2, src: "/images/product-item2.png", alt: "Brand 2" },
  { id: 3, src: "/images/product-item3.png", alt: "Brand 3" },
  { id: 4, src: "/images/product-item4.png", alt: "Brand 4" },
  { id: 5, src: "/images/product-item5.png", alt: "Brand 5" },
  { id: 6, src: "/images/product-item6.png", alt: "Brand 6" },
];

const FeaturedBrandsSection = () => {
  const infiniteLogos = [...BRAND_LOGOS, ...BRAND_LOGOS];

  return (
    <div className="featured-brands-container">
      <div className="featured-brands-wrapper">
        <div className="animate-featured-scroll d-flex align-items-center">
          {infiniteLogos.map((logo, index) => (
            <div key={`${logo.id}-${index}`} className="brand-logo-item">
              <img src={logo.src} alt={logo.alt} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedBrandsSection;
