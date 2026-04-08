package com.datn.drugstore.service.impl;

import com.datn.drugstore.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImp implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.name}")
    private String appName;

    @Value("${app.url}")
    private String appUrl;

    @Override
    public void sendWelcomeEmail(String to, String fullName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, appName);
            helper.setTo(to);
            helper.setSubject("🎉 Chào mừng bạn đến với " + appName);

            String content = """
                    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2>Xin chào %s 👋</h2>
                        <p>Cảm ơn bạn đã đăng ký tài khoản tại <b>%s</b>.</p>
                        <p>Tài khoản của bạn đã được tạo thành công.</p>

                        <p>
                            👉 <a href="%s" 
                               style="display:inline-block;padding:10px 16px;
                               background-color:#2e7d32;color:#fff;
                               text-decoration:none;border-radius:5px;">
                               Truy cập hệ thống
                            </a>
                        </p>

                        <p>Nếu bạn không thực hiện hành động này, vui lòng bỏ qua email.</p>

                        <hr/>
                        <p style="font-size:12px;color:#888;">
                            © %s - Hệ thống quản lý nhà thuốc
                        </p>
                    </div>
                    """.formatted(fullName, appName, appUrl, appName);

            helper.setText(content, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email chào mừng", e);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi hệ thống khi gửi email", e);
        }
    }

    @Override
    public void sendOtpEmail(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, appName);
            helper.setTo(to);
            helper.setSubject("🔐 Mã OTP đặt lại mật khẩu - " + appName);

            String content = """
                    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:10px;">
                        <h2 style="color:#15803d;">&#128274; Đặt lại mật khẩu</h2>
                        <p>Bạn đã yêu cầu đặt lại mật khẩu tại <b>%s</b>.</p>
                        <p>Mã OTP của bạn là:</p>
                        <div style="text-align:center;margin:20px 0;">
                            <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#15803d;background:#f0fdf4;padding:12px 24px;border-radius:8px;">%s</span>
                        </div>
                        <p style="color:#6b7280;">Mã có hiệu lực trong <b>5 phút</b>. Không chia sẻ mã này cho bất kỳ ai.</p>
                        <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;"/>
                        <p style="font-size:12px;color:#9ca3af;">© %s</p>
                    </div>
                    """.formatted(appName, otp, appName);

            helper.setText(content, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Không thể gửi email OTP", e);
        }
    }
}
