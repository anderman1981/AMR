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
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  )
}

export default Sidebar