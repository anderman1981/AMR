import React from 'react'
import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  BookOutlined,
  DesktopOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  RobotOutlined
} from '@ant-design/icons'
import versionInfo from '../version.json'
import { useNavigate, useLocation } from 'react-router-dom'

const { Sider } = Layout

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard'
    },
    {
      key: '/coach',
      icon: <span style={{ fontSize: '16px' }}>🤖</span>, // Using emoji or icon
      label: 'Coach AI'
    },
    {
      key: '/books',
      icon: <BookOutlined />,
      label: 'Libros'
    },
    {
      key: '/agents',
      icon: <RobotOutlined />,
      label: 'Agentes'
    },
    {
      key: '/devices',
      icon: <DesktopOutlined />,
      label: 'Dispositivos'
    },
    {
      key: '/tasks',
      icon: <UnorderedListOutlined />,
      label: 'Tareas'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Configuración'
    }
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  return (
    <Sider width={200} className="site-layout-background">
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '18px'
      }}>
        AMROIS
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ height: 'calc(100% - 200px)', borderRight: 0, overflowY: 'auto' }}
        items={menuItems}
        onClick={handleMenuClick}
      />

      {/* System Status Footer - Environment Aware */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: '16px',
        background: '#001529',
        borderTop: '1px solid #1890ff',
        color: 'rgba(255, 255, 255, 0.65)',
        fontSize: '12px'
      }}>
        {import.meta.env.DEV ? (
          // Development View: Full Details
          <>
            <div style={{ marginBottom: '8px', color: 'white', fontWeight: 'bold' }}>System Status (DEV)</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Version:</span>
              <span>v{versionInfo.major}.{versionInfo.minor}.{versionInfo.patch}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Branch:</span>
              <span style={{ color: '#1890ff' }}>{versionInfo.branch}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Status:</span>
              <span style={{ color: '#52c41a' }}>● Online</span>
            </div>
          </>
        ) : (
          // Production View: Minimal
          <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
            v{versionInfo.major}.{versionInfo.minor}.{versionInfo.patch}
          </div>
        )}
      </div>
    </Sider>
  )
}

export default Sidebar