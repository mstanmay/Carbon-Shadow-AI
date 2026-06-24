import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AIAssistant from '../AIAssistant'

// Mock functions with 'mock' prefix
const mockRunSimulation = vi.fn()
const mockMakeDecision = vi.fn()

// Mock store selectors
let mockChatHistory = [
  { sender: 'system', text: 'Terminal Online', timestamp: '12:00:00' },
  { sender: 'user', text: 'I want to travel', timestamp: '12:00:05' },
]
let mockActiveSimulation: any = null
let mockIsLoading = false

vi.mock('../../stores/carbonStore', () => ({
  useCarbonStore: vi.fn((selector) => {
    const state = {
      chatHistory: mockChatHistory,
      activeSimulation: mockActiveSimulation,
      runSimulation: mockRunSimulation,
      makeDecision: mockMakeDecision,
      isLoading: mockIsLoading,
    }
    return selector(state)
  })
}))

vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}))

describe('AIAssistant Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChatHistory = [
      { sender: 'system', text: 'Terminal Online', timestamp: '12:00:00' },
      { sender: 'user', text: 'I want to travel', timestamp: '12:00:05' },
    ]
    mockActiveSimulation = null
    mockIsLoading = false
    
    // Mock scrollIntoView as it's called on mount/update
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  it('renders chat history and input controls', () => {
    render(<AIAssistant />)
    expect(screen.getByText('AI Processing Terminal')).toBeInTheDocument()
    expect(screen.getByText('Terminal Online')).toBeInTheDocument()
    expect(screen.getByText('I want to travel')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/E.g., What if I/i)).toBeInTheDocument()
  })

  it('submits search query and triggers runSimulation', () => {
    render(<AIAssistant />)
    const input = screen.getByPlaceholderText(/E.g., What if I/i)
    const form = screen.getByRole('textbox').closest('form')!

    fireEvent.change(input, { target: { value: 'solar energy' } })
    fireEvent.submit(form)

    expect(mockRunSimulation).toHaveBeenCalledWith('solar energy')
  })

  it('displays loading indicator during query processing', () => {
    mockIsLoading = true
    render(<AIAssistant />)
    expect(screen.getByText('Agents Processing')).toBeInTheDocument()
    expect(screen.getByText('Graph executing nodes...')).toBeInTheDocument()
  })

  it('renders alternative decisions when simulation completes and allows user to select them', () => {
    mockActiveSimulation = {
      id: 42,
      query: 'I want to travel',
      category: 'Travel',
      baseline_co2: 120.0,
      recommendations: [
        {
          option_name: 'Eco Option',
          co2_value: 12.0,
          reasoning: 'Take train instead',
          savings_potential: 108.0,
        },
        {
          option_name: 'Balanced Option',
          co2_value: 45.0,
          reasoning: 'Carpool',
          savings_potential: 75.0,
        }
      ]
    }

    render(<AIAssistant />)

    // Check intent rendering
    expect(screen.getByText('Intent Analysis')).toBeInTheDocument()
    expect(screen.getByText('Travel')).toBeInTheDocument()

    // Check baseline emissions
    expect(screen.getByText(/120.0 kg CO2/i)).toBeInTheDocument()

    // Check recommendations
    expect(screen.getByText('Take train instead')).toBeInTheDocument()
    expect(screen.getByText('Carpool')).toBeInTheDocument()

    // Click select on Eco Option
    const selectButtons = screen.getAllByRole('button', { name: /select/i })
    fireEvent.click(selectButtons[0])

    expect(mockMakeDecision).toHaveBeenCalledWith('Eco Option', 108.0)
  })
})
