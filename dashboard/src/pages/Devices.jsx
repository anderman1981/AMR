import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { devicesService } from '../services/devices'
import {
  Card,
  Table,
  Tag,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Progress,
  Badge,
  Tooltip
} from 'antd'
import {
  DesktopOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const { Title, Text } = Typography

function Devices() {
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })

  // Fetch Stats
  const { data: statsData, isLoading: statsLoading } = useQuery(
    'devices-stats',
    devicesService.getDeviceStats,
    { refetchInterval: 30000 }
  )

  // Fetch Devices List
  const { data: devicesData, isLoading: listLoading, refetch } = useQuery(
    ['devices-list', pagination.current, pagination.pageSize],
    () => devicesService.getDevices({
      limit: pagination.pageSize,
      offset: (pagination.current - 1) * pagination.pageSize
    }),
    { refetchInterval: 15000, keepPreviousData: true }
  )

  const stats = statsData || {
    total_devices: 0,
    online_devices: 0,
    offline_devices: 0,
    maintenance_devices: 0,
    avg_security_score: 0
  }

  const devices = devicesData?.devices || []
  const totalItems = devicesData?.total || 0

  const columns = [
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const config = {
          online: { color: 'success', text: 'ONLINE', icon: <Badge status="success" /> },
          offline: { color: 'default', text: 'OFFLINE', icon: <Badge status="default" /> },
          maintenance: { color: 'warning', text: 'MAINT.', icon: <Badge status="warning" /> },
          busy: { color: 'processing', text: 'BUSY', icon: <Badge status="processing" /> }
        }
        const state = config[status] || config.offline
        return (
          <Space>
            {state.icon}
            <Text style={{ fontSize: '12px' }}>{state.text}</Text>
          </Space>
        )
      }
    },
    {
      title: 'Dispositivo',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>ID: {record.id.substring(0, 12)}...</Text>
        </Space>
      )
    },
    {
      title: 'Departamento',
      dataIndex: 'department',
      key: 'department',
      responsive: ['md'],
      render: (text) => <Tag>{text || 'General'}</Tag>
    },
    {
      title: 'Recursos',
      key: 'resources',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" style={{ width: '100%' }} size={2}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: '10px', width: 25 }}>CPU</Text>
            <Progress
              percent={Math.round(record.cpu_usage || 0)}
              size="small"
              steps={5}
              strokeColor={record.cpu_usage > 80 ? '#ff4d4f' : '#1890ff'}
              showInfo={false}
              style={{ margin: 0, flex: 1 }}
            />
            <Text style={{ fontSize: '10px', width: 25 }}>{Math.round(record.cpu_usage || 0)}%</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: '10px', width: 25 }}>RAM</Text>
            <Progress
              percent={Math.round(record.memory_usage || 0)}
              size="small"
              steps={5}
              strokeColor={record.memory_usage > 80 ? '#faad14' : '#52c41a'}
              showInfo={false}
              style={{ margin: 0, flex: 1 }}
            />
            <Text style={{ fontSize: '10px', width: 25 }}>{Math.round(record.memory_usage || 0)}%</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Última Actividad',
      dataIndex: 'last_heartbeat',
      key: 'last_heartbeat',
      render: (date) => (
        <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
          <Text>{date ? dayjs(date).fromNow() : 'Nunca'}</Text>
        </Tooltip>
      )
    }
  ]

  const handleTableChange = (newPagination) => {
    setPagination(newPagination)
  }

  return (
    <div className="site-layout-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <DesktopOutlined /> Gestión de Dispositivos
        </Title>
        <Space>
          <Tag icon={<SafetyCertificateOutlined />} color="purple">
            Security Score: {stats.avg_security_score.toFixed(1)}/10
          </Tag>
          <ReloadOutlined onClick={() => refetch()} style={{ cursor: 'pointer', fontSize: '16px' }} />
        </Space>
      </div>

      {/* Metrics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8} lg={6}>
          <Card loading={statsLoading} bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Total Dispositivos"
              value={stats.total_devices}
              prefix={<DesktopOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card loading={statsLoading} bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Online"
              value={stats.online_devices}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card loading={statsLoading} bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Offline"
              value={stats.offline_devices}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card loading={statsLoading} bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Mantenimiento"
              value={stats.maintenance_devices}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Devices Table */}
      <Card bodyStyle={{ padding: 0 }} bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Table
          columns={columns}
          dataSource={devices}
          rowKey="id"
          loading={listLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalItems,
            showSizeChanger: true
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  )
}

export default Devices