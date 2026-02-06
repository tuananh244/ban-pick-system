import os
import requests
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO

def download_character_images_final():
    url = "https://www.prydwen.gg/star-rail/characters"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    print(f"--- Đang truy cập: {url} ---")
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print("Không vào được trang web.")
        return

    soup = BeautifulSoup(response.content, 'html.parser')
    
    if not os.path.exists('images'): os.makedirs('images')

    cards = soup.find_all('div', class_='avatar-card')
    print(f"Tìm thấy {len(cards)} nhân vật. Bắt đầu tải ảnh...")

    count = 0
    for card in cards:
        try:
            # 1. Lấy tên
            name_tag = card.find('span', class_='emp-name')
            if not name_tag: continue
            name = name_tag.text.strip()
            clean_name = "".join(x for x in name if x.isalnum() or x in " -_").strip()

            img_url = None
            
            # --- CHIẾN THUẬT TÌM ẢNH MỚI (Ưu tiên độ ổn định) ---
            
            # Cách 1: Tìm trong thẻ <noscript>. 
            # Web Gatsby luôn để ảnh gốc trong <noscript> cho trình duyệt tắt JS/Bot. 
            # Đây là cách lấy link sạch nhất.
            noscript_tag = card.find('noscript')
            if noscript_tag:
                # Parse lại nội dung bên trong noscript vì nó được coi là text thuần
                ns_soup = BeautifulSoup(noscript_tag.decode_contents(), 'html.parser')
                ns_img = ns_soup.find('img')
                if ns_img:
                    img_url = ns_img.get('src')

            # Cách 2: Nếu không có noscript, tìm thẻ img chính
            if not img_url:
                img_tag = card.find('img', attrs={"data-main-image": True})
                if img_tag:
                    # Ưu tiên lấy src
                    img_url = img_tag.get('src')
                    
                    # Nếu src không có hoặc là data URI, thử lấy từ srcset (chứa ảnh độ phân giải cao)
                    if not img_url or img_url.startswith('data:'):
                        srcset = img_tag.get('srcset')
                        if srcset:
                            # srcset dạng: "link1 94w, link2 187w, link3 374w"
                            # Lấy cái cuối cùng (thường là to nhất)
                            last_item = srcset.split(',')[-1].strip() # "link3 374w"
                            img_url = last_item.split(' ')[0] # "link3"

            # --- KẾT THÚC TÌM ẢNH ---

            if img_url:
                # Xử lý link tương đối
                if img_url.startswith('/'):
                    img_url = "https://www.prydwen.gg" + img_url
                
                # Bỏ qua nếu vẫn vớ phải ảnh svg data
                if "data:image" in img_url:
                    print(f"[Bỏ qua] {name}: Chỉ tìm thấy ảnh data placeholder.")
                    continue

                # Tải ảnh
                img_res = requests.get(img_url, headers=headers, timeout=15)
                if img_res.status_code == 200:
                    image_obj = Image.open(BytesIO(img_res.content))
                    save_path = f"images/{clean_name}.png"
                    image_obj.save(save_path, "PNG")
                    count += 1
                    print(f"[OK] {clean_name}")
                else:
                    print(f"[Lỗi Tải] {name} - Code: {img_res.status_code}")
            else:
                print(f"[Không tìm thấy link] {name}")

        except Exception as e:
            # In chi tiết lỗi để debug nếu còn sai
            print(f"[Exception] {name}: {str(e)}")

    print(f"\n--- Hoàn tất! Đã tải {count} ảnh ---")

if __name__ == "__main__":
    download_character_images_final()