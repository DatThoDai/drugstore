import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

const MedicalAIScreen = () => {
    const [messages, setMessages] = useState([
        {
            role: "bot",
            text: "Xin chào! Tôi là trợ lý y tế AI. Hãy đặt câu hỏi về sức khỏe và tôi sẽ tư vấn cho bạn. 🩺",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const sendMessage = async () => {
        const question = input.trim();
        if (!question || loading) return;

        setMessages((prev) => [...prev, { role: "user", text: question }]);
        setInput("");
        setLoading(true);

        try {
            const { data } = await axios.post("/ai/api/chat", { question });
            setMessages((prev) => [
                ...prev,
                { role: "bot", text: data.response || data.error },
            ]);
        } catch (err) {
            const msg =
                err.response?.data?.error ||
                "⚠️ Không thể kết nối đến máy chủ AI. Vui lòng thử lại sau.";
            setMessages((prev) => [...prev, { role: "bot", text: msg }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            <Header />
            <div className="medical-ai-page">
                <div className="medical-ai-container">
                    {/* Page header */}
                    <div className="medical-ai-header">
                        <div className="medical-ai-header-icon">
                            <i className="fas fa-heartbeat"></i>
                        </div>
                        <div>
                            <h1 className="medical-ai-title">Trợ Lý Y Tế AI</h1>
                            <p className="medical-ai-subtitle">
                                Powered by Google Gemini · Tư vấn sức khỏe 24/7
                            </p>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="medical-ai-disclaimer">
                        <i className="fas fa-info-circle"></i>
                        <span>
                            Thông tin chỉ mang tính tham khảo, không thay thế ý kiến bác sĩ
                            chuyên khoa.
                        </span>
                    </div>

                    {/* Chat messages */}
                    <div className="medical-ai-messages">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`medical-ai-message ${msg.role === "user" ? "user" : "bot"
                                    }`}
                            >
                                {msg.role === "bot" && (
                                    <div className="medical-ai-avatar bot-avatar">
                                        <i className="fas fa-robot"></i>
                                    </div>
                                )}
                                <div className="medical-ai-bubble">{msg.text}</div>
                                {msg.role === "user" && (
                                    <div className="medical-ai-avatar user-avatar">
                                        <i className="fas fa-user"></i>
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="medical-ai-message bot">
                                <div className="medical-ai-avatar bot-avatar">
                                    <i className="fas fa-robot"></i>
                                </div>
                                <div className="medical-ai-bubble medical-ai-typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input area */}
                    <div className="medical-ai-input-area">
                        <textarea
                            className="medical-ai-input"
                            placeholder="Nhập câu hỏi y tế của bạn... (Enter để gửi, Shift+Enter xuống dòng)"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            rows={2}
                            disabled={loading}
                        />
                        <button
                            className="medical-ai-send"
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                        >
                            {loading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                                <i className="fas fa-paper-plane"></i>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default MedicalAIScreen;
