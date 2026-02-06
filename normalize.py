import os
import re
import unicodedata

def remove_vietnamese_accents(text):
    """
    Hàm chuyển đổi tiếng Việt có dấu sang không dấu
    """
    # Xử lý riêng ký tự đ/Đ vì unicodedata không tự xử lý được
    text = re.sub(r'[đ]', 'd', text)
    text = re.sub(r'[Đ]', 'D', text)
    
    # Chuẩn hóa unicode để tách dấu ra khỏi ký tự gốc
    text = unicodedata.normalize('NFKD', text)
    # Loại bỏ các ký tự dấu (non-spacing mark)
    text = text.encode('ASCII', 'ignore').decode('utf-8')
    return text

def normalize_filename(filename):
    """
    Chuyển tên file: "Vật Không Thể.png" -> "vat_khong_the.png"
    """
    # Tách tên file và đuôi file (extension)
    name, ext = os.path.splitext(filename)
    
    # 1. Bỏ dấu tiếng Việt
    new_name = remove_vietnamese_accents(name)
    
    # 2. Chuyển thành chữ thường
    new_name = new_name.lower()
    
    # 3. Thay thế các ký tự không phải chữ/số (như khoảng trắng, dấu -, ...) thành dấu gạch dưới
    # Dùng regex để thay thế 1 hoặc nhiều ký tự đặc biệt liên tiếp bằng 1 dấu _
    new_name = re.sub(r'[^a-z0-9]+', '_', new_name)
    
    # 4. Loại bỏ dấu _ ở đầu hoặc cuối nếu có
    new_name = new_name.strip('_')
    
    # Ghép lại với đuôi file gốc
    return f"{new_name}{ext}"

def normalize_folder_weapons(folder_path):
    """
    Duyệt qua folder và đổi tên tất cả file
    """
    if not os.path.exists(folder_path):
        print(f"❌ Thư mục '{folder_path}' không tồn tại!")
        return

    print(f"📂 Đang xử lý thư mục: {folder_path}...")
    
    count = 0
    # Lấy danh sách file
    files = os.listdir(folder_path)
    
    for filename in files:
        # Bỏ qua các file hệ thống ẩn (bắt đầu bằng dấu chấm)
        if filename.startswith('.'):
            continue
            
        old_path = os.path.join(folder_path, filename)
        
        # Chỉ xử lý nếu là file (không đổi tên thư mục con)
        if os.path.isfile(old_path):
            new_filename = normalize_filename(filename)
            new_path = os.path.join(folder_path, new_filename)
            
            # Chỉ đổi tên nếu tên mới khác tên cũ
            if filename != new_filename:
                try:
                    os.rename(old_path, new_path)
                    print(f"✅ Đổi tên: '{filename}'  --->  '{new_filename}'")
                    count += 1
                except OSError as e:
                    print(f"❌ Lỗi khi đổi tên '{filename}': {e}")
            else:
                # print(f"⏩ Bỏ qua: '{filename}' (Đã chuẩn)")
                pass

    print(f"\n🎉 Hoàn tất! Đã đổi tên {count} file.")

# --- CHẠY CHƯƠNG TRÌNH ---
if __name__ == "__main__":
    # Đường dẫn tới thư mục chứa ảnh vũ khí
    # Nếu thư mục 'weapons' nằm cùng chỗ với file code này thì để nguyên
    folder_path = "weapons" 
    
    normalize_folder_weapons(folder_path)