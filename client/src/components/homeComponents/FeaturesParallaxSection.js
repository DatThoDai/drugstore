import React from "react";
import { motion } from "framer-motion";

const FeaturesParallaxSection = () => {
  const features = [
    {
      id: 1,
      title: "100% Thuốc Chính Hãng",
      desc: "Chất lượng đảm bảo tuyệt đối",
      icon: "fas fa-shield-alt"
    },
    {
      id: 2,
      title: "Dược sĩ 24/7",
      desc: "Tư vấn tận tâm, chuyên nghiệp",
      icon: "fas fa-user-md"
    },
    {
      id: 3,
      title: "Giao Hàng Hỏa Tốc",
      desc: "Nhận hàng chỉ trong 2 giờ",
      icon: "fas fa-shipping-fast"
    },
    {
      id: 4,
      title: "Tiết Kiệm Chi Phí",
      desc: "Thay thế thuốc với giá tốt nhất",
      icon: "fas fa-pills"
    }
  ];

  return (
    <div className="parallax-section">
      <div className="parallax-bg" />
      <div className="parallax-overlay" />
      <div className="container parallax-content">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
          className="parallax-header"
        >
          <h2>Tại sao chọn DrugStore?</h2>
          <p>Mang lại giá trị sức khỏe đích thực cho gia đình bạn.</p>
        </motion.div>
        
        <div className="row">
          {features.map((item, index) => (
            <motion.div
              className="col-12 col-md-3"
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="glass-card">
                <i className={item.icon}></i>
                <h4>{item.title}</h4>
                <span>{item.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesParallaxSection;
