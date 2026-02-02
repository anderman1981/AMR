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

import { getAgents, getAgentsStats, getAllTasks } from '../services/agents'

function Agents() {
  const [agents, setAgents] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    reading: 0,
    extracting: 0,
    creating_cards: 0,
    cpu: 0,
    memory: 0,
    active_agents: 0,
    running_tasks: 0
  })

  const fetchData = async () => {
    try {
      const [agentsRes, statsRes, tasksRes] = await Promise.all([
        getAgents(),
        getAgentsStats(),
        getAllTasks()
      ])

      if (agentsRes.success) setAgents(agentsRes.data.agents || [])
      if (statsRes.success) setStats({
        ...statsRes.data.categories,
        ...statsRes.data.usage,
        ...statsRes.data.overall
      })
      if (tasksRes.success) setTasks(tasksRes.data.tasks || [])
    } catch (error) {
      console.error('Error fetching real-time data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000) // Poll every 5s
    return () => clearInterval(interval)
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
      render: (task, record) => {
        // Encontrar la tarea asignada a este dispositivo/agente
        const activeTask = tasks.find(t => (t.device_id === record.id || t.agent_name === record.name) && t.status === 'assigned')

        if (activeTask) {
          try {
            const payload = JSON.parse(activeTask.payload)
            const bookName = payload.book_name || payload.data?.book_name || 'Libro Desconocido'
            const action = payload.action || payload.type || 'Procesando'
            return (
              <Space direction="vertical" size={0}>
                <Text strong style={{ color: '#1890ff' }}>{action.toUpperCase()}</Text>
                <Text size="small">{bookName}</Text>
              </Space>
            )
          } catch (e) {
            return <Text>{activeTask.type || 'Procesando...'}</Text>
          }
        }

        return <Text type="secondary">Sin tareas activas</Text>
      }
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

        {/* Estadísticas Generales - Categorías Reales */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Agentes Leyendo"
                value={stats.reading}
                prefix={<RobotOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Agentes Extrayendo"
                value={stats.extracting}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Creando Cards"
                value={stats.creating_cards}
                prefix={<PauseCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Agentes Online"
                value={stats.active_agents}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Uso de Recursos */}
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} sm={12}>
            <Card title="CPU Global">
              <Progress percent={stats.cpu} status={stats.cpu > 80 ? 'exception' : 'active'} />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card title="Memoria Global">
              <Progress percent={stats.memory} status={stats.memory > 80 ? 'exception' : 'active'} strokeColor="#52c41a" />
            </Card>
          </Col>
        </Row>

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