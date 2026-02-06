import csv
import os

def check_weapon_assets(csv_path, images_folder):
    """
    Hàm kiểm tra đồng bộ giữa file CSV và thư mục ảnh
    """
    print(f"--- BẮT ĐẦU KIỂM TRA ---")
    print(f"📁 CSV File: {csv_path}")
    print(f"📂 Folder Ảnh: {images_folder}\n")

    # 1. Kiểm tra đường dẫn tồn tại
    if not os.path.exists(csv_path):
        print(f"❌ Lỗi: Không tìm thấy file CSV tại '{csv_path}'")
        return
    if not os.path.exists(images_folder):
        print(f"❌ Lỗi: Không tìm thấy thư mục ảnh tại '{images_folder}'")
        return

    # 2. Đọc file CSV và lấy danh sách ảnh yêu cầu
    csv_files = set()
    csv_data_map = {} # Để lưu dòng CSV tương ứng giúp dễ debug
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            
            # Bỏ qua dòng tiêu đề (dòng 1)
            header = next(reader, None) 
            
            for row_idx, row in enumerate(reader, start=2):
                if not row: continue # Bỏ qua dòng trống
                
                # Dựa vào mẫu bạn đưa: 
                # 1, Tên, 4, Path, [TÊN_FILE_ẢNH], 0, 0...
                # Index của tên file ảnh là 4
                if len(row) > 4:
                    # .strip() để loại bỏ khoảng trắng thừa nếu có (vd: " file.png ")
                    img_name = row[4].strip()
                    
                    if img_name:
                        csv_files.add(img_name)
                        csv_data_map[img_name] = f"Dòng {row_idx}: {row[1]}"
    except Exception as e:
        print(f"❌ Lỗi khi đọc CSV: {e}")
        return

    # 3. Quét thư mục ảnh thực tế
    real_files = set()
    for f in os.listdir(images_folder):
        # Chỉ lấy file ảnh (png, jpg, webp...), bỏ qua file rác hệ thống
        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            real_files.add(f)

    # 4. So sánh và Phân loại
    
    # Những file có trong cả 2 bên (OK)
    matched = csv_files.intersection(real_files)
    
    # Những file có trong CSV nhưng KHÔNG CÓ trong thư mục (Thiếu ảnh)
    missing_in_folder = csv_files - real_files
    
    # Những file có trong thư mục nhưng KHÔNG CÓ trong CSV (Thừa ảnh / Chưa nhập liệu)
    extra_in_folder = real_files - csv_files

    # 5. Xuất báo cáo
    print(f"📊 TỔNG KẾT:")
    print(f"   - Tổng trong CSV: {len(csv_files)}")
    print(f"   - Tổng trong Folder: {len(real_files)}")
    print(f"   - Khớp (OK): {len(matched)}")
    print("-" * 50)

    # Báo cáo OK (chỉ hiện số lượng hoặc list nếu cần)
    # print(f"✅ OK ({len(matched)} files):") 
    
    # Báo cáo THIẾU ẢNH (Quan trọng)
    if missing_in_folder:
        print(f"\n❌ CẢNH BÁO: CSV gọi tên nhưng KHÔNG THẤY file trong thư mục ({len(missing_in_folder)} files):")
        print("   (Bạn cần tải ảnh về hoặc đổi tên file trong folder cho khớp)")
        for name in missing_in_folder:
            info = csv_data_map.get(name, "Unknown")
            print(f"   - {name}  (Thuộc về: {info})")
    else:
        print("\n✅ Tuyệt vời: Không bị thiếu file ảnh nào!")

    # Báo cáo THỪA ẢNH (Quan trọng)
    if extra_in_folder:
        print(f"\n⚠️ CẢNH BÁO: Có ảnh trong thư mục nhưng CHƯA CÓ trong CSV ({len(extra_in_folder)} files):")
        print("   (Bạn cần thêm dòng mới vào CSV cho các ảnh này)")
        for name in extra_in_folder:
            print(f"   - {name}")
    else:
        print("\n✅ Tuyệt vời: Không có file ảnh thừa nào!")

# --- CẤU HÌNH ĐƯỜNG DẪN ---
if __name__ == "__main__":
    # Thay đổi đường dẫn tương ứng với máy của bạn
    # Ví dụ: File csv nằm ở public/data/weapons.csv
    csv_file_path = "frontend/public/data/weapons.csv" 
    
    # Ví dụ: Folder ảnh nằm ở public/images/weapons
    images_dir_path = "frontend/public/images/weapons"
    
    check_weapon_assets(csv_file_path, images_dir_path)