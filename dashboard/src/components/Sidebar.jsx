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

      <div style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: '12px 16px',
        background: '#001529',
        borderTop: '1px solid #1890ff',
        color: 'rgba(255, 255, 255, 0.45)',
        fontSize: '11px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '2px', textTransform: 'lowercase' }}>
          {versionInfo.branch}
        </div>
        <div style={{ fontWeight: '500' }}>
          v{versionInfo.major}.{versionInfo.minor}.{versionInfo.patch}
        </div>
      </div>
    </Sider>
  )
}

export default Sidebar