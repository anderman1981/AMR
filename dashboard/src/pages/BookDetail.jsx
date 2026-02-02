import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout, Button, Space, Typography, Card, Tag, Divider, Skeleton, Empty, Breadcrumb, List, Input, message as antdMessage } from 'antd'
import { ArrowLeftOutlined, BookOutlined, DatabaseOutlined, SyncOutlined, FileTextOutlined, RobotOutlined, MessageOutlined, BulbOutlined, SendOutlined, CommentOutlined } from '@ant-design/icons'
import { useQuery } from 'react-query'
import ReactMarkdown from 'react-markdown'
import * as booksService from '../services/books'
import BookForms from '../components/BookForms'

const { Header, Content } = Layout
const { Title, Text } = Typography

function BookDetail() {
    const { id } = useParams()
    const navigate = useNavigate()

    // Chat state
    const [chatMessages, setChatMessages] = useState([])
    const [chatInput, setChatInput] = useState('')
    const [isChatLoading, setIsChatLoading] = useState(false)
    const chatEndRef = useRef(null)

    // Fetch book details
    const { data: book, isLoading: isLoadingBook } = useQuery(['book', id], () => booksService.getBook(id), { enabled: !!id })

    // Fetch book cards/analysis
    const { data: bookCards, isLoading: isLoadingCards } = useQuery(
        ['book-cards', id],
        () => booksService.getBookCards(id),
        { enabled: !!id }
    )

    const isLoading = isLoadingBook || isLoadingCards

    // Auto-scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatMessages])

    // Handle chat message send
    const handleSendMessage = async () => {
        if (!chatInput.trim()) return

        const userMessage = chatInput.trim()
        setChatInput('')

        // Add user message to chat
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsChatLoading(true)

        try {
            const response = await booksService.chatWithBook(id, userMessage)

            // Add AI response to chat
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: response.message
            }])
        } catch (error) {
            console.error('Chat error:', error)
            antdMessage.error(error.response?.data?.error || 'Error al procesar el mensaje')

            // Add error message to chat
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Lo siento, hubo un error al procesar tu pregunta. Por favor, verifica que Ollama esté corriendo.'
            }])
        } finally {
            setIsChatLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <SyncOutlined spin style={{ fontSize: '32px', marginBottom: '20px', color: '#1890ff' }} />
                <Skeleton active />
            </div>
        )
    }

    if (!book) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <Empty description="Libro no encontrado" />
                <Button type="primary" onClick={() => navigate('/books')}>Volver a Libros</Button>
            </div>
        )
    }

    // Build the PDF URL (using the backend static route and the new filename property)
    const pdfUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3467'}/data/books/${encodeURIComponent(book.filename || '')}`

    // Organize data for the 3 sections
    const summaries = bookCards?.filter(c => c.type === 'summary') || []
    const extractions = bookCards?.filter(c => c.type === 'key_points' || c.type === 'extractor') || []
    const phrases = bookCards?.filter(c => c.type === 'quotes' || c.type === 'phrases') || []

    const breadcrumbItems = [
        { title: 'Libros', onClick: () => navigate('/books'), className: 'cursor-pointer' },
        { title: book.name }
    ]

    return (
        <Layout style={{ minHeight: '100%', background: '#f0f2f5' }}>
            <Header style={{ background: '#fff', padding: '12px 24px', height: 'auto', borderBottom: '1px solid #e8e8e8' }}>
                <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 8 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                        <BookOutlined style={{ marginRight: 12, color: '#1890ff' }} />
                        {book.name}
                    </Title>
                    <Space>
                        <Tag color="geekblue" style={{ fontSize: '12px', padding: '2px 10px' }}>{book.category?.toUpperCase() || 'GENERAL'}</Tag>
                        <Tag color={book.processed ? 'green' : 'gold'} style={{ fontSize: '12px', padding: '2px 10px' }}>
                            {book.processed ? 'ANALIZADO' : 'PENDIENTE'}
                        </Tag>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/books')}>
                            Regresar
                        </Button>
                    </Space>
                </div>
            </Header>

            <Content style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.7fr 0.7fr 0.7fr 0.9fr 0.9fr', gap: '20px', height: 'calc(100vh - 200px)' }}>

                    {/* 1. PDF Viewer Section */}
                    <Card
                        title={<><FileTextOutlined style={{ marginRight: 8 }} /> Vista del Documento</>}
                        style={{ height: '100%', borderRadius: '8px', overflow: 'hidden' }}
                        styles={{ body: { padding: 0, height: 'calc(100% - 58px)' } }}
                    >
                        {book.filename ? (
                            <iframe
                                src={pdfUrl}
                                title="PDF Viewer"
                                style={{ width: '100%', height: '100%', border: 'none' }}
                            />
                        ) : (
                            <Empty style={{ marginTop: 100 }} description="Ruta de archivo no disponible para visualización" />
                        )}
                    </Card>

                    {/* 2. Summary Section */}
                    <Card
                        title={<><RobotOutlined style={{ marginRight: 8, color: '#52c41a' }} /> Resumen Maestro</>}
                        style={{ height: '100%', borderRadius: '8px', overflowY: 'auto' }}
                    >
                        {summaries.length > 0 ? (
                            <div style={{ padding: '5px' }}>
                                <ReactMarkdown>{summaries[0].content}</ReactMarkdown>
                                {summaries[0].tags && (
                                    <div style={{ marginTop: 15 }}>
                                        {(() => {
                                            try {
                                                const tags = typeof summaries[0].tags === 'string' ? JSON.parse(summaries[0].tags) : summaries[0].tags;
                                                return Array.isArray(tags) ? tags.map(t => <Tag key={t} color="cyan" style={{ marginBottom: 5 }}>{t}</Tag>) : null;
                                            } catch (e) { return null; }
                                        })()}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Empty description="No se ha generado un resumen aún" />
                        )}
                    </Card>

                    {/* 3. Extractor Section */}
                    <Card
                        title={<><BulbOutlined style={{ marginRight: 8, color: '#faad14' }} /> Insights y Claves</>}
                        style={{ height: '100%', borderRadius: '8px', overflowY: 'auto' }}
                    >
                        {extractions.length > 0 ? (
                            <List
                                dataSource={extractions}
                                renderItem={(item) => (
                                    <List.Item style={{ padding: '12px 0', borderBottom: '1px dashed #f0f0f0' }}>
                                        <div style={{ width: '100%' }}>
                                            <ReactMarkdown>{item.content}</ReactMarkdown>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="No hay extracciones disponibles" />
                        )}
                    </Card>

                    {/* 4. Phrases Section */}
                    <Card
                        title={<><MessageOutlined style={{ marginRight: 8, color: '#722ed1' }} /> Citas Memorables</>}
                        style={{ height: '100%', borderRadius: '8px', overflowY: 'auto' }}
                    >
                        {phrases.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {phrases.map((item, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            background: '#f9f0ff',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            borderLeft: '4px solid #722ed1',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        <ReactMarkdown>{item.content}</ReactMarkdown>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Empty description="No se han extraído frases aún" />
                        )}
                    </Card>

                    {/* 5. Chat Section */}
                    <Card
                        title={<><CommentOutlined style={{ marginRight: 8, color: '#1890ff' }} /> Chat con el Libro</>}
                        style={{ height: '100%', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}
                        styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', padding: '12px', overflow: 'hidden' } }}
                    >
                        {/* Messages container */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            marginBottom: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            {chatMessages.length === 0 ? (
                                <Empty
                                    description="Haz una pregunta sobre el libro"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    style={{ marginTop: '50px' }}
                                />
                            ) : (
                                chatMessages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                            maxWidth: '85%',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            background: msg.role === 'user' ? '#1890ff' : '#f0f0f0',
                                            color: msg.role === 'user' ? 'white' : 'black',
                                            fontSize: '13px',
                                            lineHeight: '1.4'
                                        }}
                                    >
                                        {msg.role === 'assistant' ? (
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                ))
                            )}
                            {isChatLoading && (
                                <div style={{ alignSelf: 'flex-start', color: '#999', fontSize: '12px' }}>
                                    <SyncOutlined spin /> Pensando...
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input area */}
                        <Space.Compact style={{ width: '100%' }}>
                            <Input
                                placeholder="Pregunta sobre el libro..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onPressEnter={handleSendMessage}
                                disabled={isChatLoading}
                                style={{ fontSize: '13px' }}
                            />
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSendMessage}
                                loading={isChatLoading}
                                disabled={!chatInput.trim()}
                            />
                        </Space.Compact>
                    </Card>

                    {/* 6. Forms Section */}
                    <BookForms bookId={id} />

                </div>
            </Content>
        </Layout>
    )
}

export default BookDetail

