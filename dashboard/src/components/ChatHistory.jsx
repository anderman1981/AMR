import React from 'react'
import { Card, List, Typography, Space, Tag } from 'antd'
import { MessageOutlined, ClockCircleOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

// Mock Data for MVP (To be replaced with real backend data or localStorage)
const MOCK_HISTORY = [
    { id: 1, title: 'Resumen de "Deep Work"', date: 'Hace 2 horas', type: 'summary' },
    { id: 2, title: 'Conceptos clave de Psicología', date: 'Ayer', type: 'concept' },
    { id: 3, title: 'Plan de acción basado en Hábitos Atómicos', date: 'Hace 2 días', type: 'action' },
    { id: 4, title: 'Análisis de "Thinking Fast and Slow"', date: 'Hace 3 días', type: 'analysis' },
    { id: 5, title: 'Ideas para mejorar la concentración', date: 'Hace 1 semana', type: 'idea' }
]

function ChatHistory() {
    return (
        <Card
            title={
                <Space>
                    <MessageOutlined style={{ color: '#1890ff' }} />
                    <span>Historial de Consultas</span>
                </Space>
            }
            style={{ height: '100%', minHeight: '400px' }}
            bodyStyle={{ padding: '0 12px' }}
        >
            <List
                itemLayout="horizontal"
                dataSource={MOCK_HISTORY}
                renderItem={item => (
                    <List.Item
                        style={{
                            cursor: 'pointer',
                            padding: '12px 8px',
                            transition: 'background 0.3s',
                            borderRadius: '8px'
                        }}
                        className="chat-history-item"
                    >
                        <List.Item.Meta
                            avatar={
                                <div style={{
                                    backgroundColor: '#e6f7ff',
                                    padding: '8px',
                                    borderRadius: '50%',
                                    color: '#1890ff'
                                }}>
                                    <MessageOutlined />
                                </div>
                            }
                            title={
                                <Text strong style={{ fontSize: '14px' }}>
                                    {item.title}
                                </Text>
                            }
                            description={
                                <Space size="small">
                                    <ClockCircleOutlined style={{ fontSize: '12px' }} />
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {item.date}
                                    </Text>
                                </Space>
                            }
                        />
                    </List.Item>
                )}
            />
            <style>{`
        .chat-history-item:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }
      `}</style>
        </Card>
    )
}

export default ChatHistory
