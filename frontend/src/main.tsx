import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import ReviewTreeViewer from './components/ReviewTreeViewer'  // <-- 指向该目录即可

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReviewTreeViewer />
  </React.StrictMode>
)
