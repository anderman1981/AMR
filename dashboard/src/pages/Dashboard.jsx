import React, { useState, useEffect } from 'react'
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
import ChatHistory from '../components/ChatHistory'
// import OnboardingTour from '../components/OnboardingTour' // TODO: Uncomment after installing react-joyride

const { Title } = Typography

function Dashboard() {
  const [runTour, setRunTour] = useState(false)

  const { data: stats, isLoading } = useQuery('system-stats', statsService.getSystemStats, {
    refetchInterval: 30000 // Refresh every 30s
  })

  // Check if first-time user
  // TODO: Uncomment after installing react-joyride
  // useEffect(() => {
  //   const hasCompletedOnboarding = localStorage.getItem('onboarding_completed')
  //   if (!hasCompletedOnboarding) {
  //     // Delay tour start to let page render
  //     setTimeout(() => setRunTour(true), 1000)
  //   }
  // }, [])

  const [currentChatId, setCurrentChatId] = useState(null)

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
      {/* TODO: Uncomment after installing react-joyride */}
      {/* <OnboardingTour run={runTour} onFinish={() => setRunTour(false)} /> */}

      <Title level={2}>🎯 AMROIS Dashboard</Title>

      <Row gutter={[16, 16]}>
        {/* Global Coach Chat - Full Width or Large Column */}
        <Col xs={24} lg={16}>
          <div data-tour="chat-coach">
            <GlobalChat
              currentChatId={currentChatId}
              onNewChat={() => setCurrentChatId(null)}
              onChatCreated={(id) => setCurrentChatId(id)}
            />
          </div>
        </Col>

        {/* Stats/History Column */}
        <Col xs={24} lg={8}>
          <ChatHistory
            onSelectSession={setCurrentChatId}
            selectedSessionId={currentChatId}
          />
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

        {/* Brain Metrics */}
        <Col xs={24} md={12}>
          <Card title="🧠 Nivel de Conocimiento (Brain IQ)" loading={isLoading}>
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
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
                <span>Insights: {data.brainMetrics?.totalCards || 0}</span>
                <span>Interacciones: {data.brainMetrics?.totalInteractions || 0}</span>
              </div>
              <Progress
                percent={Math.min(100, ((data.brainMetrics?.score % 100) || 0))}
                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                showInfo={false}
                size="small"
              />
              <div style={{ textAlign: 'right', fontSize: '10px', color: '#ccc' }}>
                Próximo nivel: {((Math.floor((data.brainMetrics?.score || 0) / 100) + 1) * 100)} XP
              </div>
            </div>
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