import React from 'react'
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride'

const steps = [
    {
        target: '[data-tour="upload-button"]',
        content: '¡Empieza subiendo tu primer libro aquí! Soportamos PDF, EPUB, MOBI y más.',
        disableBeacon: true,
    },
    {
        target: '[data-tour="books-list"]',
        content: 'Aquí verás todos tus libros. Haz click en cualquiera para ver detalles y análisis.',
    },
    {
        target: '[data-tour="agent-trigger"]',
        content: 'Usa agentes IA para generar análisis automático: resúmenes, insights y citas.',
    },
    {
        target: '[data-tour="chat-coach"]',
        content: 'Pregúntale al Coach sobre cualquier libro o consulta toda tu biblioteca.',
    },
]

export default function OnboardingTour({ run, onFinish }) {
    const handleJoyrideCallback = (data) => {
        const { status, type } = data

        if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
            // Update state to advance the tour
        }

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            // Mark tour as completed
            localStorage.setItem('onboarding_completed', 'true')
            if (onFinish) onFinish()
        }
    }

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showProgress
            showSkipButton
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    primaryColor: '#1890ff',
                    zIndex: 10000,
                },
            }}
            locale={{
                back: 'Atrás',
                close: 'Cerrar',
                last: 'Finalizar',
                next: 'Siguiente',
                skip: 'Saltar',
            }}
        />
    )
}
