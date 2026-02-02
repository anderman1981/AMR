import React, { useState, useEffect } from 'react'
import { Card, Button, Collapse, Form, Input, Radio, Rate, Empty, Spin, message, Space, Progress, Popconfirm } from 'antd'
import { FormOutlined, PlusOutlined, SaveOutlined, DeleteOutlined, CheckCircleOutlined, SyncOutlined } from '@ant-design/icons'
import * as booksService from '../services/books'

const { Panel } = Collapse
const { TextArea } = Input

function BookForms({ bookId }) {
    const [forms, setForms] = useState([])
    const [loading, setLoading] = useState(false)
    const [extracting, setExtracting] = useState(false)

    // Load forms on mount
    useEffect(() => {
        loadForms()
    }, [bookId])

    const loadForms = async () => {
        try {
            setLoading(true)
            const data = await booksService.getBookForms(bookId)
            setForms(data.forms || [])
        } catch (error) {
            console.error('Error loading forms:', error)
            message.error('Error al cargar formularios')
        } finally {
            setLoading(false)
        }
    }

    const handleExtractForms = async () => {
        try {
            setExtracting(true)
            message.loading({ content: 'Extrayendo formularios con IA...', key: 'extract', duration: 0 })

            const result = await booksService.extractBookForms(bookId)

            message.success({
                content: `${result.formsExtracted} formulario(s) extraído(s)`,
                key: 'extract',
                duration: 3
            })

            await loadForms()
        } catch (error) {
            console.error('Error extracting forms:', error)
            message.error({
                content: error.response?.data?.error || 'Error al extraer formularios',
                key: 'extract',
                duration: 5
            })
        } finally {
            setExtracting(false)
        }
    }

    const handleSaveResponses = async (formId, formInstance) => {
        try {
            const values = await formInstance.validateFields()

            await booksService.saveFormResponses(formId, values)
            message.success('Respuestas guardadas')

            // Reload to get updated timestamp
            await loadForms()
        } catch (error) {
            console.error('Error saving responses:', error)
            if (error.errorFields) {
                message.warning('Por favor completa todos los campos requeridos')
            } else {
                message.error('Error al guardar respuestas')
            }
        }
    }

    const handleDeleteForm = async (formId) => {
        try {
            await booksService.deleteForm(formId)
            message.success('Formulario eliminado')
            await loadForms()
        } catch (error) {
            console.error('Error deleting form:', error)
            message.error('Error al eliminar formulario')
        }
    }

    const renderQuestionInput = (question) => {
        switch (question.type) {
            case 'textarea':
                return <TextArea rows={4} placeholder="Escribe tu respuesta..." />

            case 'yes_no':
                return (
                    <Radio.Group>
                        <Radio value="yes">Sí</Radio>
                        <Radio value="no">No</Radio>
                    </Radio.Group>
                )

            case 'rating':
                return <Rate />

            case 'multiple_choice':
                return (
                    <Radio.Group>
                        {question.options?.map((opt, idx) => (
                            <Radio key={idx} value={opt}>{opt}</Radio>
                        )) || []}
                    </Radio.Group>
                )

            case 'text':
            default:
                return <Input placeholder="Escribe tu respuesta..." />
        }
    }

    const calculateProgress = (form) => {
        if (!form.userResponses) return 0
        const totalQuestions = form.questions.length
        const answeredQuestions = Object.keys(form.userResponses).filter(
            key => form.userResponses[key] !== undefined && form.userResponses[key] !== ''
        ).length
        return Math.round((answeredQuestions / totalQuestions) * 100)
    }

    if (loading) {
        return (
            <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin tip="Cargando formularios..." />
            </Card>
        )
    }

    return (
        <Card
            title={<><FormOutlined style={{ marginRight: 8, color: '#52c41a' }} /> Formularios Interactivos</>}
            style={{ height: '100%', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { flex: 1, overflowY: 'auto', padding: '12px' } }}
            extra={
                <Button
                    type="primary"
                    icon={extracting ? <SyncOutlined spin /> : <PlusOutlined />}
                    onClick={handleExtractForms}
                    loading={extracting}
                    size="small"
                >
                    Extraer Formularios
                </Button>
            }
        >
            {forms.length === 0 ? (
                <Empty
                    description="No hay formularios extraídos"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ marginTop: '50px' }}
                >
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleExtractForms}>
                        Extraer Formularios del Libro
                    </Button>
                </Empty>
            ) : (
                <Collapse accordion>
                    {forms.map(form => (
                        <FormPanel
                            key={form.id}
                            form={form}
                            onSave={handleSaveResponses}
                            onDelete={handleDeleteForm}
                            renderQuestionInput={renderQuestionInput}
                            calculateProgress={calculateProgress}
                        />
                    ))}
                </Collapse>
            )}
        </Card>
    )
}

// Separate component to properly use Form.useForm() hook
function FormPanel({ form, onSave, onDelete, renderQuestionInput, calculateProgress }) {
    const [formInstance] = Form.useForm()
    const progress = calculateProgress(form)

    return (
        <Panel
            key={form.id}
            header={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span>
                        {form.title}
                        {form.pageNumber && <span style={{ color: '#999', fontSize: '12px', marginLeft: '8px' }}>
                            (Pág. {form.pageNumber})
                        </span>}
                    </span>
                    {progress > 0 && (
                        <div style={{ width: '100px', marginLeft: '16px' }}>
                            <Progress
                                percent={progress}
                                size="small"
                                status={progress === 100 ? 'success' : 'active'}
                                showInfo={false}
                            />
                        </div>
                    )}
                </div>
            }
            extra={
                <Popconfirm
                    title="¿Eliminar este formulario?"
                    onConfirm={(e) => {
                        e.stopPropagation()
                        onDelete(form.id)
                    }}
                    okText="Sí"
                    cancelText="No"
                >
                    <DeleteOutlined
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: '#ff4d4f' }}
                    />
                </Popconfirm>
            }
        >
            <Form
                form={formInstance}
                layout="vertical"
                initialValues={form.userResponses || {}}
                style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}
            >
                {form.questions.map((question, idx) => (
                    <Form.Item
                        key={question.id}
                        name={question.id}
                        label={`${idx + 1}. ${question.text}`}
                        rules={[{ required: false }]}
                    >
                        {renderQuestionInput(question)}
                    </Form.Item>
                ))}

                <Form.Item style={{ marginTop: '16px', marginBottom: 0 }}>
                    <Space>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={() => onSave(form.id, formInstance)}
                        >
                            Guardar Respuestas
                        </Button>
                        {form.lastUpdated && (
                            <span style={{ fontSize: '12px', color: '#999' }}>
                                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px' }} />
                                Guardado: {new Date(form.lastUpdated).toLocaleString('es-ES')}
                            </span>
                        )}
                    </Space>
                </Form.Item>
            </Form>
        </Panel>
    )
}

export default BookForms
