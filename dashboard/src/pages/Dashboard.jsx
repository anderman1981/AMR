import React from 'react'
import { useQuery } from 'react-query'
import { statsService } from '../services/stats'
import { Card, Row, Col, Statistic, Progress, Typography, Space } from 'antd'
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import GlobalChat from '../components/GlobalChat'

const { Title } = Typography

function Dashboard() {
  const { data: stats, isLoading } = useQuery('system-stats', statsService.getSystemStats, {
    refetchInterval: 30000 // Refresh every 30s
  })

  // Fallback defaults
  const data = stats || {
    totalBooks: 0,
    processedBooks: 0,
    pendingBooks: 0,
    processingBooks: 0,
    activeDevices: 0,
    completedTasks: 0,
    systemHealth: 100
  }

  return (
    <div>
      <Title level={2}>🎯 AMROIS Dashboard</Title>

      <Row gutter={[16, 16]}>
        {/* Global Coach Chat - Full Width or Large Column */}
        <Col xs={24} lg={16}>
           <GlobalChat />
        </Col>

        {/* Stats Column */}
        <Col xs={24} lg={8}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card loading={isLoading}>
                <Statistic
                  title="Total de Libros"
                  value={data.totalBooks}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Card loading={isLoading}>
                <Statistic
                  title="Procesados"
                  value={data.processedBooks}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Card loading={isLoading}>
                <Statistic
                  title="Tareas Completadas"
                  value={data.completedTasks}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Card title="💚 Salud del Sistema" loading={isLoading}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={data.systemHealth}
                    format={(percent) => `${percent}%`}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                    width={80}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Additional Stats Row */}
        <Col xs={24} sm={12} md={6}>
          <Card loading={isLoading}>
            <Statistic
              title="En Proceso"
              value={data.processingBooks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card loading={isLoading}>
            <Statistic
              title="Pendientes"
              value={data.pendingBooks}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#d9d9d9' }}
            />
          </Card>
        </Col>

        {/* Progreso de Procesamiento */}
        <Col xs={24} md={12}>
          <Card title="📊 Progreso de Procesamiento" loading={isLoading}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ marginBottom: 8 }}>
                  <span>Libros Procesados</span>
                  <span style={{ float: 'right' }}>
                    {data.processedBooks}/{data.totalBooks}
                  </span>
                </div>
                <Progress
                  percent={data.totalBooks > 0 ? Math.round((data.processedBooks / data.totalBooks) * 100) : 0}
                  status="active"
                  strokeColor="#52c41a"
                />
              </div>
            </Space>
          </Card>
        </Col>

        {/* Dispositivos Activos */}
        <Col xs={24} md={12}>
          <Card title="🖥️ Dispositivos Activos" loading={isLoading}>
            <Statistic
              value={data.activeDevices}
              suffix="/ 50"
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress
              percent={Math.round((data.activeDevices / 50) * 100)}
              size="small"
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>

      </Row>
    </div>
  )
}

export default Dashboard