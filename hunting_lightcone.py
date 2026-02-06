import os
import time
import requests
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

def clean_filename(name):
    """Làm sạch tên file để tránh ký tự lỗi"""
    return "".join(x for x in name if x.isalnum() or x in " -_").strip()

def crawl_hoyolab_weapons():
    url = "https://wiki.hoyolab.com/pc/hsr/aggregate/107?lang=vi-vn"
    
    # --- CẤU HÌNH SELENIUM ---
    chrome_options = Options()
    chrome_options.add_argument("--headless") # Chạy ẩn không hiện cửa sổ trình duyệt (bỏ dòng này nếu muốn xem nó chạy)
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    print("--- Đang khởi động trình duyệt ảo... ---")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    
    try:
        print(f"Đang truy cập: {url}")
        driver.get(url)
        time.sleep(5) # Chờ trang load lần đầu

        # --- TỰ ĐỘNG CUỘN TRANG (INFINITE SCROLL) ---
        print("Đang cuộn trang để tải toàn bộ danh sách...")
        last_height = driver.execute_script("return document.body.scrollHeight")
        while True:
            # Cuộn xuống cuối trang
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(3) # Chờ ảnh load
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break # Đã cuộn hết
            last_height = new_height
        
        # --- PHÂN TÍCH HTML ---
        print("Đang quét dữ liệu...")
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Tìm tất cả thẻ article chứa vũ khí (Dựa trên HTML bạn cung cấp)
        cards = soup.find_all('article', class_='rpg-show-weapon-item')
        
        if not os.path.exists('weapons'):
            os.makedirs('weapons')

        print(f"Tìm thấy {len(cards)} Nón Ánh Sáng. Bắt đầu tải...")

        count = 0
        for card in cards:
            try:
                # 1. Lấy Tên
                name_div = card.find('div', class_='rpg-character-card-name')
                if not name_div: continue
                raw_name = name_div.text.strip()
                file_name = clean_filename(raw_name)

                # 2. Lấy Ảnh (class rpg-weapon-card-avatar-img)
                img_tag = card.find('img', class_='rpg-weapon-card-avatar-img')
                
                if img_tag and 'src' in img_tag.attrs:
                    img_url = img_tag['src']
                    
                    # Tải ảnh
                    response = requests.get(img_url, timeout=10)
                    if response.status_code == 200:
                        # Convert WebP -> PNG
                        image_obj = Image.open(BytesIO(response.content))
                        save_path = f"weapons/{file_name}.png"
                        image_obj.save(save_path, "PNG")
                        
                        count += 1
                        print(f"[OK] {file_name}")
                    else:
                        print(f"[Lỗi Tải] {file_name}")
                else:
                    print(f"[Bỏ qua] Không thấy ảnh của {raw_name}")

            except Exception as e:
                print(f"[Exception] Lỗi tại {raw_name if 'raw_name' in locals() else 'Unknown'}: {e}")

    finally:
        driver.quit()
        print(f"\n--- Hoàn tất! Đã tải {count} ảnh vào thư mục 'weapons/' ---")

if __name__ == "__main__":
    crawl_hoyolab_weapons()