import React, { useState } from 'react'
import { Card, Upload, Button, Space, Typography, message, Table, Tag, Progress, Modal, List, Divider } from 'antd'
import { InboxOutlined, FolderOpenOutlined, SyncOutlined, RobotOutlined, SearchOutlined, MessageOutlined, BookOutlined, EyeOutlined, FileTextOutlined, DatabaseOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import { useDropzone } from 'react-dropzone'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import * as booksService from '../services/books'

const { Title, Text } = Typography
const { Dragger } = Upload

function Books() {
  const [booksPath, setBooksPath] = useState('/app/books')
  const [selectedBook, setSelectedBook] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const queryClient = useQueryClient()

  // Query para obtener libros
  const { data: books, isLoading, error } = useQuery(
    'books',
    booksService.getBooks,
    { refetchInterval: 2000 } // Refrescar cada 2000ms
  )

  // Query para obtener configuración
  const { data: config } = useQuery('books-config', booksService.getBooksConfig)

  // Query for selected book cards (new)
  const { data: bookCards, isLoading: isLoadingCards } = useQuery(
    ['book-cards', selectedBook?.id],
    () => booksService.getBookCards(selectedBook?.id),
    {
      enabled: !!selectedBook,
      staleTime: 0
    }
  )

  // Mutation para actualizar ruta de libros
  const updatePathMutation = useMutation(booksService.updateBooksPath, {
    onSuccess: () => {
      message.success('Ruta de libros actualizada correctamente')
      queryClient.invalidateQueries('books-config')
    },
    onError: () => {
      message.error('Error al actualizar la ruta de libros')
    }
  })

  // Mutation para escanear libros
  const scanMutation = useMutation(booksService.scanBooks, {
    onSuccess: () => {
      message.success('Escaneo de libros iniciado')
      queryClient.invalidateQueries('books')
    },
    onError: () => {
      message.error('Error al iniciar el escaneo')
    }
  })

  // Configuración de Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/epub+zip': ['.epub'],
      'application/x-mobipocket-ebook': ['.mobi'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    onDrop: (acceptedFiles) => {
      handleFileUpload(acceptedFiles)
    }
  })

  const handleFileUpload = async (files) => {
    try {
      for (const file of files) {
        await booksService.uploadBook(file)
      }
      message.success(`${files.length} libros subidos correctamente`)
      queryClient.invalidateQueries('books')
    } catch (error) {
      message.error('Error al subir los libros')
    }
  }

  const handlePathUpdate = (newPath) => {
    updatePathMutation.mutate({ path: newPath })
  }

  const handleScan = () => {
    scanMutation.mutate()
  }

  // Mutation para crear tareas de agentes
  const createTaskMutation = useMutation(booksService.createBookTask, {
    onSuccess: (data) => {
      message.success(data.message || 'Tarea creada correctamente')
      queryClient.invalidateQueries('books')
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || 'Error al crear la tarea'
      message.error(errorMsg)
    }
  })

  const handleCreateTask = (id, type) => {
    createTaskMutation.mutate({ id, type })
  }

  const handleStatusClick = (book) => {
    setSelectedBook(book)
    setIsModalVisible(true)
  }

  const handleCloseModal = () => {
    setIsModalVisible(false)
    setSelectedBook(null)
  }

  // Columnas para la tabla de libros
  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Categoría',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag>
    },
    {
      title: 'Formato',
      dataIndex: 'format',
      key: 'format',
      render: (format) => <Tag>{format.toUpperCase()}</Tag>
    },
    {
      title: 'Tamaño',
      dataIndex: 'size',
      key: 'size',
      render: (size) => `${(size / 1024 / 1024).toFixed(2)} MB`
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const isCompleted = record.progress === 100
        const isProcessing = (status === 'processing' || !!record.active_task_id) && !isCompleted
        
        const displayStatus = isCompleted ? 'Procesado' : isProcessing ? 'Procesando' : 'Pendiente'
        const color = isCompleted ? '#f6ffed' : isProcessing ? 'orange' : 'default'
        const borderColor = isCompleted ? '#b7eb8f' : undefined
        const textColor = isCompleted ? '#52c41a' : undefined

        return (
          <Space direction="vertical" size={0}>
            <Tag
              color={color}
              style={{ 
                cursor: 'pointer', 
                margin: 0, 
                backgroundColor: isCompleted ? color : undefined,
                borderColor: borderColor,
                color: textColor
              }}
              onClick={() => handleStatusClick(record)}
            >
              {displayStatus}
            </Tag>
            {isProcessing && record.active_task_status && (
              <Text type="secondary" style={{ fontSize: '10px' }}>
                {record.active_task_status.toUpperCase()}
              </Text>
            )}
          </Space>
        )
      }
    },
    {
      title: 'Progreso',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress, record) => (
        <Progress
          percent={progress}
          size="small"
          status={record.status === 'processing' ? 'active' : progress === 100 ? 'success' : 'normal'}
        />
      )
    },
    {
      title: 'Acciones de Agentes',
      key: 'actions',
      render: (_, record) => {
        const isProcessing = record.status === 'processing' || !!record.active_task_id
        const today = new Date().getDay()
        const isMondayOrTuesday = today === 1 || today === 2

        return (
          <Space size="middle">
            <Button
              type="primary"
              size="small"
              icon={<RobotOutlined />}
              disabled={isProcessing || record.has_content || createTaskMutation.isLoading}
              onClick={() => handleCreateTask(record.id, 'reader')}
            >
              Reader
            </Button>
            <Button
              size="small"
              icon={<SearchOutlined />}
              disabled={isProcessing || record.has_summary || createTaskMutation.isLoading}
              onClick={() => handleCreateTask(record.id, 'extractor')}
            >
              Extractor
            </Button>
            <Button
              size="small"
              icon={<MessageOutlined />}
              disabled={isProcessing || (record.has_quotes && !isMondayOrTuesday) || createTaskMutation.isLoading}
              onClick={() => handleCreateTask(record.id, 'phrases')}
            >
              Phrases
            </Button>
          </Space>
        )
      }
    }
  ]

  return (
    <div>
      <Title level={2}>📚 Gestión de Libros</Title>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>

        {/* Configuración de Ruta Física */}
        <Card title="📁 Configuración de Ruta Física" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Ruta actual de libros: </Text>
              <Text code>{config?.booksPath || booksPath}</Text>
            </div>
            <Space>
              <Button
                type="primary"
                icon={<FolderOpenOutlined />}
                onClick={() => handlePathUpdate('/ruta/nueva')}
              >
                Cambiar Ruta
              </Button>
              <Button
                icon={<SyncOutlined />}
                loading={scanMutation.isLoading}
                onClick={handleScan}
              >
                Escanear Libros
              </Button>
            </Space>
          </Space>
        </Card>

        {/* Subida de Archivos */}
        <Card title="📤 Subir Libros" size="small">
          <Dragger
            {...getRootProps()}
            multiple
            showUploadList={false}
            style={{ padding: '20px' }}
          >
            <input {...getInputProps()} />
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">
              {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra y suelta libros aquí, o haz clic para seleccionar'}
            </p>
            <p className="ant-upload-hint">
              Soporta PDF, EPUB, MOBI, TXT y DOCX
            </p>
          </Dragger>
        </Card>

        {/* Tabla de Libros */}
        <Card title="📖 Libros Disponibles" size="small">
          <Table
            columns={columns}
            dataSource={books}
            loading={isLoading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} libros`
            }}
            scroll={{ x: true }}
          />
        </Card>

        {/* Estadísticas */}
        <Card title="📊 Estadísticas" size="small">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <Text type="secondary">Total de libros</Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {books?.length || 0}
              </div>
            </div>
            <div>
              <Text type="secondary">Procesados</Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {books?.filter(b => b.status === 'processed').length || 0}
              </div>
            </div>
            <div>
              <Text type="secondary">En procesamiento</Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                {books?.filter(b => b.status === 'processing').length || 0}
              </div>
            </div>
            <div>
              <Text type="secondary">Pendientes</Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d9d9d9' }}>
                {books?.filter(b => b.status === 'pending').length || 0}
              </div>
            </div>
          </div>
        </Card>

      </Space>

      {/* Modal de Análisis Detallado */}
      <Modal
        title={
          <Space>
            <BookOutlined />
            <Text strong>{selectedBook?.name}</Text>
          </Space>
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Cerrar
          </Button>,
          <Button
            key="viewer"
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => {
              window.open(`/books/${selectedBook.id}`, '_blank')
              handleCloseModal()
            }}
          >
            Ver Análisis Completo y PDF
          </Button>
        ]}
        width={700}
        styles={{ body: { maxHeight: '60vh', overflowY: 'auto', padding: '20px' } }}
      >
        {isLoadingCards ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <SyncOutlined spin style={{ fontSize: '24px' }} /> <br />
            <Text type="secondary">Cargando análisis...</Text>
          </div>
        ) : (
          <div className="book-summary-container">
            <Divider orientation="left">Reporte de Inteligencia Colectiva</Divider>

            <Card
              style={{
                background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
                borderRadius: '12px',
                border: '1px solid #bae7ff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
                <SyncOutlined spin={selectedBook?.status === 'processing'} style={{ fontSize: '20px', color: '#1890ff', marginRight: 10 }} />
                <Title level={4} style={{ margin: 0, color: '#0050b3' }}>Hallazgos de Agentes</Title>
              </div>

              <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#262626' }}>
                {(() => {
                  const summaries = bookCards?.filter(c => c.type === 'summary') || []
                  if (summaries.length > 0) {
                    const uniqueSummaries = Array.from(new Set(summaries.map(s => s.content.trim())))
                    return (
                      <div style={{ marginBottom: 15 }}>
                        <ReactMarkdown>{uniqueSummaries[0]}</ReactMarkdown>
                      </div>
                    )
                  }
                  return (
                    <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                      <Text italic>Los agentes aún no han consolidado un reporte maestro. Inicia el procesamiento para obtener resultados.</Text>
                    </div>
                  )
                })()}
              </div>

              {/* Advanced Findings Sections */}
              {bookCards?.some(c => c.type === 'key_points') && (
                <>
                  <Divider style={{ margin: '15px 0' }} />
                  <Title level={5}>💡 Insights y Extracciones</Title>
                  <div style={{ padding: '0 10px' }}>
                    {bookCards.filter(c => c.type === 'key_points').map((card) => (
                      <div key={card.id} style={{ marginBottom: 10 }}>
                        <ReactMarkdown>{card.content}</ReactMarkdown>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {bookCards?.some(c => c.type === 'quotes') && (
                <>
                  <Divider style={{ margin: '15px 0' }} />
                  <Title level={5}>💬 Citas Memorables</Title>
                  <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px', borderLeft: '4px solid #1890ff' }}>
                    {bookCards.filter(c => c.type === 'quotes').map((card) => (
                      <div key={card.id} style={{ marginBottom: 15, fontStyle: 'italic' }}>
                        <ReactMarkdown>{card.content}</ReactMarkdown>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Divider style={{ margin: '12px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <Space>
                  <Tag color="cyan" icon={<RobotOutlined />}>Lectura Profunda: OK</Tag>
                  <Tag color="geekblue" icon={<DatabaseOutlined />}>Extracciones: {bookCards?.filter(c => c.type === 'key_points').length || 0}</Tag>
                  <Tag color="purple" icon={<MessageOutlined />}>Citas: {bookCards?.filter(c => c.type === 'quotes').length || 0}</Tag>
                </Space>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Análisis verificado por motor AMROIS
                </Text>
              </div>
            </Card>

            <div style={{ marginTop: 25, textAlign: 'right' }}>
              <Space>
                <Text type="secondary">Total de hallazgos:</Text>
                <Tag icon={<FileTextOutlined />}>{bookCards?.length || 0} Cards</Tag>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Books