import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import RegisterPage from './pages/RegisterPage/RegisterPage.jsx';
import AuthorizationPage from './pages/AuthorizationPage/AuthorizationPage.jsx';
import ChatPage from './pages/ChatPage/ChatPage.jsx';

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthorizationPage/>,
  },
  {
    path: '/register',
    element: <RegisterPage/>,
  },
  {
    path: '/',
    element: <ChatPage/>,
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
