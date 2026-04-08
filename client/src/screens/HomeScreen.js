import React, { useEffect } from "react";
import Header from "./../components/Header";
import ShopSection from "./../components/homeComponents/ShopSection";
import ContactInfo from "./../components/homeComponents/ContactInfo";
import CalltoActionSection from "./../components/homeComponents/CalltoActionSection";
import FeaturesParallaxSection from "./../components/homeComponents/FeaturesParallaxSection";
import Footer from "./../components/Footer";

const HomeScreen = ({ match }) => {
  const keyword = match.params.keyword;
  const pagenumber = match.params.pagenumber;
  const item = match.params.item;

  useEffect(() => {
    if (!pagenumber && !item && !keyword) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pagenumber, item, keyword]);

  return (
    <div>
      <Header />
      <ShopSection keyword={keyword} pagenumber={pagenumber} />
      <CalltoActionSection />
      <FeaturesParallaxSection />
      <ContactInfo />
      <Footer />
    </div>
  );
};

export default HomeScreen;
