import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { statsService } from '../services/stats'
import { Card, Row, Col, Statistic, Progress, Typography, Space, Table, Tag } from 'antd'
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  RobotOutlined,
  BulbOutlined,
  FileTextOutlined,
  SnippetsOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

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
    systemHealth: 100,
    contentStats: { quotes: 0, summaries: 0, insights: 0 },
    agentStats: { breakdown: [], totalExecutionTime: 0 },
    brainMetrics: { score: 0, level: 1 }
  }

  // Agent Table Columns
  const agentColumns = [
    { title: 'Agente', dataIndex: 'name', key: 'name', render: text => <Tag color="blue">{text.toUpperCase()}</Tag> },
    { title: 'Ejecuciones', dataIndex: 'count', key: 'count' },
    {
      title: 'Uso (%)',
      dataIndex: 'percentage',
      key: 'percentage',
      render: percent => <Progress percent={percent} size="small" />
    }
  ]

  return (
    <div>
      <Title level={2}>🎯 AMROIS Dashboard</Title>

      {/* Top Row: Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card loading={isLoading}>
            <Statistic
              title="Libros Procesados"
              value={data.processedBooks}
              suffix={`/ ${data.totalBooks}`}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
            <Progress
              percent={data.totalBooks > 0 ? Math.round((data.processedBooks / data.totalBooks) * 100) : 0}
              status="active"
              strokeColor="#52c41a"
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={isLoading}>
            <Statistic
              title="Libros Pendientes"
              value={data.pendingBooks}
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>
              En cola de procesamiento
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={isLoading}>
            <Statistic
              title="Tiempo Total Ejecución"
              value={(data.agentStats?.totalExecutionTime / 60000).toFixed(1)}
              suffix="min"
              prefix={<RobotOutlined style={{ color: '#1890ff' }} />}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>
              Tiempo de cómputo de agentes
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        {/* Brain Metrics */}
        <Col xs={24} md={12} lg={8}>
          <Card title="🧠 Nivel de Conocimiento (Brain IQ)" loading={isLoading} style={{ height: '100%' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Nivel"
                  value={data.brainMetrics?.level || 1}
                  prefix="Lvl."
                  valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Score (XP)"
                  value={data.brainMetrics?.score || 0}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 24 }}>
              <Progress
                percent={Math.min(100, ((data.brainMetrics?.score % 100) || 0))}
                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                showInfo={false}
              />
              <div style={{ textAlign: 'right', fontSize: '12px', marginTop: 4, color: '#ccc' }}>
                Próximo nivel: {((Math.floor((data.brainMetrics?.score || 0) / 100) + 1) * 100)} XP
              </div>
            </div>
          </Card>
        </Col>

        {/* Content Stats */}
        <Col xs={24} md={12} lg={8}>
          <Card title="📚 Contenido Generado" loading={isLoading} style={{ height: '100%' }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Citas Extraídas"
                  value={data.contentStats?.quotes || 0}
                  prefix={<SnippetsOutlined />}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Resúmenes"
                  value={data.contentStats?.summaries || 0}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Insights Clave"
                  value={data.contentStats?.insights || 0}
                  prefix={<BulbOutlined />}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Total Cards"
                  value={data.contentStats?.totalKnowledge || 0}
                  valueStyle={{ fontSize: '16px', color: '#1890ff' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Agent Performance */}
        <Col xs={24} lg={8}>
          <Card title="🤖 Rendimiento de Agentes" loading={isLoading} style={{ height: '100%' }} styles={{ body: { padding: 0 } }}>
            <Table
              dataSource={data.agentStats?.breakdown || []}
              columns={agentColumns}
              pagination={false}
              size="small"
              rowKey="name"
            />
          </Card>
        </Col>
      </Row>

      {/* System Health Row */}
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24}>
          <Card size="small">
            <Space split="|">
              <Text type="secondary">System Status: <Tag color="success">Online</Tag></Text>
              <Text type="secondary">Dispositivos Conectados: {data.activeDevices}</Text>
              <Text type="secondary">Tareas Completadas: {data.completedTasks}</Text>
              <Text type="secondary">Versión: v0.1.15</Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard