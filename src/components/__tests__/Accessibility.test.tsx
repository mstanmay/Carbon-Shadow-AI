import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CarbonDashboard from '../CarbonDashboard'
import Hero from '../Hero'

// Setup mocks
const mockSetTab = vi.fn()
let currentTabState = 'dashboard'

vi.mock('../../stores/carbonStore', () => ({
  useCarbonStore: vi.fn((selector) => {
    const state = {
      currentTab: currentTabState,
      setTab: (tab: string) => {
        currentTabState = tab
        mockSetTab(tab)
      },
      user: { id: 1, email: 'judge@hackathon.com', role: 'user' },
      logout: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      copilotAlerts: [],
      fetchDashboardStats: vi.fn(),
      fetchCopilotAlerts: vi.fn(),
      chatHistory: [],
      activeSimulation: null,
      isLoading: false,
    }
    return selector(state)
  })
}))

vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en',
    languages: [
      { code: 'en', name: 'English', native: 'English', script: 'Latin' },
    ],
    setLanguage: vi.fn(),
  }),
}))

vi.mock('../../contexts/WalletContext', () => ({
  useWallet: () => ({
    isConnected: false,
    address: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
}))

// Mock sub-widgets and selectors to avoid complex renders
vi.mock('../LanguageSelector', () => ({ default: () => <div data-testid="lang-selector">LanguageSelector</div> }))
vi.mock('../ThemeSelector', () => ({ default: () => <div data-testid="theme-selector">ThemeSelector</div> }))
vi.mock('../WalletConnectModal', () => ({ default: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div data-testid="wallet-modal">Wallet Modal</div> : null }))
vi.mock('../AIAssistant', () => ({ default: () => <div data-testid="ai-assistant">AI</div> }))
vi.mock('../TimeMachine', () => ({ default: () => <div data-testid="time-machine">TM</div> }))
vi.mock('../AnalyticsView', () => ({ default: () => <div data-testid="analytics-view">AV</div> }))
vi.mock('../SettingsView', () => ({ default: () => <div data-testid="settings-view">SV</div> }))
vi.mock('../TimelineWidget', () => ({ default: () => <div>TL</div> }))
vi.mock('../FutureTwinWidget', () => ({ default: () => <div>FT</div> }))
vi.mock('../RegretEngineWidget', () => ({ default: () => <div>RE</div> }))
vi.mock('../NotificationCenter', () => ({ default: () => <div>NC</div> }))
vi.mock('../EcoRewards', () => ({ default: () => <div data-testid="rewards-view">Rewards</div> }))

describe('Accessibility & Focus Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    currentTabState = 'dashboard'
  })

  it('contains skip navigation link in Hero targeting main content', () => {
    render(<Hero />)
    const heroSkipLink = screen.getByText('skip_navigation')
    expect(heroSkipLink).toBeInTheDocument()
    expect(heroSkipLink.getAttribute('href')).toBe('#main-content')
  })

  it('contains skip navigation link in Dashboard targeting dashboard content', () => {
    render(<CarbonDashboard voiceEnabled={false} setVoiceEnabled={vi.fn()} />)
    const dashSkipLink = screen.getByText('skip_navigation')
    expect(dashSkipLink).toBeInTheDocument()
    expect(dashSkipLink.getAttribute('href')).toBe('#main-dashboard-content')
  })

  it('implements tablist and tab roles in the dashboard header', () => {
    render(<CarbonDashboard voiceEnabled={false} setVoiceEnabled={vi.fn()} />)
    
    const tablist = screen.getByRole('tablist', { name: /Workspace Navigation/i })
    expect(tablist).toBeInTheDocument()

    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBeGreaterThan(2)
    
    // Default selected tab should be dashboard
    const dashTab = screen.getByRole('tab', { name: /nav_workspace/i })
    expect(dashTab.getAttribute('aria-selected')).toBe('true')
  })

  it('supports keyboard navigation traversal (Arrow keys) on dashboard tabs', () => {
    render(<CarbonDashboard voiceEnabled={false} setVoiceEnabled={vi.fn()} />)
    
    const dashTab = screen.getByRole('tab', { name: /nav_workspace/i })
    
    // Focus the dashboard tab first
    dashTab.focus()
    expect(document.activeElement).toBe(dashTab)

    // Press ArrowRight to move to the Time Machine tab
    fireEvent.keyDown(dashTab, { key: 'ArrowRight' })
    expect(mockSetTab).toHaveBeenCalledWith('timemachine')
  })
})
