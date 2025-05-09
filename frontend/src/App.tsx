import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import ReviewTreeViewer from './components/ReviewTreeViewer';
import ReviewLogPage from './pages/ReviewLogPage';
import ReviewSchedulePage from './pages/ReviewSchedulePage';
import WeeklySchedulePage from './pages/WeeklySchedulePage';
import MnemonicPage from './pages/MnemonicPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        {/* 顶部导航 */}
        <nav className="bg-white shadow p-4 mb-6 flex gap-4 text-sm">
          <Link to="/review-tree" className="text-blue-600 hover:underline">
            📚 知识点树
          </Link>
          <Link to="/mnemonic" className="text-red-600 hover:underline">
            📖 第一站疾病口诀
          </Link>
          <Link to="/review-log" className="text-green-600 hover:underline">
            📋 复习记录
          </Link>
          <Link to="/review-schedule" className="text-purple-600 hover:underline">
            🕒 时间表
          </Link>
          <Link to="/weekly-schedule" className="text-pink-600 hover:underline">
            📆 周计划
          </Link>
        </nav>

        {/* 页面内容区域 */}
        <Routes>
          <Route path="/" element={<Navigate to="/review-tree" />} />
          <Route path="/review-tree" element={<ReviewTreeViewer />} />
          <Route path="/review-log" element={<ReviewLogPage />} />
          <Route path="/review-schedule" element={<ReviewSchedulePage />} />
          <Route path="/weekly-schedule" element={<WeeklySchedulePage />} />
          <Route path="/mnemonic" element={<MnemonicPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
