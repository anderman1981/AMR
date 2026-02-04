import React, { useState } from 'react'
import { Row, Col, Typography } from 'antd'
import GlobalChat from '../components/GlobalChat'
import ChatHistory from '../components/ChatHistory'

const { Title } = Typography

function Coach() {
    const [currentChatId, setCurrentChatId] = useState(null)

    return (
        <div>
            <Title level={2}>🤖 AMR Coach</Title>
            <Row gutter={[16, 16]} style={{ height: 'calc(100vh - 100px)' }}>
                {/* Chat Interface */}
                <Col xs={24} lg={16} style={{ height: '100%' }}>
                    <div style={{ height: '100%' }}>
                        <GlobalChat
                            currentChatId={currentChatId}
                            onNewChat={() => setCurrentChatId(null)}
                            onChatCreated={(id) => setCurrentChatId(id)}
                        />
                    </div>
                </Col>

                {/* Chat History */}
                <Col xs={24} lg={8} style={{ height: '100%' }}>
                    <ChatHistory
                        onSelectSession={setCurrentChatId}
                        selectedSessionId={currentChatId}
                    />
                </Col>
            </Row>
        </div>
    )
}

export default Coach
