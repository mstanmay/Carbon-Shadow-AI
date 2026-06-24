import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../ThemeContext'

const TestComponent = () => {
  const { theme, setTheme, isLightTheme, themeInfo } = useTheme()
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="theme-name">{themeInfo.name}</span>
      <span data-testid="light-mode">{isLightTheme ? 'light' : 'dark'}</span>
      <button onClick={() => setTheme('light-sustainability')}>Set Light</button>
      <button onClick={() => setTheme('forest')}>Set Forest</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('provides default theme value and details', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('current-theme').textContent).toBe('dark-sustainability')
    expect(screen.getByTestId('theme-name').textContent).toBe('Dark Sustainability')
    expect(screen.getByTestId('light-mode').textContent).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark-sustainability')
  })

  it('updates the theme, localStorage, and document attributes when setTheme is called', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Switch to light theme
    fireEvent.click(screen.getByText('Set Light'))

    expect(screen.getByTestId('current-theme').textContent).toBe('light-sustainability')
    expect(screen.getByTestId('light-mode').textContent).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light-sustainability')
    expect(localStorage.getItem('carbon-shadow-theme')).toBe('light-sustainability')

    // Switch to forest theme
    fireEvent.click(screen.getByText('Set Forest'))

    expect(screen.getByTestId('current-theme').textContent).toBe('forest')
    expect(screen.getByTestId('light-mode').textContent).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('forest')
    expect(localStorage.getItem('carbon-shadow-theme')).toBe('forest')
  })
})
