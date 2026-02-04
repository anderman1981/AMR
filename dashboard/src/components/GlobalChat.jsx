import React, { useState, useRef, useEffect } from 'react'
import { Card, Input, Button, List, Avatar, Typography, Space, Spin, Tag, Empty } from 'antd'
import { SendOutlined, RobotOutlined, UserOutlined, BulbOutlined, BookOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import * as chatService from '../services/chat'

import { useQueryClient } from 'react-query'

const { Text, Title } = Typography

function GlobalChat({ currentChatId, onNewChat, onChatCreated }) {
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hola, soy tu Coach de Productividad. ¿En qué desafío estás trabajando hoy? Puedo ayudarte conectando tus objetivos con el conocimiento de tu biblioteca.'
        }
    ])
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)
    const queryClient = useQueryClient()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    // Load messages when chat changes
    useEffect(() => {
        const loadHistory = async () => {
            if (currentChatId) {
                try {
                    setIsLoading(true)
                    const history = await chatService.getChatMessages(currentChatId)
                    if (history && history.length > 0) {
                        setMessages(history)
                    } else {
                        // Keep default greeting if empty (shouldn't happen for persisted chats)
                    }
                } catch (error) {
                    console.error('Error loading chat:', error)
                } finally {
                    setIsLoading(false)
                }
            } else {
                // Reset to default greeting for new chat
                setMessages([{
                    role: 'assistant',
                    content: 'Hola, soy tu Coach de Productividad. ¿En qué desafío estás trabajando hoy? Puedo ayudarte conectando tus objetivos con el conocimiento de tu biblioteca.'
                }])
            }
        }
        loadHistory()
    }, [currentChatId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage = { role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            // Prepare history for context (exclude initial greeting if generic)
            const history = messages.slice(1).map(m => ({ role: m.role, content: m.content }))

            const response = await chatService.sendGlobalMessage(userMessage.content, history, currentChatId)

            if (!currentChatId && response.chatId) {
                onChatCreated(response.chatId)
                queryClient.invalidateQueries('chat-sessions')
            } else if (currentChatId) {
                // Refresh sessions list to update timestamps/order
                queryClient.invalidateQueries('chat-sessions')
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.content
            }])
        } catch (error) {
            console.error('Chat error:', error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Lo siento, tuve un problema al consultar la biblioteca. Por favor intenta de nuevo.'
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card
            title={
                <Space>
                    <RobotOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
                    <div>
                        <Title level={4} style={{ margin: 0 }}>AMR Coach</Title>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Asesor impulsado por tu biblioteca</Text>
                    </div>
                </Space>
            }
            extra={
                <Space>
                    {currentChatId && (
                        <Button type="dashed" size="small" onClick={onNewChat}>
                            Nuevo Chat
                        </Button>
                    )}
                    <Tag color="blue">RICE & OKR Enabled</Tag>
                </Space>
            }
            className="global-chat-card"
            style={{
                height: '600px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            styles={{
                body: {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    padding: '0'
                }
            }}
        >
            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                background: '#f9f9f9'
            }}>
                <List
                    itemLayout="horizontal"
                    dataSource={messages}
                    renderItem={item => (
                        <List.Item style={{ border: 'none', padding: '8px 0' }}>
                            <div style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: item.role === 'user' ? 'row-reverse' : 'row',
                                    maxWidth: '85%',
                                    gap: '12px'
                                }}>
                                    <Avatar
                                        icon={item.role === 'user' ? <UserOutlined /> : <BulbOutlined />}
                                        style={{
                                            backgroundColor: item.role === 'user' ? '#1890ff' : '#52c41a',
                                            flexShrink: 0
                                        }}
                                    />
                                    <div style={{
                                        backgroundColor: item.role === 'user' ? '#1890ff' : '#fff',
                                        color: item.role === 'user' ? '#fff' : 'rgba(0, 0, 0, 0.85)',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        borderTopLeftRadius: item.role === 'assistant' ? '2px' : '12px',
                                        borderTopRightRadius: item.role === 'user' ? '2px' : '12px',
                                        boxShadow: item.role === 'assistant' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                                        fontSize: '15px',
                                        lineHeight: '1.6'
                                    }}>
                                        <ReactMarkdown
                                            components={{
                                                p: ({ node, ...props }) => <p style={{ margin: 0 }} {...props} />
                                            }}
                                        >
                                            {item.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
                {isLoading && (
                    <div style={{ padding: '10px 0', textAlign: 'left', marginLeft: '50px' }}>
                        <Space>
                            <Spin size="small" />
                            <Text type="secondary">Analizando libros y conectando ideas...</Text>
                        </Space>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 2 && (
                <div style={{
                    padding: '12px 20px',
                    background: '#f0f2f5',
                    borderTop: '1px solid #e8e8e8'
                }}>
                    <Text type="secondary" style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>
                        💡 Preguntas sugeridas:
                    </Text>
                    <Space wrap>
                        <Tag
                            color="blue"
                            style={{ cursor: 'pointer', padding: '4px 12px' }}
                            onClick={() => setInput('¿Qué libros de productividad tienes?')}
                        >
                            ¿Qué libros de productividad tienes?
                        </Tag>
                        <Tag
                            color="blue"
                            style={{ cursor: 'pointer', padding: '4px 12px' }}
                            onClick={() => setInput('Resume el libro más reciente')}
                        >
                            Resume el libro más reciente
                        </Tag>
                        <Tag
                            color="blue"
                            style={{ cursor: 'pointer', padding: '4px 12px' }}
                            onClick={() => setInput('¿Qué ejercicios prácticos hay en mis libros?')}
                        >
                            ¿Qué ejercicios prácticos hay?
                        </Tag>
                        <Tag
                            color="blue"
                            style={{ cursor: 'pointer', padding: '4px 12px' }}
                            onClick={() => setInput('Dame ideas para aplicar lo que he leído')}
                        >
                            Ideas para aplicar lo leído
                        </Tag>
                    </Space>
                </div>
            )}

            {/* Input Area */}
            <div style={{
                padding: '16px',
                background: '#fff',
                borderTop: '1px solid #f0f0f0'
            }}>
                <Space.Compact style={{ width: '100%' }}>
                    <Input
                        size="large"
                        placeholder="Pregunta sobre productividad, gestión o tus libros..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onPressEnter={handleSend}
                        disabled={isLoading}
                    />
                    <Button
                        type="primary"
                        size="large"
                        icon={<SendOutlined />}
                        onClick={handleSend}
                        loading={isLoading}
                    >
                        Enviar
                    </Button>
                </Space.Compact>
                <div style={{ marginTop: '8px', textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                        <BookOutlined /> El Coach utiliza información de toda tu biblioteca procesada.
                    </Text>
                </div>
            </div>
        </Card>
    )
}

export default GlobalChat
