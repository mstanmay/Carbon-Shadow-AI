import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCarbonStore } from '../carbonStore'

describe('carbonStore', () => {
  beforeEach(() => {
    // Clear localStorage and reset store state
    localStorage.clear()
    const store = useCarbonStore.getState()
    store.logout()
    store.clearError()
    vi.restoreAllMocks()
  })

  it('should initialize with default states', () => {
    const state = useCarbonStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.currentTab).toBe('landing')
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.simulations).toEqual([])
    expect(state.activeSimulation).toBeNull()
  })

  it('should change tabs correctly via setTab', () => {
    const store = useCarbonStore.getState()
    store.setTab('dashboard')
    expect(useCarbonStore.getState().currentTab).toBe('dashboard')

    store.setTab('settings')
    expect(useCarbonStore.getState().currentTab).toBe('settings')
  })

  it('should handle setError and clearError', () => {
    const store = useCarbonStore.getState()
    store.setError('Failed to fetch data')
    expect(useCarbonStore.getState().error).toBe('Failed to fetch data')

    store.clearError()
    expect(useCarbonStore.getState().error).toBeNull()
  })

  it('should handle login successfully with mock fallback on error', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))
    const store = useCarbonStore.getState()

    const success = await store.login('test@example.com', 'password123')
    expect(success).toBe(true)
    expect(useCarbonStore.getState().token).toBe('mock-jwt-token')
    expect(useCarbonStore.getState().user?.email).toBe('test@example.com')
    expect(useCarbonStore.getState().currentTab).toBe('dashboard')
    fetchSpy.mockRestore()
  })

  it('should handle login successfully with server response', async () => {
    const mockToken = 'real-jwt-token-xyz'
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: mockToken }),
    } as Response)

    // Spy on fetch for stats and alerts which are called inside login
    const statsSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Ignore stats call'))

    const store = useCarbonStore.getState()
    const success = await store.login('admin@carbon.ai', 'securepass')

    expect(success).toBe(true)
    expect(localStorage.getItem('access_token')).toBe(mockToken)
    expect(useCarbonStore.getState().token).toBe(mockToken)
    expect(useCarbonStore.getState().user?.email).toBe('admin@carbon.ai')

    fetchSpy.mockRestore()
    statsSpy.mockRestore()
  })

  it('should handle registration and handle mock fallbacks', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))
    const store = useCarbonStore.getState()

    const success = await store.register('test_reg@example.com', 'password123')
    expect(success).toBe(true)
    fetchSpy.mockRestore()
  })

  it('should handle registration successfully from server', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'User registered successfully' }),
    } as Response)

    const store = useCarbonStore.getState()
    const success = await store.register('test_reg@example.com', 'password123')
    expect(success).toBe(true)
    fetchSpy.mockRestore()
  })

  it('should run simulation and handle mock fallback when offline', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Offline'))
    const store = useCarbonStore.getState()

    // Run simulation
    const promise = store.runSimulation('I want to travel from Mysore to Bangalore')
    
    // We have setTimeout delays in runSimulation mock fallback, let's wait or fast forward
    await promise

    const activeSim = useCarbonStore.getState().activeSimulation
    expect(activeSim).not.toBeNull()
    expect(activeSim?.category).toBe('Travel')
    expect(activeSim?.baseline_co2).toBe(45.0)
    expect(activeSim?.recommendations.length).toBe(3)
    expect(useCarbonStore.getState().chatHistory.length).toBeGreaterThan(1)
    
    fetchSpy.mockRestore()
  })

  it('should run time machine and set timeline data', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Offline'))
    const store = useCarbonStore.getState()

    await store.runTimeMachine('solar panels')

    const timeMachine = useCarbonStore.getState().timeMachineData
    expect(timeMachine).not.toBeNull()
    expect(timeMachine?.overall_savings).toBe(1500.0)
    expect(timeMachine?.timeline.length).toBe(4)
    expect(timeMachine?.timeline[0].label).toBe('Month 1: Install')

    fetchSpy.mockRestore()
  })

  it('should fetch copilot alerts', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Offline'))
    const store = useCarbonStore.getState()

    await store.fetchCopilotAlerts()

    const alerts = useCarbonStore.getState().copilotAlerts
    expect(alerts.length).toBe(3)
    expect(alerts[0].id).toBe('copilot_travel')

    fetchSpy.mockRestore()
  })
})
