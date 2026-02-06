import React, { useEffect, useState } from 'react'

// 1. CẬP NHẬT INTERFACE ĐỂ NHẬN HÀM TỪ PARENT
type Props = {
  isOpen: boolean
  onClose: () => void
  onSelectBg: (url: string) => void // <--- Thêm dòng này
}

// Danh sách file ảnh trong public/images/background/
const BACKGROUND_FILES = [
  'image1.png',
  'image2.png',
  'image3.png'
]

const PRESETS = BACKGROUND_FILES.map(fileName => ({
  id: fileName,
  label: fileName.split('.')[0].toUpperCase(),
  url: `/images/background/${fileName}`
}))

const STORAGE_KEY = 'landingBgUrl'

const BackgroundSettings: React.FC<Props> = ({ isOpen, onClose, onSelectBg }) => {
  // Mặc định chọn ảnh đầu tiên
  const [value, setValue] = useState<string>(PRESETS[0].url)
  const [customUrl, setCustomUrl] = useState('')

  // Khi mở popup, kiểm tra xem có ảnh nào đã lưu trước đó không
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setValue(saved)
      // (Tuỳ chọn) Gọi dòng dưới nếu muốn đồng bộ lại Landing ngay khi mở popup
      // onSelectBg(saved) 
    }
  }, [])

  // Hàm xử lý logic chọn ảnh
  const applyValue = (v: string) => {
    // Regex kiểm tra định dạng ảnh cơ bản
    const imageRegex = /\.(jpeg|jpg|gif|png|webp|avif)$|^data:image\//i;
    
    // Nếu là link online (http) mà không đúng đuôi ảnh thì cảnh báo
    if (v.startsWith('http') && !imageRegex.test(v)) {
      alert("Định dạng tệp không hợp lệ! Vui lòng sử dụng URL ảnh (png, jpg, webp, gif).")
      return
    }

    // 2. GỌI HÀM CỦA PARENT ĐỂ THAY ĐỔI GIAO DIỆN NGAY LẬP TỨC
    onSelectBg(v)

    // Lưu vào LocalStorage để lần sau vào lại web vẫn nhớ
    localStorage.setItem(STORAGE_KEY, v)
    
    // Cập nhật state nội bộ để hiển thị viền xanh (active)
    setValue(v)
  }

  const onSaveCustom = () => {
    if (!customUrl.trim()) return
    applyValue(customUrl.trim())
    setCustomUrl('')
    onClose() // Đóng popup sau khi nhập link custom
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[300] p-4">
      {/* Backdrop mờ */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-2xl p-8 rounded-[32px] bg-slate-900 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black italic uppercase text-cyan-400 tracking-tighter">
            Hệ thống hình nền
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-2xl">&times;</button>
        </div>

        {/* Khu vực danh sách ảnh */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[40vh] overflow-y-auto pr-2 mb-8 custom-scrollbar">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyValue(p.url)}
              className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                value === p.url ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'border-white/5 hover:border-white/20'
              }`}
            >
              {/* Ảnh Thumbnail */}
              <div 
                className="h-24 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
                style={{ backgroundImage: `url('${p.url}')` }} 
              />
              
              {/* Overlay Gradient & Tên */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
              <div className="absolute bottom-2 left-0 right-0 text-[10px] font-black text-center text-white tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                {p.label}
              </div>

              {/* Icon Check khi đang chọn */}
              {value === p.url && (
                <div className="absolute top-2 right-2 bg-cyan-500 rounded-full p-1 shadow-lg">
                  <svg className="w-3 h-3 text-slate-950" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Input URL tùy chỉnh */}
        <div className="space-y-4 pt-6 border-t border-white/5">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Hoặc sử dụng liên kết bên ngoài</p>
          <div className="flex gap-3">
            <input
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Dán link ảnh tại đây (webp, png, jpg...)"
              className="flex-1 px-5 py-4 rounded-2xl bg-slate-950/50 border border-white/10 text-sm outline-none focus:border-cyan-500/50 transition-all text-white placeholder:text-slate-600"
            />
            <button 
              onClick={onSaveCustom} 
              className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black rounded-2xl text-xs uppercase transition-all shadow-lg active:scale-95 whitespace-nowrap"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BackgroundSettings