import React from 'react'
import { Card, Row, Col, Statistic, Progress, Typography, Space } from 'antd'
import { 
  BookOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons'

const { Title } = Typography

function Dashboard() {
  // Datos de ejemplo - en producción vendrían de la API
  const stats = {
    totalBooks: 620,
    processedBooks: 450,
    pendingBooks: 120,
    processingBooks: 50,
    activeDevices: 25,
    completedTasks: 1250,
    systemHealth: 95
  }

  return (
    <div>
      <Title level={2}>🎯 AMROIS Dashboard</Title>
      
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
    </div>
  )
}

export default Dashboard