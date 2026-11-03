# KẾ HOẠCH TRIỂN KHAI: AI VOICE CLONING & SINGING VOICE CONVERSION (SVC)

## 1. Phân Tích Hiện Trạng & Khả Năng Triển Khai Thực Tế
- **Môi trường**: Docker Container Linux (x86/aarch64), Python 3.12, FFmpeg, PyWorld (Phase Vocoder), SciPy, NumPy.
- **Phần cứng**: CPU đa lõi không GPU chuyên dụng trực tiếp trong container. Do đó, việc train model Deep Learning nặng hàng giờ (như Full RVC V2 Epochs 300) trực tiếp trên CPU sẽ gây sập hoặc nghẽn server.
- **Kiến trúc giải pháp thông minh**:
  1. **Vocal Extraction Engine**: Kết hợp M/S Spectral Inversion (Mid-Side vocal cancellation/isolation) + Dải lọc thích nghi Bandpass (100Hz - 8.5kHz) + Voice Activity Detection (VAD) + High-pass filter bằng FFmpeg & SciPy DSP. Cho phép tách Vocal và Instrumental với tốc độ tính bằng giây.
  2. **Voice Profiling & Timbre Feature Extraction**: Phân tích phổ Formant trung bình, Pitch Histogram, Vocal Tract Ratio, Aperiodicity distribution và Envelope Profile từ bản thu người dùng để tạo ra Voice Model (.json + spectral templates).
  3. **AI Singing Voice Conversion (SVC)**: Giữ 100% cao độ (Pitch / F0), giữ 100% nhịp phách, giữ nguyên lời bài hát và luyến láy của bản hát mẫu (Guide Vocal), đồng thời biến đổi Formant Envelope sang âm sắc của Voice Model đã chọn bằng WORLD Vocoder Resynthesis + Glottal Warmth Shaper.
  4. **An toàn & Bản quyền**: Bắt buộc xác nhận cam kết bản quyền của chủ sở hữu giọng hát (`HasExplicitOwnerConsent`, `OwnerFullName`, `ConsentStatement`). Cung cấp chức năng xóa Voice Model bất cứ lúc nào.

## 2. Các Thành Phần Sẽ Triển Khai

1. **Python SVC Engine** (`backend/src/MusicStudio.API/voice_conversion_engine.py`):
   - `extract_vocal_and_instrumental(audio_path)`: Tách giọng hát và nhạc nền.
   - `train_voice_model(audio_path, voice_id, gender)`: Làm sạch, khử ồn, trích xuất đặc trưng âm sắc (Spectral Formants, Pitch Range, Formant Warp Ratio).
   - `convert_singing_voice(guide_vocal_path, voice_model_path, semitone_shift)`: Chuyển đổi giọng hát mẫu sang giọng đích.
   - `mix_converted_song(vocal_path, instrumental_path)`: Mix bản vocal mới với instrumental.
2. **Backend API Endpoints** (`VoicesController.cs` & C# DTOs):
   - `POST /api/v1/voices/extract`: Tách vocal/instrumental.
   - `POST /api/v1/voices/train`: Huấn luyện & tạo Voice Model từ bản thu được cấp quyền.
   - `POST /api/v1/voices/convert`: Chuyển đổi giọng hát từ bản hát mẫu (Guide Vocal) sang Voice Model.
   - `DELETE /api/v1/voices/{id}`: Xóa Voice Model và dữ liệu liên quan.
3. **Frontend UI**:
   - Thêm trang chuyên biệt **Voice Studio** (`/voices` hoặc tích hợp tab trong Studio):
     - Tab 1: **Tách Giọng Hát (Vocal Extraction)**
     - Tab 2: **Tạo & Quản Lý Voice Model (Voice Training & Consent)**
     - Tab 3: **Chuyển Đổi Giọng Hát (Singing Voice Conversion)**
   - Cập nhật menu sidebar.
4. **Kiểm Thử Đo Lường**:
   - Thực thi bài test chuyển đổi mẫu và xuất báo cáo đối chiếu âm học.

