import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout, Button, Space, Typography, Card, Tag, Divider, Skeleton, Empty, Breadcrumb } from 'antd'
import { ArrowLeftOutlined, BookOutlined, FilePdfOutlined, DatabaseOutlined, SyncOutlined } from '@ant-design/icons'
import { useQuery } from 'react-query'
import ReactMarkdown from 'react-markdown'
import * as booksService from '../services/books'

const { Header, Content, Sider } = Layout
const { Title, Text } = Typography

function BookDetail() {
    const { id } = useParams()
    const navigate = useNavigate()

    // Fetch book details
    const { data: books, isLoading: isLoadingBook } = useQuery('books', booksService.getBooks)
    const book = books?.find(b => b.id.toString() === id.toString())

    // Fetch book cards/analysis
    const { data: bookCards, isLoading: isLoadingCards } = useQuery(
        ['book-cards', id],
        () => booksService.getBookCards(id),
        { enabled: !!id }
    )

    const isLoading = isLoadingBook || isLoadingCards

    if (isLoading) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <SyncOutlined spin style={{ fontSize: '32px', marginBottom: '20px' }} />
                <Skeleton active />
            </div>
        )
    }

    if (!book) {
        return (
            <div style={{ padding: '50px' }}>
                <Empty description="Libro no encontrado" />
                <Button onClick={() => navigate('/books')}>Volver a Libros</Button>
            </div>
        )
    }

    // Build the PDF URL (using the backend static route)
    const pdfUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:4126'}/data/books/${encodeURIComponent(book.name)}`

    return (
        <Layout style={{ height: 'calc(100vh - 120px)', background: '#fff' }}>
            <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 'auto', lineHeight: 'normal', paddingBottom: '10px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item href="#" onClick={(e) => { e.preventDefault(); navigate('/books'); }}>Libros</Breadcrumb.Item>
                    <Breadcrumb.Item>{book.name}</Breadcrumb.Item>
                </Breadcrumb>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={3} style={{ margin: 0 }}>
                        <BookOutlined style={{ marginRight: 10 }} />
                        {book.name}
                    </Title>
                    <Space>
                        <Tag color="blue">{book.category_id || 'GENERAL'}</Tag>
                        <Tag color={book.processed ? 'green' : 'orange'}>
                            {book.processed ? 'PROCESADO' : 'PENDIENTE'}
                        </Tag>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/books')}>
                            Volver
                        </Button>
                    </Space>
                </div>
            </Header>

            <Layout>
                {/* PDF Viewer Section */}
                <Content style={{ borderRight: '1px solid #f0f0f0', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ height: '100%', width: '100%' }}>
                        <iframe
                            src={pdfUrl}
                            title="PDF Viewer"
                            style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                    </div>
                </Content>

                {/* Database Analysis Section */}
                <Sider width="40%" theme="light" style={{ overflowY: 'auto', padding: '24px' }}>
                    <Title level={4}>
                        <DatabaseOutlined style={{ marginRight: 10 }} />
                        Análisis de la Base de Datos
                    </Title>
                    <Divider />

                    {bookCards && bookCards.length > 0 ? (
                        bookCards.map((card, idx) => (
                            <Card
                                key={idx}
                                title={<Tag color="blue">{card.type.toUpperCase()}</Tag>}
                                style={{ marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                                size="small"
                            >
                                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                                    <ReactMarkdown>{card.content}</ReactMarkdown>
                                </div>
                                {card.tags && (
                                    <div style={{ marginTop: 15 }}>
                                        {(() => {
                                            try {
                                                const tags = typeof card.tags === 'string' ? JSON.parse(card.tags) : card.tags;
                                                return Array.isArray(tags) ? tags.map(t => <Tag key={t} color="cyan" style={{ marginBottom: 5 }}>{t}</Tag>) : null;
                                            } catch (e) { return null; }
                                        })()}
                                    </div>
                                )}
                            </Card>
                        ))
                    ) : (
                        <Empty description="No hay análisis generados para este libro aún." />
                    )}
                </Sider>
            </Layout>
        </Layout>
    )
}

export default BookDetail 
