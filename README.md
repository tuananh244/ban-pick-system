# ban-pick-system

**Project Overview**
 - **Description:**: Ứng dụng web cho chế độ ban/pick (draft) — giao diện frontend bằng React + Vite, backend bằng TypeScript (Express + Socket.IO). Dự án hỗ trợ quản lý phiên draft, pick/ban nhân vật và vũ khí, dùng Firebase cho một số chức năng.

**Features**
 - **Real-time:**: Giao tiếp thời gian thực qua `socket.io`.
 - **Admin tools:**: Bảng điều khiển admin để điền pool, cấu hình, và kết quả.
 - **Data import:**: Hỗ trợ CSV (characters, weapons) để nạp dữ liệu.

**Getting Started**
 - **Prerequisites:**: Node.js (>=16), npm hoặc yarn.

**Install**
 - **Root deps:**: (nếu cần) chạy `npm install` ở root.
 - **Backend:**: vào thư mục `backend` và cài deps:

	 `cd backend`
	 `npm install`

 - **Frontend:**: vào thư mục `frontend` và cài deps:

	 `cd frontend`
	 `npm install`

**Run (development)**
 - **Backend (dev):**: trong `backend` chạy:

	 `npm run dev`

	 (script dùng `ts-node-dev` để reload)
 - **Frontend (dev):**: trong `frontend` chạy:

	 `npm run dev`

**Build / Preview**
 - **Frontend build:**: trong `frontend` chạy `npm run build` rồi `npm run preview` để xem bản build cục bộ.

**Environment / Config**
 - **Backend env:**: cấu hình môi trường nằm tại `backend/src/config/env.ts`. Thêm các biến môi trường cần thiết (ví dụ: PORT, JWT secret, Firebase creds nếu dùng).
 - **Frontend env:**: xem `frontend/src/config/env.ts` để cấu hình client (API base url, firebase config).

**Project Structure (tổng quan)**
 - **Root:**: một số script Python và tệp hỗ trợ (ví dụ `checking.py`, `hunting.py`).
 - **backend/**: server TypeScript (`src/server.ts`), handlers, services, config.
 - **frontend/**: app React (Vite) trong `src/` gồm components, pages, utils, và assets trong `public/`.

**Scripts**
 - **backend:**: `npm run dev` (phát triển), `npm start` (chạy bằng `ts-node`).
 - **frontend:**: `npm run dev`, `npm run build`, `npm run preview`.

**Importing Data**
 - CSV characters/weapons nằm trong `frontend/public/characters.csv` và `frontend/public/weapons.csv`. Có script và loader trong `frontend/src/loader` để đọc và xử lý.
---

> Đây là sản phẩm mang tính vui và đây là open-source nên hy vọng mọi người có thể hoan hỉ sử dụng cho mục đích vui vẻ.
