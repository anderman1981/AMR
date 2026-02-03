import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout, Button, Space, Typography, Card, Tag, Divider, Skeleton, Empty, Breadcrumb, List, Input, message as antdMessage, Tabs, Select } from 'antd'
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
    const [chatInput, setChatInput] = useState('')
    const [isChatLoading, setIsChatLoading] = useState(false)
    const chatEndRef = useRef(null)
    const chatContainerRef = useRef(null)

    // Content Pagination State
    const [visibleLines, setVisibleLines] = useState(500)


    // Fetch book details
    const { data: book, isLoading: isLoadingBook } = useQuery(['book', id], () => booksService.getBook(id), { enabled: !!id })

    // Fetch book cards/analysis
    const { data: bookCards, isLoading: isLoadingCards } = useQuery(
        ['book-cards', id],
        () => booksService.getBookCards(id),
        { enabled: !!id }
    )

    const isLoading = isLoadingBook || isLoadingCards

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
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <Title level={5} style={{ margin: 0 }}>Análisis Estructural</Title>
                                                <Button
                                                    size="small"
                                                    type="primary"
                                                    icon={<RobotOutlined />}
                                                    disabled={!!book?.active_task_id || book?.has_content}
                                                    onClick={() => handleTriggerAgent('reader')}
                                                >
                                                    Generar Análisis
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
                                                    disabled={!!book?.active_task_id || book?.has_summary}
                                                    onClick={() => handleTriggerAgent('extractor')}
                                                >
                                                    Extraer Insights
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
                                                    disabled={!!book?.active_task_id || (book?.has_quotes && (new Date().getDay() !== 1 && new Date().getDay() !== 2))}
                                                    onClick={() => handleTriggerAgent('phrases')}
                                                >
                                                    Generar Citas (10)
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
                                            {/* Section Navigator */}
                                            {bookContent?.content && (
                                                <div style={{ padding: '0 12px 12px 12px', borderBottom: '1px solid #f0f0f0' }}>
                                                    <Space>
                                                        <ReadOutlined style={{ color: '#1890ff' }} />
                                                        <Text strong style={{ fontSize: '14px' }}>Navegar:</Text>
                                                        <Select
                                                            style={{ width: 250 }}
                                                            placeholder="Seleccionar sección..."
                                                            onChange={(value) => {
                                                                const el = document.getElementById(`section-${value}`);
                                                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                            }}
                                                            options={(() => {
                                                                // Simple Heuristic for Sections
                                                                const lines = bookContent.content.split('\n');
                                                                const options = [];
                                                                lines.forEach((line, idx) => {
                                                                    const trimmed = line.trim();
                                                                    // Look for typical headers: Uppercase short lines, or "Chapter X", "1. Title"
                                                                    const isHeader =
                                                                        (trimmed.length > 3 && trimmed.length < 100) && (
                                                                            /^(CHAPTER|CAPÍTULO|PART|PARTE|SECCION|SECTION|INTRODUCTION|INTRODUCCIÓN|CONCLUSION|CONCLUSIÓN|INDEX|ÍNDICE|BIBLIOGRAFÍA|BIBLIOGRAPHY)/i.test(trimmed) ||
                                                                            /^\d+\.\s+[A-Z]/.test(trimmed) || // 1. Title
                                                                            (trimmed === trimmed.toUpperCase() && trimmed.length > 5 && !trimmed.includes('.')) // ALL CAPS HEADER
                                                                        );

                                                                    if (isHeader) {
                                                                        options.push({ value: idx, label: trimmed.substring(0, 40) + (trimmed.length > 40 ? '...' : '') });
                                                                    }
                                                                });
                                                                return options.length > 0 ? options : [{ value: 0, label: 'Inicio' }];
                                                            })()}
                                                        />
                                                    </Space>
                                                </div>
                                            )}

                                            {/* Scrollable Content Container */}
                                            <div style={{
                                                flex: 1,
                                                overflowY: 'auto',
                                                padding: '24px 32px',
                                                backgroundColor: '#fff',
                                                minHeight: 0
                                            }}>
                                                {isLoadingContent ? (
                                                    <div style={{ padding: '20px' }}><Skeleton active paragraph={{ rows: 10 }} /></div>
                                                ) : (
                                                    <div style={{
                                                        whiteSpace: 'pre-wrap',
                                                        fontFamily: "'Georgia', 'Times New Roman', serif",
                                                        fontSize: '16px',
                                                        lineHeight: '1.8',
                                                        color: '#2d3436',
                                                        maxWidth: '900px',
                                                        margin: '0 auto'
                                                    }}>
                                                        {bookContent?.content ? (
                                                            <>
                                                                {bookContent.content.split('\n').slice(0, visibleLines).map((line, idx) => {
                                                                    // Apply simple highlighting to potential headers visually
                                                                    const isHeader = line.trim().length > 0 && line.trim().length < 100 && line.trim() === line.trim().toUpperCase();
                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            id={`section-${idx}`}
                                                                            style={{
                                                                                minHeight: '1.2em',
                                                                                marginBottom: isHeader ? '1em' : '0',
                                                                                fontWeight: isHeader ? 'bold' : 'normal',
                                                                                marginTop: isHeader ? '2em' : '0'
                                                                            }}
                                                                        >
                                                                            {line}
                                                                        </div>
                                                                    )
                                                                })}
                                                                {bookContent.content.split('\n').length > visibleLines && (
                                                                    <div style={{ textAlign: 'center', marginTop: '30px', paddingBottom: '20px' }}>
                                                                        <Button
                                                                            type="dashed"
                                                                            onClick={() => setVisibleLines(prev => prev + 500)}
                                                                            loading={false}
                                                                        >
                                                                            Cargar más contenido...
                                                                        </Button>
                                                                        <div style={{ marginTop: '10px', color: '#999', fontSize: '12px' }}>
                                                                            Mostrando {visibleLines} de {bookContent.content.split('\n').length} líneas
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <Empty description="No se encontró contenido de texto para este libro." />
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
                                                    <div style={{ textAlign: 'center', marginTop: '20px', color: '#888' }}>
                                                        <RobotOutlined style={{ fontSize: '24px', marginBottom: '10px' }} />
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
                                                                        maxWidth: '80%',
                                                                        padding: '8px 12px',
                                                                        borderRadius: '8px',
                                                                        backgroundColor: msg.role === 'user' ? '#1890ff' : '#f9f9f9',
                                                                        color: msg.role === 'user' ? 'white' : 'black',
                                                                        border: msg.role === 'user' ? 'none' : '1px solid #eee'
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
                                                                    backgroundColor: '#f9f9f9'
                                                                }}>
                                                                    <SyncOutlined spin /> Analizando respuesta...
                                                                </div>
                                                            </div>
                                                        )}
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
