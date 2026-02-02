import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Typography, Progress, Alert } from 'antd'
import { 
  RobotOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

function Agents() {
  const [agents, setAgents] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    idleAgents: 0,
    offlineAgents: 0,
    runningTasks: 0,
    completedTasks: 0,
    failedTasks: 0
  })

  // Simular datos de agentes y tareas
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      // Simular datos de agentes
      const mockAgents = [
        {
          id: 'agent-001',
          name: 'ContentAgent-01',
          type: 'Content Agent',
          status: 'active',
          lastHeartbeat: '2026-02-02T01:45:00Z',
          cpuUsage: 45,
          memoryUsage: 67,
          currentTask: 'Processing book: "El Arte de la Guerra"',
          tasksCompleted: 125,
          uptime: '2d 14h 32m'
        },
        {
          id: 'agent-002',
          name: 'DetectorAgent-01',
          type: 'Detector Agent',
          status: 'idle',
          lastHeartbeat: '2026-02-02T01:44:30Z',
          cpuUsage: 12,
          memoryUsage: 34,
          currentTask: null,
          tasksCompleted: 89,
          uptime: '1d 8h 15m'
        },
        {
          id: 'agent-003',
          name: 'LearningAgent-01',
          type: 'Learning Agent',
          status: 'active',
          lastHeartbeat: '2026-02-02T01:45:12Z',
          cpuUsage: 78,
          memoryUsage: 82,
          currentTask: 'Analyzing patterns in: "Inteligencia Emocional"',
          tasksCompleted: 203,
          uptime: '3d 2h 45m'
        },
        {
          id: 'agent-004',
          name: 'ManagerAgent-01',
          type: 'Manager Agent',
          status: 'offline',
          lastHeartbeat: '2026-02-02T00:15:22Z',
          cpuUsage: 0,
          memoryUsage: 0,
          currentTask: null,
          tasksCompleted: 456,
          uptime: 'Offline'
        }
      ]

      // Simular tareas en ejecución
      const mockTasks = [
        {
          id: 'task-001',
          agentName: 'ContentAgent-01',
          type: 'Content Generation',
          description: 'Procesando "El Arte de la Guerra"',
          status: 'running',
          progress: 67,
          startTime: '2026-02-02T01:30:00Z',
          estimatedCompletion: '2026-02-02T02:15:00Z'
        },
        {
          id: 'task-002',
          agentName: 'LearningAgent-01',
          type: 'Pattern Analysis',
          description: 'Análisis de patrones en "Inteligencia Emocional"',
          status: 'running',
          progress: 34,
          startTime: '2026-02-02T01:15:00Z',
          estimatedCompletion: '2026-02-02T02:45:00Z'
        },
        {
          id: 'task-003',
          agentName: 'ContentAgent-01',
          type: 'Content Generation',
          description: 'Procesando "Piense y Hágase Rico"',
          status: 'completed',
          progress: 100,
          startTime: '2026-02-01T23:45:00Z',
          completedTime: '2026-02-02T01:28:00Z'
        },
        {
          id: 'task-004',
          agentName: 'DetectorAgent-01',
          type: 'Anomaly Detection',
          description: 'Detección de anomalías en lote de libros',
          status: 'failed',
          progress: 23,
          startTime: '2026-02-01T22:30:00Z',
          failedTime: '2026-02-02T00:45:00Z',
          error: 'Timeout en procesamiento de archivo grande'
        }
      ]

      setAgents(mockAgents)
      setTasks(mockTasks)

      // Calcular estadísticas
      const totalAgents = mockAgents.length
      const activeAgents = mockAgents.filter(a => a.status === 'active').length
      const idleAgents = mockAgents.filter(a => a.status === 'idle').length
      const offlineAgents = mockAgents.filter(a => a.status === 'offline').length
      const runningTasks = mockTasks.filter(t => t.status === 'running').length
      const completedTasks = mockTasks.filter(t => t.status === 'completed').length
      const failedTasks = mockTasks.filter(t => t.status === 'failed').length

      setStats({
        totalAgents,
        activeAgents,
        idleAgents,
        offlineAgents,
        runningTasks,
        completedTasks,
        failedTasks
      })

      setLoading(false)
    }

    fetchData()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green'
      case 'idle': return 'orange'
      case 'offline': return 'red'
      case 'error': return 'red'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <PlayCircleOutlined />
      case 'idle': return <PauseCircleOutlined />
      case 'offline': return <ExclamationCircleOutlined />
      case 'error': return <ExclamationCircleOutlined />
      default: return <ClockCircleOutlined />
    }
  }

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'running': return 'processing'
      case 'completed': return 'success'
      case 'failed': return 'error'
      case 'pending': return 'default'
      default: return 'default'
    }
  }

  const agentColumns = [
    {
      title: 'Agente',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <RobotOutlined />
          <div>
            <div><Text strong>{text}</Text></div>
            <div><Text type="secondary" style={{ fontSize: '12px' }}>{record.type}</Text></div>
          </div>
        </Space>
      )
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'CPU',
      dataIndex: 'cpuUsage',
      key: 'cpuUsage',
      render: (usage, record) => (
        <Progress 
          percent={usage} 
          size="small" 
          status={usage > 80 ? 'exception' : usage > 60 ? 'active' : 'normal'}
          format={percent => `${percent}%`}
        />
      )
    },
    {
      title: 'Memoria',
      dataIndex: 'memoryUsage',
      key: 'memoryUsage',
      render: (usage, record) => (
        <Progress 
          percent={usage} 
          size="small" 
          status={usage > 80 ? 'exception' : usage > 60 ? 'active' : 'normal'}
          format={percent => `${percent}%`}
        />
      )
    },
    {
      title: 'Tarea Actual',
      dataIndex: 'currentTask',
      key: 'currentTask',
      render: (task, record) => (
        <div>
          {task ? (
            <div>
              <Text>{task}</Text>
            </div>
          ) : (
            <Text type="secondary">Sin tareas activas</Text>
          )}
        </div>
      )
    },
    {
      title: 'Último Heartbeat',
      dataIndex: 'lastHeartbeat',
      key: 'lastHeartbeat',
      render: (time) => (
        <Text type="secondary">
          {new Date(time).toLocaleString()}
        </Text>
      )
    }
  ]

  const taskColumns = [
    {
      title: 'Tarea',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => (
        <div>
          <div><Text strong>{text}</Text></div>
          <div><Text type="secondary" style={{ fontSize: '12px' }}>{record.type}</Text></div>
        </div>
      )
    },
    {
      title: 'Agente',
      dataIndex: 'agentName',
      key: 'agentName'
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getTaskStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Progreso',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress 
          percent={progress} 
          size="small" 
          status={progress === 100 ? 'success' : 'normal'}
        />
      )
    },
    {
      title: 'Tiempo Estimado',
      dataIndex: 'estimatedCompletion',
      key: 'estimatedCompletion',
      render: (time, record) => (
        record.status === 'running' ? (
          <Text type="secondary">
            {new Date(time).toLocaleTimeString()}
          </Text>
        ) : (
          <Text type="secondary">-</Text>
        )
      )
    }
  ]

  return (
    <div>
      <Title level={2}>🤖 Gestión de Agentes</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {/* Estadísticas Generales */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total de Agentes"
                value={stats.totalAgents}
                prefix={<RobotOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Agentes Activos"
                value={stats.activeAgents}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Agentes Inactivos"
                value={stats.idleAgents}
                prefix={<PauseCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Agentes Desconectados"
                value={stats.offlineAgents}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Estadísticas de Tareas */}
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tareas en Ejecución"
                value={stats.runningTasks}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tareas Completadas"
                value={stats.completedTasks}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tareas Fallidas"
                value={stats.failedTasks}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Alertas de Agentes Críticos */}
        {stats.offlineAgents > 0 && (
          <Alert
            message={`${stats.offlineAgents} agente(s) desconectado(s)`}
            description="Hay agentes que no están respondiendo. Verifique la conectividad de los dispositivos."
            type="warning"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        {/* Tabla de Agentes */}
        <Card title="🤖 Estado de Agentes" size="small">
          <Table
            columns={agentColumns}
            dataSource={agents}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} agentes`
            }}
            scroll={{ x: true }}
          />
        </Card>

        {/* Tabla de Tareas */}
        <Card title="📋 Tareas en Ejecución" size="small">
          <Table
            columns={taskColumns}
            dataSource={tasks}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} tareas`
            }}
            scroll={{ x: true }}
          />
        </Card>

        {/* Acciones Rápidas */}
        <Card title="⚡ Acciones Rápidas" size="small">
          <Space wrap>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
            >
              Actualizar Estado
            </Button>
            <Button 
              icon={<PlayCircleOutlined />}
              onClick={() => console.log('Restart agents')}
            >
              Reiniciar Agentes
            </Button>
            <Button 
              icon={<ExclamationCircleOutlined />}
              danger
              onClick={() => console.log('Emergency stop')}
            >
              Parada de Emergencia
            </Button>
          </Space>
        </Card>

      </Space>
    </div>
  )
}

export default Agents