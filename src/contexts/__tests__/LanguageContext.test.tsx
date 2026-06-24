import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageProvider, useLanguage } from '../LanguageContext'

// Test component that consumes LanguageContext
const TestComponent = () => {
  const { language, setLanguage, t, isRTL, currentLanguageInfo } = useLanguage()
  return (
    <div>
      <span data-testid="current-lang">{language}</span>
      <span data-testid="lang-native">{currentLanguageInfo.native}</span>
      <span data-testid="is-rtl">{isRTL ? 'rtl' : 'ltr'}</span>
      <span data-testid="translated">{t('welcome_message')}</span>
      <button onClick={() => setLanguage('hi')}>Set Hindi</button>
      <button onClick={() => setLanguage('ur')}>Set Urdu</button>
    </div>
  )
}

const listeners = new Set<(lang: string) => void>()
let currentLang = 'en'

vi.mock('react-i18next', () => {
  return {
    useTranslation: () => {
      const [lang, setLang] = React.useState(currentLang)
      React.useEffect(() => {
        const handler = (l: string) => setLang(l)
        listeners.add(handler)
        return () => {
          listeners.delete(handler)
        }
      }, [])

      return {
        t: (key: string) => `mocked_${key}_${lang}`,
        i18n: {
          language: lang,
          changeLanguage: (l: string) => {
            currentLang = l
            listeners.forEach(fn => fn(l))
          }
        }
      }
    },
    initReactI18next: {
      type: '3rdParty',
      init: vi.fn(),
    }
  }
})

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.dir = 'ltr'
    document.documentElement.lang = 'en'
  })

  it('provides default language configuration', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    expect(screen.getByTestId('current-lang').textContent).toBe('en')
    expect(screen.getByTestId('lang-native').textContent).toBe('English')
    expect(screen.getByTestId('is-rtl').textContent).toBe('ltr')
    expect(screen.getByTestId('translated').textContent).toBe('mocked_welcome_message_en')
    expect(document.documentElement.dir).toBe('ltr')
    expect(document.documentElement.lang).toBe('en')
  })

  it('updates language and document dir when switching to another language', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    // Switch to Hindi
    fireEvent.click(screen.getByText('Set Hindi'))

    expect(screen.getByTestId('current-lang').textContent).toBe('hi')
    expect(screen.getByTestId('is-rtl').textContent).toBe('ltr')
    expect(document.documentElement.dir).toBe('ltr')
    expect(document.documentElement.lang).toBe('hi')
    expect(localStorage.getItem('carbon-shadow-language')).toBe('hi')

    // Switch to Urdu (RTL)
    fireEvent.click(screen.getByText('Set Urdu'))

    expect(screen.getByTestId('current-lang').textContent).toBe('ur')
    expect(screen.getByTestId('is-rtl').textContent).toBe('rtl')
    expect(document.documentElement.dir).toBe('rtl')
    expect(document.documentElement.lang).toBe('ur')
    expect(localStorage.getItem('carbon-shadow-language')).toBe('ur')
  })
})
