import React, { useState } from 'react'
import { Card, Upload, Button, Space, Typography, message, Table, Tag, Progress } from 'antd'
import { InboxOutlined, FolderOpenOutlined, SyncOutlined } from '@ant-design/icons'
import { useDropzone } from 'react-dropzone'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import * as booksService from '../services/books'

const { Title, Text } = Typography
const { Dragger } = Upload

function Books() {
  const [booksPath, setBooksPath] = useState('/app/books')
  const queryClient = useQueryClient()

  // Query para obtener libros
  const { data: books, isLoading, error } = useQuery(
    'books',
    booksService.getBooks,
    { refetchInterval: 30000 } // Refrescar cada 30 segundos
  )

  // Query para obtener configuración
  const { data: config } = useQuery('books-config', booksService.getBooksConfig)

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

  // Mutation para crear tareas
  const taskMutation = useMutation(({ id, type }) => booksService.createTask(id, type), {
    onSuccess: (data, variables) => {
      message.success(`Tarea '${variables.type}' iniciada para el libro`)
      queryClient.invalidateQueries('books')
    },
    onError: () => {
      message.error('Error al crear la tarea')
    }
  })

  const handleCreateTask = (id, type) => {
    taskMutation.mutate({ id, type })
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
      render: (status) => (
        <Tag color={status === 'processed' ? 'green' : status === 'processing' ? 'orange' : 'default'}>
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
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            type="primary"
            ghost
            onClick={() => handleCreateTask(record.id, 'reader')}
            disabled={record.status === 'processing'}
          >
            📖 Leer
          </Button>
          <Button
            size="small"
            onClick={() => handleCreateTask(record.id, 'extractor')}
          >
            🧪 Extraer
          </Button>
          <Button
            size="small"
            onClick={() => handleCreateTask(record.id, 'phrases')}
          >
            💬 Frases
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
    </div>
  )
}

export default Books