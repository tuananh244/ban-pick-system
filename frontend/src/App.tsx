import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import DraftRoomChar from './pages/DraftRoomChar'
import WeaponDraftRoom from './pages/DraftRoomWea'
import DraftRoomBanPick from './pages/DraftRoomBanPick'
import DraftAdminFill from './pages/DraftAdminFill'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/characters" element={<DraftRoomChar />} />
        <Route path="/weapons" element={<WeaponDraftRoom />} />
        <Route path="/ban-pick" element={<DraftRoomBanPick />} />
        <Route path="/admin-fill" element={<DraftAdminFill />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
