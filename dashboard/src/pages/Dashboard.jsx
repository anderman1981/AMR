import GlobalChat from '../components/GlobalChat'

// ...

function Dashboard() {
  // ... existing code ...

  return (
    <div>
      <Title level={2}>🎯 AMROIS Dashboard</Title>

      <Row gutter={[16, 16]}>
        {/* Global Coach Chat - Full Width or Large Column */}
        <Col xs={24} lg={16}>
          <GlobalChat />
        </Col>

        {/* Create a side column for stats */}
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

        {/* Progreso de Procesamiento (Full Width below) */}
        <Col span={24}>
          {/* ... existing stats ... */}
        </Col>

      </Row>
    </div>
  )
}


export default Dashboard