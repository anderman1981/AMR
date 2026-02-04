import React from 'react'
import { Card, List, Typography, Space, Tag } from 'antd'
import { MessageOutlined, ClockCircleOutlined } from '@ant-design/icons'

import { useQuery } from 'react-query'
import * as chatService from '../services/chat'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'

dayjs.extend(relativeTime)
dayjs.locale('es')

const { Text, Title } = Typography

function ChatHistory({ onSelectSession, selectedSessionId }) {
    const { data: sessions, isLoading } = useQuery('chat-sessions', chatService.getChatSessions)

    return (
        <Card
            title={
                <Space>
                    <MessageOutlined style={{ color: '#1890ff' }} />
                    <span>Historial de Consultas</span>
                </Space>
            }
            style={{ height: '100%', minHeight: '400px' }}
            bodyStyle={{ padding: '0 12px', overflowY: 'auto', maxHeight: '600px' }}
        >
            <List
                itemLayout="horizontal"
                dataSource={sessions || []}
                loading={isLoading}
                renderItem={item => (
                    <List.Item
                        style={{
                            cursor: 'pointer',
                            padding: '12px 8px',
                            transition: 'background 0.3s',
                            borderRadius: '8px',
                            backgroundColor: selectedSessionId === item.id ? '#e6f7ff' : 'transparent'
                        }}
                        className="chat-history-item"
                        onClick={() => onSelectSession(item.id)}
                    >
                        <List.Item.Meta
                            avatar={
                                <div style={{
                                    backgroundColor: selectedSessionId === item.id ? '#1890ff' : '#f0f2f5',
                                    padding: '8px',
                                    borderRadius: '50%',
                                    color: selectedSessionId === item.id ? '#fff' : '#1890ff'
                                }}>
                                    <MessageOutlined />
                                </div>
                            }
                            title={
                                <Text strong={selectedSessionId === item.id} style={{ fontSize: '14px' }}>
                                    {item.title}
                                </Text>
                            }
                            description={
                                <Space size="small">
                                    <ClockCircleOutlined style={{ fontSize: '12px' }} />
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {dayjs(item.updated_at).fromNow()}
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
