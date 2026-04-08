import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./MedicalAIChatbot.css";

const MedicalAIChatbot = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "bot",
            text: "Xin chào! Tôi là trợ lý y tế AI 🩺. Bạn cần tư vấn gì về sức khỏe?",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading, open]);

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
                "⚠️ Không thể kết nối AI. Vui lòng thử lại.";
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
        <div className="chatbot-wrap">
            {/* Chat window */}
            {open && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-left">
                            <div className="chatbot-header-icon">
                                <i className="fas fa-heartbeat"></i>
                            </div>
                            <div>
                                <div className="chatbot-header-title">Trợ Lý Y Tế AI</div>
                                <div className="chatbot-header-sub">Powered by Gemini</div>
                            </div>
                        </div>
                        <button
                            className="chatbot-close"
                            onClick={() => setOpen(false)}
                            title="Đóng"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`chatbot-msg ${msg.role === "user" ? "user" : "bot"}`}
                            >
                                {msg.role === "bot" && (
                                    <div className="chatbot-avatar bot-av">
                                        <i className="fas fa-robot"></i>
                                    </div>
                                )}
                                <div className="chatbot-bubble">{msg.text}</div>
                                {msg.role === "user" && (
                                    <div className="chatbot-avatar user-av">
                                        <i className="fas fa-user"></i>
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="chatbot-msg bot">
                                <div className="chatbot-avatar bot-av">
                                    <i className="fas fa-robot"></i>
                                </div>
                                <div className="chatbot-bubble chatbot-typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <div className="chatbot-input-area">
                        <textarea
                            className="chatbot-input"
                            placeholder="Nhập câu hỏi... (Enter gửi)"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            rows={2}
                            disabled={loading}
                        />
                        <button
                            className="chatbot-send-btn"
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
            )}

            {/* Floating toggle button */}
            <button
                className={`chatbot-fab ${open ? "fab-open" : ""}`}
                onClick={() => setOpen((prev) => !prev)}
                title="Tư vấn y tế AI"
            >
                <i className={`fas ${open ? "fa-times" : "fa-comment-medical"}`}></i>
                {!open && <span className="fab-label">Tư vấn AI</span>}
            </button>
        </div>
    );
};

export default MedicalAIChatbot;
