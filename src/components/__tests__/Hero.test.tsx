import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Hero from '../Hero'

// Define mock functions outside with 'mock' prefix so Vitest doesn't throw a hoist reference error
const mockRunSimulation = vi.fn()
const mockSetTab = vi.fn()
const mockConnect = vi.fn()
const mockDisconnect = vi.fn()

vi.mock('../../stores/carbonStore', () => ({
  useCarbonStore: vi.fn((selector) => {
    const state = {
      runSimulation: mockRunSimulation,
      setTab: mockSetTab,
    }
    return selector(state)
  })
}))

vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('../../contexts/WalletContext', () => ({
  useWallet: () => ({
    isConnected: false,
    address: null,
    connect: mockConnect,
    disconnect: mockDisconnect,
  }),
}))

vi.mock('../LanguageSelector', () => ({
  default: () => <div data-testid="lang-selector">LanguageSelector</div>,
}))

vi.mock('../ThemeSelector', () => ({
  default: () => <div data-testid="theme-selector">ThemeSelector</div>,
}))

vi.mock('../WalletConnectModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div data-testid="wallet-modal">Wallet Modal</div> : null,
}))

describe('Hero Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Hero content correctly', () => {
    render(<Hero />)
    expect(screen.getByText('app_name')).toBeInTheDocument()
    expect(screen.getByText('tagline')).toBeInTheDocument()
    
    // Check search input presence using its ARIA role/label
    const searchInput = screen.getByLabelText('Carbon simulation query')
    expect(searchInput).toBeInTheDocument()
  })

  it('navigates to dashboard and calls runSimulation on form submission', () => {
    render(<Hero />)
    const input = screen.getByLabelText('Carbon simulation query')
    const submitBtn = screen.getByLabelText('Run simulation')

    fireEvent.change(input, { target: { value: 'What if I eat vegan?' } })
    fireEvent.click(submitBtn)

    expect(mockSetTab).toHaveBeenCalledWith('dashboard')
    expect(mockRunSimulation).toHaveBeenCalledWith('What if I eat vegan?')
  })

  it('opens wallet connect modal when connect wallet is clicked', () => {
    render(<Hero />)
    const walletBtn = screen.getByRole('button', { name: /connect_wallet/i })
    
    fireEvent.click(walletBtn)
    expect(screen.getByTestId('wallet-modal')).toBeInTheDocument()
  })
})
