import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout, ConfigProvider, theme, App as AntdApp } from 'antd'
import Navbar from './components/Navbar'
import { LanguageProvider } from './contexts/LanguageContext'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Books from './pages/Books'
import BookDetail from './pages/BookDetail'
import Agents from './pages/Agents'
import Devices from './pages/Devices'
import Tasks from './pages/Tasks'
import Settings from './pages/Settings'

const { Content } = Layout

function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode')
    if (savedTheme) {
      setDarkMode(savedTheme === 'true')
    }
  }, [])

  const toggleTheme = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', newMode.toString())
  }

  return (
    <LanguageProvider>
      <ConfigProvider
        theme={{
          algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <AntdApp>
          <Layout style={{ minHeight: '100vh' }}>
            <Sidebar darkMode={darkMode} />
            <Layout>
              <Navbar darkMode={darkMode} toggleTheme={toggleTheme} />
              <Content style={{
                padding: '24px',
                background: darkMode ? '#141414' : '#f0f2f5',
                transition: 'all 0.2s'
              }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/books" element={<Books />} />
                  <Route path="/books/:id" element={<BookDetail />} />
                  <Route path="/agents" element={<Agents />} />
                  <Route path="/devices" element={<Devices />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Content>
            </Layout>
          </Layout>
        </AntdApp>
      </ConfigProvider>
    </LanguageProvider>
  )
}

export default App