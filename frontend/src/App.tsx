import { BrowserRouter, Routes, Route } from 'react-router'
import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="p-8 text-foreground">JobFlow</div>} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
