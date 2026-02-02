import React, { useState } from 'react'
import { Card, Upload, Button, Space, Typography, message, Table, Tag, Progress, Modal, List } from 'antd'
import { InboxOutlined, FolderOpenOutlined, SyncOutlined, RobotOutlined, SearchOutlined, MessageOutlined } from '@ant-design/icons'
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
      render: (status, record) => (
        <Tag
          color={status === 'processed' ? 'green' : status === 'processing' ? 'orange' : 'default'}
          style={{ cursor: 'pointer' }}
          onClick={() => handleStatusClick(record)}
        >
          {status === 'processed' ? 'Procesado' : status === 'processing' ? 'Procesando' : 'Pendiente'}
        </Tag>
      )
    },
    {
      title: 'Progreso',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => <Progress percent={progress} size="small" />
    },
    {
      title: 'Acciones de Agentes',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            icon={<RobotOutlined />}
            disabled={record.status === 'processing' || createTaskMutation.isLoading}
            onClick={() => handleCreateTask(record.id, 'reader')}
          >
            Reader
          </Button>
          <Button
            size="small"
            icon={<SearchOutlined />}
            disabled={record.status === 'processing' || createTaskMutation.isLoading}
            onClick={() => handleCreateTask(record.id, 'extractor')}
          >
            Extractor
          </Button>
          <Button
            size="small"
            icon={<MessageOutlined />}
            disabled={record.status === 'processing' || createTaskMutation.isLoading}
            onClick={() => handleCreateTask(record.id, 'phrases')}
          >
            Phrases
          </Button>
        </Space>
      )
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

      {/* Agent Results Modal */}
      <Modal
        title={selectedBook ? `Análisis: ${selectedBook.name}` : 'Detalles de Procesamiento'}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Cerrar
          </Button>
        ]}
        width={700}
      >
        {isLoadingCards ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <SyncOutlined spin style={{ fontSize: '24px' }} /> <br /> Cargando análisis...
          </div>
        ) : (
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={bookCards}
            renderItem={item => (
              <List.Item>
                <Card title={<Tag color="blue">{item.type.toUpperCase()}</Tag>} size="small" style={{ width: '100%' }}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{item.content}</div>
                  <div style={{ marginTop: '10px' }}>
                    {item.tags && (() => {
                      try {
                        const parsedTags = typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags;
                        return Array.isArray(parsedTags) ? parsedTags.map(tag => (
                          <Tag key={tag} color="cyan">{tag}</Tag>
                        )) : null;
                      } catch (e) {
                        return null;
                      }
                    })()}
                  </div>
                </Card>
              </List.Item>
            )}
            locale={{ emptyText: 'No hay análisis generados aún. Ejecuta un agente.' }}
          />
        )}
      </Modal>
    </div>
  )
}

export default Books