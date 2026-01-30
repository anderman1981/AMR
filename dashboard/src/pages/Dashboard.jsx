import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Progress, Typography, Space, Spin } from 'antd'
import { 
  BookOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  DatabaseOutlined
} from '@ant-design/icons'
import { getBooks, getDevices } from '../services/books'

const { Title } = Typography

function Dashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    processedBooks: 0,
    pendingBooks: 0,
    processingBooks: 0,
    activeDevices: 0,
    completedTasks: 0,
    systemHealth: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch books data
        const booksResponse = await getBooks()
        const books = booksResponse.data || []
        
        // Calculate book statistics
        const totalBooks = books.length
        const processedBooks = books.filter(book => book.status === 'processed').length
        const processingBooks = books.filter(book => book.status === 'processing').length
        const pendingBooks = books.filter(book => book.status === 'pending').length
        
        // For now, simulate devices and tasks data
        // TODO: Implement real API endpoints for devices and tasks
        const activeDevices = 0 // Will be updated when devices API is ready
        const completedTasks = 0 // Will be updated when tasks API is ready
        const systemHealth = 95 // Default health score
        
        setStats({
          totalBooks,
          processedBooks,
          pendingBooks,
          processingBooks,
          activeDevices,
          completedTasks,
          systemHealth
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Title level={2}>🎯 AMROIS Dashboard</Title>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" tip="Cargando datos del sistema..." />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
        {/* Estadísticas de Libros */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total de Libros"
              value={stats.totalBooks}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Procesados"
              value={stats.processedBooks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="En Proceso"
              value={stats.processingBooks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pendientes"
              value={stats.pendingBooks}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#d9d9d9' }}
            />
          </Card>
        </Col>

        {/* Progreso de Procesamiento */}
        <Col xs={24} md={12}>
          <Card title="📊 Progreso de Procesamiento">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ marginBottom: 8 }}>
                  <span>Libros Procesados</span>
                  <span style={{ float: 'right' }}>
                    {stats.processedBooks}/{stats.totalBooks}
                  </span>
                </div>
                <Progress 
                  percent={Math.round((stats.processedBooks / stats.totalBooks) * 100)} 
                  status="active"
                  strokeColor="#52c41a"
                />
              </div>
            </Space>
          </Card>
        </Col>

        {/* Dispositivos Activos */}
        <Col xs={24} md={12}>
          <Card title="🖥️ Dispositivos Activos">
            <Statistic
              value={stats.activeDevices}
              suffix="/ 50"
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress 
              percent={Math.round((stats.activeDevices / 50) * 100)} 
              size="small"
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>

        {/* Tareas Completadas */}
        <Col xs={24} md={12}>
          <Card title="✅ Tareas Completadas">
            <Statistic
              value={stats.completedTasks}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        {/* Salud del Sistema */}
        <Col xs={24} md={12}>
          <Card title="💚 Salud del Sistema">
            <Progress
              type="circle"
              percent={stats.systemHealth}
              format={(percent) => `${percent}%`}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </Card>
        </Col>
      </Row>
      )}
    </div>
  )
}

export default Dashboard