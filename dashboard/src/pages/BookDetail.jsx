import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout, Button, Space, Typography, Card, Tag, Divider, Skeleton, Empty, Breadcrumb, List, Input, message as antdMessage, Tabs, Select, Pagination } from 'antd'
import { ArrowLeftOutlined, BookOutlined, DatabaseOutlined, SyncOutlined, FileTextOutlined, RobotOutlined, MessageOutlined, BulbOutlined, SendOutlined, CommentOutlined, FormOutlined, LineChartOutlined, ReadOutlined } from '@ant-design/icons'
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
    const [activeTab, setActiveTab] = useState('1')
    const [readerMode, setReaderMode] = useState('pro') // 'pro' or 'text'
    const foliateRef = useRef(null)
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [currentChatId, setCurrentChatId] = useState(null)
    const [chatInput, setChatInput] = useState('')
    const chatEndRef = useRef(null)
    const chatContainerRef = useRef(null)

    // Content Pagination State
    const [visibleLines, setVisibleLines] = useState(500)
    const [currentPage, setCurrentPage] = useState(1)
    const linesPerPage = 100

    // Fetch chat sessions
    const { data: chatSessions, refetch: refetchSessions } = useQuery(
        ['book-chats', id],
        () => booksService.getBookChats(id),
        { enabled: !!id }
    )


    // Fetch book details
    // Load Foliate script
    useEffect(() => {
        const script = document.createElement('script')
        script.type = 'module'
        script.src = '/lib/foliate-js/view.js'
        document.head.appendChild(script)
        return () => {
            document.head.removeChild(script)
        }
    }, [])

    // Fetch book data FIRST (before useEffect that depends on it)
    const { data: book, isLoading: isLoadingBook } = useQuery(
        ['book', id], () => booksService.getBook(id), { enabled: !!id })

    // Fetch book cards/analysis
    const { data: bookCards, isLoading: isLoadingCards } = useQuery(
        ['book-cards', id],
        () => booksService.getBookCards(id),
        { enabled: !!id }
    )

    const isLoading = isLoadingBook || isLoadingCards

    // Open book in Foliate when readerMode is 'pro' and book is loaded
    useEffect(() => {
        if (readerMode === 'pro' && foliateRef.current && book?.id) {
            const rawUrl = `http://localhost:3467/api/books/${book.id}/raw`
            foliateRef.current.open(rawUrl).catch(err => {
                console.error('Error opening book in Foliate:', err)
                setReaderMode('text') // Fallback to text mode if Foliate fails
            })
        }
    }, [readerMode, book?.id, activeTab])

    // Fetch book content (for the new tab)
    const { data: bookContent, isLoading: isLoadingContent } = useQuery(
        ['book-content', id],
        () => booksService.getBookContent(id),
        {
            enabled: !!id,
            staleTime: Infinity, // Content doesn't change often
            onSuccess: () => setVisibleLines(500) // Reset pagination on new book
        }
    )

    // Load messages when chat session changes
    useEffect(() => {
        const loadMessages = async () => {
            if (currentChatId) {
                try {
                    setIsChatLoading(true)
                    const messages = await booksService.getChatMessages(currentChatId)
                    setChatMessages(messages)
                } catch (error) {
                    console.error('Error loading messages:', error)
                    antdMessage.error('Error al cargar la conversación')
                } finally {
                    setIsChatLoading(false)
                }
            } else {
                setChatMessages([])
            }
        }
        loadMessages()
    }, [currentChatId])

    // Agent Trigger Handler
    const handleTriggerAgent = async (type) => {
        try {
            antdMessage.loading({ content: 'Iniciando agente...', key: 'agent-task' })
            await booksService.createBookTask({ id, type })
            antdMessage.success({ content: 'Agente iniciado. Recarga en unos minutos.', key: 'agent-task' })
        } catch (error) {
            console.error(error)
            antdMessage.error({ content: 'Error al iniciar agente', key: 'agent-task' })
        }
    }

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
            const response = await booksService.chatWithBook(id, userMessage, currentChatId)

            if (!currentChatId && response.chat_id) {
                setCurrentChatId(response.chat_id)
                refetchSessions()
            }

            // Add AI response to chat
            const aiMessage = { role: 'assistant', content: response.message }
            setChatMessages(prev => [...prev, aiMessage])
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

    // Build the PDF URL using the relative data path (handled by Vite proxy in dev, or same host in prod)
    const pdfUrl = `/data/books/${encodeURIComponent(book.filename || '')}`

    // Organize data for the 3 sections
    const summaries = bookCards?.filter(c => c.type === 'summary') || []
    const extractions = bookCards?.filter(c => c.type === 'key_points' || c.type === 'extractor') || []
    const phrases = bookCards?.filter(c => c.type === 'quotes' || c.type === 'phrases') || []

    // Only show the latest summary to avoid UI duplication if database has multiple
    const latestSummary = summaries.length > 0 ? summaries[0] : null

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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', height: 'calc(100vh - 200px)' }}>

                    {/* Left Column: PDF Viewer */}
                    <Card
                        title={<><FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} /> Vista de Documento</>}
                        style={{ height: '100%', borderRadius: '8px' }}
                        styles={{ body: { padding: 0, height: 'calc(100% - 57px)' } }}
                    >
                        {book?.file_path ? (
                            <iframe
                                src={pdfUrl}
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
                            activeKey={activeTab}
                            onChange={setActiveTab}
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
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <Title level={5} style={{ margin: 0 }}>Análisis Estructural</Title>
                                                <Button
                                                    size="small"
                                                    type="primary"
                                                    icon={<RobotOutlined />}
                                                    disabled={!!book?.active_task_id || book?.has_summary}
                                                    onClick={() => handleTriggerAgent('reader')}
                                                >
                                                    {book?.active_task_type === 'reader' && book?.active_task_progress !== null
                                                        ? `Generar Análisis (${book?.active_task_progress}%)`
                                                        : 'Generar Análisis'}
                                                </Button>
                                            </div>

                                            {latestSummary ? (
                                                <div key={latestSummary.id || 0}>
                                                    <ReactMarkdown>{latestSummary.content}</ReactMarkdown>
                                                    <Divider />
                                                    <Space direction="vertical" size="small">
                                                        <Text strong>Categoría:</Text>
                                                        <Tag color="blue">{book?.category || 'General'}</Tag>
                                                        <Text strong>Estado:</Text>
                                                        <Tag color={book?.processed ? 'green' : 'orange'}>
                                                            {book?.processed ? 'Completado' : 'Pendiente'}
                                                        </Tag>
                                                    </Space>
                                                </div>
                                            ) : (
                                                <Empty description="No hay análisis disponible. Genera uno con el Agente." />
                                            )}
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
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <Title level={5} style={{ margin: 0 }}>Insights & Tareas</Title>
                                                <Button
                                                    size="small"
                                                    icon={<RobotOutlined />}
                                                    disabled={!!book?.active_task_id || book?.has_key_points}
                                                    onClick={() => handleTriggerAgent('extractor')}
                                                >
                                                    {book?.active_task_type === 'extractor' && book?.active_task_progress !== null
                                                        ? `Extraer Insights (${book?.active_task_progress}%)`
                                                        : 'Extraer Insights'}
                                                </Button>
                                            </div>

                                            {extractions.length > 0 ? (
                                                extractions.map((card, idx) => (
                                                    <Card key={idx} type="inner" style={{ marginBottom: 10 }}>
                                                        <ReactMarkdown>{card.content}</ReactMarkdown>
                                                    </Card>
                                                ))
                                            ) : (
                                                <Empty description="No hay insights extraídos." />
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
                                        <div style={{ padding: '12px', height: '100%', overflowY: 'auto', paddingRight: '15px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1, padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                                <Title level={5} style={{ margin: 0 }}>Citas Semanales</Title>
                                                <Button
                                                    size="small"
                                                    type="dashed"
                                                    icon={<RobotOutlined />}
                                                    disabled={!!book?.active_task_id}
                                                    onClick={() => handleTriggerAgent('phrases')}
                                                >
                                                    {book?.active_task_type === 'phrases' && book?.active_task_progress !== null
                                                        ? `Generar Citas (${book?.active_task_progress}%)`
                                                        : 'Generar Citas (10)'}
                                                </Button>
                                            </div>

                                            {phrases.length > 0 ? (
                                                <Space direction="vertical" style={{ width: '100%' }}>
                                                    {phrases.map((card, idx) => (
                                                        <Card
                                                            key={idx}
                                                            size="small"
                                                            hoverable
                                                            style={{
                                                                borderRadius: '8px',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                                border: '1px solid #f0f0f0'
                                                            }}
                                                        >
                                                            <div style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif', fontSize: '15px', color: '#444' }}>
                                                                <ReactMarkdown>{card.content}</ReactMarkdown>
                                                            </div>
                                                            <div style={{ textAlign: 'right', marginTop: '10px' }}>
                                                                <Tag color="cyan">Compartir</Tag>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </Space>
                                            ) : (
                                                <Empty
                                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                    description={
                                                        <span>No hay citas guardadas. <br />
                                                            <span style={{ fontSize: '12px', color: '#888' }}>Pídele al agente que extraiga las mejores frases.</span>
                                                        </span>
                                                    }
                                                />
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    key: '4',
                                    label: (
                                        <span>
                                            <DatabaseOutlined />
                                            Contenido
                                        </span>
                                    ),
                                    children: (
                                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                            {/* Navigation/Toggle Header */}
                                            <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
                                                <Space split={<Divider type="vertical" />} style={{ width: '100%', justifyContent: 'space-between' }}>
                                                    <Space>
                                                        <BookOutlined style={{ color: '#1890ff' }} />
                                                        <Select
                                                            placeholder="Ir a sección..."
                                                            style={{ width: 180 }}
                                                            size="small"
                                                            disabled={readerMode === 'pro'}
                                                            onChange={(value) => {
                                                                const targetPage = Math.floor(value / linesPerPage) + 1;
                                                                setCurrentPage(targetPage);
                                                                setTimeout(() => {
                                                                    const el = document.getElementById(`section-${value}`);
                                                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                                }, 200);
                                                            }}
                                                            options={readerMode === 'text' ? (() => {
                                                                const lines = bookContent?.content?.split('\n') || [];
                                                                const options = [];
                                                                lines.forEach((line, idx) => {
                                                                    const trimmed = line.trim();
                                                                    const isHeader = (trimmed.length > 3 && trimmed.length < 100) && (
                                                                        /^(CHAPTER|CAPÍTULO|PART|PARTE|SECCION|SECTION|INTRODUCTION|INTRODUCCIÓN|CONCLUSION|CONCLUSIÓN|INDEX|ÍNDICE|BIBLIOGRAFÍA|BIBLIOGRAPHY)/i.test(trimmed) ||
                                                                        /^\d+\.\s+[A-Z]/.test(trimmed) ||
                                                                        (trimmed === trimmed.toUpperCase() && trimmed.length > 5 && !trimmed.includes('.'))
                                                                    );
                                                                    if (isHeader) {
                                                                        options.push({ value: idx, label: trimmed.substring(0, 40) + (trimmed.length > 40 ? '...' : '') });
                                                                    }
                                                                });
                                                                return options.length > 0 ? options : [{ value: 0, label: 'Inicio' }];
                                                            })() : [{ value: 0, label: 'Modo Pro Activo' }]}
                                                        />
                                                    </Space>
                                                    <Select
                                                        value={readerMode}
                                                        onChange={setReaderMode}
                                                        size="small"
                                                        style={{ width: 140 }}
                                                        options={[
                                                            { value: 'pro', label: '✨ Vista Pro' },
                                                            { value: 'text', label: '📝 Texto Plano' }
                                                        ]}
                                                    />
                                                </Space>
                                            </div>

                                            {/* Reader Area */}
                                            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                                                {readerMode === 'pro' ? (
                                                    <div style={{ height: '100%', width: '100%', backgroundColor: '#f0f2f5' }}>
                                                        <foliate-view
                                                            ref={foliateRef}
                                                            style={{
                                                                display: 'block',
                                                                height: '100%',
                                                                width: '100%',
                                                                "--foliate-paged-width": "100%",
                                                                "--foliate-paged-height": "100%"
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="content-scroll-container" style={{
                                                        height: '100%',
                                                        overflowY: 'auto',
                                                        padding: '24px 32px',
                                                        backgroundColor: '#fff'
                                                    }}>
                                                        {isLoadingContent ? (
                                                            <Skeleton active paragraph={{ rows: 15 }} />
                                                        ) : bookContent?.content ? (
                                                            <div style={{
                                                                whiteSpace: 'pre-wrap',
                                                                fontFamily: "'Georgia', 'Times New Roman', serif",
                                                                fontSize: '16px',
                                                                lineHeight: '1.8',
                                                                color: '#2d3436',
                                                                maxWidth: '900px',
                                                                margin: '0 auto'
                                                            }}>
                                                                {bookContent.content.split('\n')
                                                                    .slice((currentPage - 1) * linesPerPage, currentPage * linesPerPage)
                                                                    .map((line, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            id={`section-${(currentPage - 1) * linesPerPage + idx}`}
                                                                            style={{ minHeight: '1.2em' }}
                                                                        >
                                                                            {line}
                                                                        </div>
                                                                    ))}
                                                                <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '20px', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                                                                    <Pagination
                                                                        current={currentPage}
                                                                        pageSize={linesPerPage}
                                                                        total={bookContent.content.split('\n').length}
                                                                        onChange={(page) => {
                                                                            setCurrentPage(page);
                                                                            document.querySelector('.content-scroll-container')?.scrollTo(0, 0);
                                                                        }}
                                                                        showSizeChanger={false}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <Empty description="Sin texto extraído" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ),
                                },
                                {
                                    key: '5',
                                    label: (
                                        <span>
                                            <MessageOutlined />
                                            Coach
                                        </span>
                                    ),
                                    children: (
                                        <div style={{ display: 'flex', height: '100%', minHeight: '600px' }}>
                                            {/* Chat History Sidebar */}
                                            <div style={{ width: '250px', borderRight: '1px solid #f0f0f0', padding: '12px', display: 'flex', flexDirection: 'column' }}>
                                                <Button
                                                    type="dashed"
                                                    block
                                                    icon={<CommentOutlined />}
                                                    onClick={() => {
                                                        setCurrentChatId(null)
                                                        setChatMessages([])
                                                    }}
                                                    style={{ marginBottom: '12px' }}
                                                >
                                                    + Nueva Conversación
                                                </Button>
                                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                                    <Title level={5} style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Conversaciones Previas</Title>
                                                    <List
                                                        size="small"
                                                        dataSource={chatSessions || []}
                                                        renderItem={session => (
                                                            <List.Item
                                                                className={`cursor-pointer hover-bg-light ${currentChatId === session.id ? 'bg-blue-50' : ''}`}
                                                                onClick={() => setCurrentChatId(session.id)}
                                                                style={{
                                                                    padding: '8px',
                                                                    borderRadius: '4px',
                                                                    backgroundColor: currentChatId === session.id ? '#e6f7ff' : 'transparent',
                                                                    borderBottom: 'none'
                                                                }}
                                                            >
                                                                <Text ellipsis style={{ fontSize: '13px' }}>
                                                                    <MessageOutlined style={{ marginRight: 8 }} />
                                                                    {session.title || 'Chat sin título'}
                                                                </Text>
                                                            </List.Item>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {/* Chat Main Area */}
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px' }}>
                                                <div
                                                    ref={chatContainerRef}
                                                    style={{
                                                        flex: 1,
                                                        overflowY: 'auto',
                                                        padding: '12px',
                                                        marginBottom: '12px',
                                                        border: '1px solid #f0f0f0',
                                                        borderRadius: '4px',
                                                        backgroundColor: '#fafafa'
                                                    }}
                                                >
                                                    {chatMessages.length === 0 ? (
                                                        <div style={{ textAlign: 'center', marginTop: '40px', color: '#888' }}>
                                                            <RobotOutlined style={{ fontSize: '32px', marginBottom: '16px' }} />
                                                            <p>Soy tu Coach Literario. Pregúntame cómo aplicar este libro.</p>
                                                        </div>
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
                                                                            maxWidth: '85%',
                                                                            padding: '10px 16px',
                                                                            borderRadius: '12px',
                                                                            backgroundColor: msg.role === 'user' ? '#1890ff' : '#fff',
                                                                            color: msg.role === 'user' ? 'white' : 'black',
                                                                            border: msg.role === 'user' ? 'none' : '1px solid #e8e8e8',
                                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
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
                                                                        backgroundColor: '#f9f9f9',
                                                                        border: '1px solid #eee'
                                                                    }}>
                                                                        <SyncOutlined spin /> Analizando respuesta...
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div ref={chatEndRef} />
                                                        </Space>
                                                    )}
                                                </div>
                                                <Space.Compact style={{ width: '100%' }}>
                                                    <Input
                                                        placeholder="Pregúntale al Coach..."
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
                                        </div>
                                    ),
                                },
                                {
                                    key: '6',
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
