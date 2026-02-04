import React from 'react'
import { Layout, Typography, Space, Avatar, Switch } from 'antd'
import { UserOutlined, BellOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons'

const { Header } = Layout
const { Title } = Typography

function Navbar({ darkMode, toggleTheme }) {
  return (
    <Header style={{
      background: darkMode ? '#001529' : '#fff',
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: darkMode ? '1px solid #303030' : '1px solid #f0f0f0',
      transition: 'all 0.2s'
    }}>
      <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
        Sistema Maestro AMROIS
      </Title>

      <Space size="middle">
        <Switch
          checked={darkMode}
          onChange={toggleTheme}
          checkedChildren={<BulbFilled />}
          unCheckedChildren={<BulbOutlined />}
        />
        <BellOutlined style={{ fontSize: '18px', cursor: 'pointer', color: darkMode ? '#fff' : 'inherit' }} />
        <Avatar icon={<UserOutlined />} />
      </Space>
    </Header>
  )
}

export default Navbar