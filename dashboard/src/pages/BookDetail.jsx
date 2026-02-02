import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout, Button, Space, Typography, Card, Tag, Divider, Skeleton, Empty, Breadcrumb, List, Input, message as antdMessage, Tabs } from 'antd'
import { ArrowLeftOutlined, BookOutlined, DatabaseOutlined, SyncOutlined, FileTextOutlined, RobotOutlined, MessageOutlined, BulbOutlined, SendOutlined, CommentOutlined, FormOutlined, LineChartOutlined } from '@ant-design/icons'
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
    const chatContainerRef = useRef(null)


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
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', height: 'calc(100vh - 200px)' }}>

                    {/* Left Column: PDF Viewer */}
                    <Card
                        title={<><FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} /> Vista de Documento</>}
                        style={{ height: '100%', borderRadius: '8px' }}
                        styles={{ body: { padding: 0, height: 'calc(100% - 57px)' } }}
                    >
                        {book?.file_path ? (
                            <iframe
                                src={`http://localhost:3467/data/books/${book.file_path.split('/').pop()}`}
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                title="PDF Viewer"
                            />
                        ) : (
                            <Empty description="No hay archivo disponible" style={{ marginTop: '50px' }} />
                        )}
                    </Card>

                    {/* Right Column: Tabs */}
                    <Card
                        style={{ height: '100%', borderRadius: '8px' }}
                        styles={{ body: { padding: 0, height: 'calc(100% - 57px)', display: 'flex', flexDirection: 'column' } }}
                    >
                        <Tabs
                            defaultActiveKey="1"
                            type="card"
                            style={{ height: '100%' }}
                            items={[
                                {
                                    key: '1',
                                    label: (
                                        <span>
                                            <LineChartOutlined />
                                            Análisis
                                        </span>
                                    ),
                                    children: (
                                        <div style={{ padding: '12px', height: '100%', overflowY: 'auto' }}>
                                            <Title level={5}>Resumen Generado por IA</Title>
                                            {book?.summary ? (
                                                <ReactMarkdown>{book.summary}</ReactMarkdown>
                                            ) : (
                                                <Empty description="No hay resumen disponible" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                            )}
                                            <Divider />
                                            <Space direction="vertical" size="small">
                                                <Text strong>Categoría:</Text>
                                                <Tag color="blue">{book?.category || 'Sin categoría'}</Tag>
                                                <Text strong>Estado:</Text>
                                                <Tag color={book?.processed ? 'green' : 'orange'}>
                                                    {book?.processed ? 'Procesado' : 'Pendiente'}
                                                </Tag>
                                            </Space>
                                        </div>
                                    ),
                                },
                                {
                                    key: '2',
                                    label: (
                                        <span>
                                            <BulbOutlined />
                                            Insights
                                        </span>
                                    ),
                                    children: (
                                        <div style={{ padding: '12px', height: '100%', overflowY: 'auto' }}>
                                            <Title level={5}>Extracciones Clave</Title>
                                            {book?.insights && book.insights.length > 0 ? (
                                                <List
                                                    dataSource={book.insights}
                                                    renderItem={(insight, index) => (
                                                        <List.Item key={index}>
                                                            <ReactMarkdown>{insight}</ReactMarkdown>
                                                        </List.Item>
                                                    )}
                                                />
                                            ) : (
                                                <Empty description="No hay insights disponibles" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    key: '3',
                                    label: (
                                        <span>
                                            <CommentOutlined />
                                            Citas
                                        </span>
                                    ),
                                    children: (
                                        <div style={{ padding: '12px', height: '100%', overflowY: 'auto' }}>
                                            <Title level={5}>Citas Memorables</Title>
                                            {book?.quotes && book.quotes.length > 0 ? (
                                                <List
                                                    dataSource={book.quotes}
                                                    renderItem={(quote, index) => (
                                                        <List.Item key={index}>
                                                            <blockquote style={{ borderLeft: '3px solid #1890ff', paddingLeft: '12px', fontStyle: 'italic' }}>
                                                                {quote}
                                                            </blockquote>
                                                        </List.Item>
                                                    )}
                                                />
                                            ) : (
                                                <Empty description="No hay citas disponibles" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    key: '4',
                                    label: (
                                        <span>
                                            <MessageOutlined />
                                            Chat
                                        </span>
                                    ),
                                    children: (
                                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                            <div
                                                ref={chatContainerRef}
                                                style={{
                                                    flex: 1,
                                                    overflowY: 'auto',
                                                    padding: '12px',
                                                    marginBottom: '12px',
                                                    border: '1px solid #f0f0f0',
                                                    borderRadius: '4px',
                                                    minHeight: '300px',
                                                    maxHeight: '500px'
                                                }}
                                            >
                                                {chatMessages.length === 0 ? (
                                                    <Empty
                                                        description="Hazme una pregunta sobre el libro"
                                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                    />
                                                ) : (
                                                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                                        {chatMessages.map((msg, idx) => (
                                                            <div
                                                                key={idx}
                                                                style={{
                                                                    textAlign: msg.role === 'user' ? 'right' : 'left',
                                                                    marginBottom: '8px'
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        display: 'inline-block',
                                                                        maxWidth: '80%',
                                                                        padding: '8px 12px',
                                                                        borderRadius: '8px',
                                                                        backgroundColor: msg.role === 'user' ? '#1890ff' : '#f0f0f0',
                                                                        color: msg.role === 'user' ? 'white' : 'black'
                                                                    }}
                                                                >
                                                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {isChatLoading && (
                                                            <div style={{ textAlign: 'left' }}>
                                                                <div style={{
                                                                    display: 'inline-block',
                                                                    padding: '8px 12px',
                                                                    borderRadius: '8px',
                                                                    backgroundColor: '#f0f0f0'
                                                                }}>
                                                                    <SyncOutlined spin /> Pensando...
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Space>
                                                )}
                                            </div>
                                            <Space.Compact style={{ width: '100%' }}>
                                                <Input
                                                    placeholder="Escribe tu pregunta..."
                                                    value={chatInput}
                                                    onChange={(e) => setChatInput(e.target.value)}
                                                    onPressEnter={handleSendMessage}
                                                    disabled={isChatLoading}
                                                />
                                                <Button
                                                    type="primary"
                                                    icon={<SendOutlined />}
                                                    onClick={handleSendMessage}
                                                    loading={isChatLoading}
                                                >
                                                    Enviar
                                                </Button>
                                            </Space.Compact>
                                        </div>
                                    ),
                                },
                                {
                                    key: '5',
                                    label: (
                                        <span>
                                            <FormOutlined />
                                            Formularios
                                        </span>
                                    ),
                                    children: (
                                        <div style={{ padding: '0', height: '100%' }}>
                                            <BookForms bookId={id} />
                                        </div>
                                    ),
                                },
                            ]}
                        />
                    </Card>

                </div>
            </Content>
        </Layout>
    )
}

export default BookDetail
