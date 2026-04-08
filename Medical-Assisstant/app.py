import os
from dotenv import load_dotenv
from google import genai
from google.genai.errors import ClientError
from flask import Flask, render_template, request, jsonify, make_response

app = Flask(__name__)

# Manual CORS — works without any external package
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

@app.route('/api/chat', methods=['OPTIONS'])
def chat_preflight():
    return add_cors_headers(make_response('', 204))

# Load environment variables with explicit path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, '.env'))


def build_prompt(user_input):
    return f"""Bạn là một chuyên gia y tế đang tư vấn cho bệnh nhân. Hãy luôn trả lời bằng tiếng Việt, rõ ràng và dễ hiểu.

        Câu hỏi y tế: {user_input}

        Yêu cầu:
        - Trả lời hoàn toàn bằng tiếng Việt.
        - Cung cấp thông tin chính xác liên quan đến vấn đề sức khỏe của bệnh nhân.
        - Nếu chỉ đề cập tên bệnh, hãy mô tả triệu chứng, nguyên nhân và cách điều trị.
        - Trình bày dưới dạng đoạn văn, không dùng gạch đầu dòng.
        - Không dùng từ viết tắt, không đưa thông tin sai lệch.
        - Nếu câu hỏi không liên quan đến y tế, hãy lịch sự đề nghị bệnh nhân đặt câu hỏi về sức khỏe."""


def get_gemini_response(question):
    api_key = os.getenv("GOOGLE_API_KEY")
    c = genai.Client(api_key=api_key)
    response = c.models.generate_content(
        model='gemini-2.5-flash',
        contents=question
    )
    return response.text


# ── JSON API for React frontend ──────────────────────────────────────────────
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json(force=True)
    user_input = data.get('question', '').strip()

    if not user_input:
        return jsonify({'error': 'Câu hỏi không được để trống'}), 400

    try:
        prompt = build_prompt(user_input)
        response_text = get_gemini_response(prompt)
        return jsonify({'response': response_text})
    except ClientError as e:
        if '429' in str(e) or 'RESOURCE_EXHAUSTED' in str(e):
            msg = "⚠️ Đã vượt quá giới hạn quota API. Vui lòng thử lại sau vài phút."
        elif '404' in str(e) or 'NOT_FOUND' in str(e):
            msg = "⚠️ Model AI không tồn tại hoặc không được hỗ trợ."
        else:
            msg = f"⚠️ Lỗi API: {str(e)}"
        return jsonify({'error': msg}), 503
    except Exception as e:
        return jsonify({'error': f"⚠️ Lỗi không mong muốn: {str(e)}"}), 500


# ── Original HTML route (keep for standalone use) ───────────────────────────
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        try:
            user_input = request.form['user_input']
        except KeyError:
            user_input = ""

        try:
            prompt = build_prompt(user_input)
            gemini_response = get_gemini_response(prompt)
        except ClientError as e:
            if '429' in str(e) or 'RESOURCE_EXHAUSTED' in str(e):
                gemini_response = "⚠️ Đã vượt quá giới hạn quota API miễn phí. Vui lòng thử lại sau vài phút hoặc tạo API key mới tại https://aistudio.google.com/app/apikey"
            elif '404' in str(e) or 'NOT_FOUND' in str(e):
                gemini_response = "⚠️ Model AI không tồn tại hoặc không được hỗ trợ."
            else:
                gemini_response = f"⚠️ Lỗi API: {str(e)}"
        except Exception as e:
            gemini_response = f"⚠️ Đã xảy ra lỗi không mong muốn: {str(e)}"

        return render_template('index.html', user_input=user_input, response=gemini_response)

    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)