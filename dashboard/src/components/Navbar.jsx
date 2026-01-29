import React from 'react'
import { Layout, Typography, Space, Avatar } from 'antd'
import { UserOutlined, BellOutlined } from '@ant-design/icons'

const { Header } = Layout
const { Title } = Typography

function Navbar() {
  return (
    <Header style={{ 
      background: '#fff', 
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
        Sistema Maestro AMROIS
      </Title>
      
      <Space size="middle">
        <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
        <Avatar icon={<UserOutlined />} />
      </Space>
    </Header>
  )
}

export default Navbar