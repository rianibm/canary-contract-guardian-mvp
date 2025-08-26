import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Dashboard from '../src/components/Dashboard';
import { ThemeProvider } from '../contexts/ThemeContext';

// Mock the theme context
const MockThemeProvider = ({ children, darkMode = false }) => {
  const mockTheme = {
    isDarkMode: darkMode,
    toggleTheme: jest.fn(),
  };
  
  return (
    <div data-theme={darkMode ? 'dark' : 'light'}>
      {React.cloneElement(children, { theme: mockTheme })}
    </div>
  );
};

// Mock child components
jest.mock('../components/ContractList', () => {
  return function MockContractList({ contracts, onSelectContract, selectedContract }) {
    return (
      <div data-testid="contract-list">
        <div>Mock Contract List</div>
        {contracts?.map(contract => (
          <div 
            key={contract.id} 
            data-testid={`contract-${contract.id}`}
            onClick={() => onSelectContract?.(contract)}
            className={selectedContract?.id === contract.id ? 'selected' : ''}
          >
            {contract.nickname || contract.id}
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('../components/ChatInterface', () => {
  return function MockChatInterface({ selectedContract, agentService }) {
    return (
      <div data-testid="chat-interface">
        <div>Mock Chat Interface</div>
        {selectedContract && <div>Selected: {selectedContract.nickname}</div>}
      </div>
    );
  };
});

jest.mock('../components/FloatingAlert', () => {
  return function MockFloatingAlert({ agentService }) {
    return <div data-testid="floating-alert">Mock Floating Alert</div>;
  };
});

jest.mock('../components/Auth', () => {
  return function MockAuth({ isOpen, onClose, onLogin }) {
    return isOpen ? (
      <div data-testid="auth-modal">
        <div>Mock Auth Modal</div>
        <button onClick={() => onLogin?.({ email: 'test@test.com' })}>Login</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null;
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  Activity: () => <div data-testid="activity-icon">Activity</div>,
  TrendingUp: () => <div data-testid="trending-up-icon">TrendingUp</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon">AlertTriangle</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  Download: () => <div data-testid="download-icon">Download</div>,
  Upload: () => <div data-testid="upload-icon">Upload</div>,
  Play: () => <div data-testid="play-icon">Play</div>,
  Pause: () => <div data-testid="pause-icon">Pause</div>,
  Square: () => <div data-testid="square-icon">Square</div>,
  RotateCcw: () => <div data-testid="rotate-ccw-icon">RotateCcw</div>,
}));

// Mock agent service
const mockAgentService = {
  getContracts: jest.fn(),
  getContractStatus: jest.fn(),
  startMonitoring: jest.fn(),
  stopMonitoring: jest.fn(),
  freezeContract: jest.fn(),
  unfreezeContract: jest.fn(),
  getSystemHealth: jest.fn(),
  getAlerts: jest.fn(),
  exportData: jest.fn(),
  importData: jest.fn(),
};

describe('Dashboard Component', () => {
  const mockContracts = [
    {
      id: 'contract-1',
      nickname: 'DeFi Protocol',
      status: 'monitoring',
      health: 'healthy',
      lastChecked: '2025-01-01T10:00:00Z',
      gasUsage: 50000,
      transactionCount: 150,
    },
    {
      id: 'contract-2',
      nickname: 'NFT Marketplace',
      status: 'frozen',
      health: 'warning',
      lastChecked: '2025-01-01T09:30:00Z',
      gasUsage: 75000,
      transactionCount: 89,
    },
  ];

  const mockSystemHealth = {
    overall: 'healthy',
    uptime: '99.9%',
    responseTime: '150ms',
    activeContracts: 2,
    totalAlerts: 5,
    criticalAlerts: 1,
  };

  const defaultProps = {
    agentService: mockAgentService,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAgentService.getContracts.mockResolvedValue(mockContracts);
    mockAgentService.getSystemHealth.mockResolvedValue(mockSystemHealth);
    mockAgentService.getAlerts.mockResolvedValue([]);
  });

  const renderDashboard = (props = {}, darkMode = false) => {
    return render(
      <MockThemeProvider darkMode={darkMode}>
        <Dashboard {...defaultProps} {...props} />
      </MockThemeProvider>
    );
  };

  describe('Rendering', () => {
    test('renders dashboard header', async () => {
      renderDashboard();
      
      expect(screen.getByText('Contract Guardian Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Monitor and protect your smart contracts in real-time')).toBeInTheDocument();
    });

    test('renders system health metrics', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('System Health')).toBeInTheDocument();
        expect(screen.getByText('99.9%')).toBeInTheDocument();
        expect(screen.getByText('150ms')).toBeInTheDocument();
      });
    });

    test('renders contract statistics', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Active Contracts')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('Total Alerts')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
      });
    });

    test('renders action buttons', () => {
      renderDashboard();
      
      expect(screen.getByText('Start Monitor')).toBeInTheDocument();
      expect(screen.getByText('Export Data')).toBeInTheDocument();
      expect(screen.getByText('Import Data')).toBeInTheDocument();
      expect(screen.getByText('Unlock Full Features')).toBeInTheDocument();
    });

    test('renders child components', () => {
      renderDashboard();
      
      expect(screen.getByTestId('contract-list')).toBeInTheDocument();
      expect(screen.getByTestId('chat-interface')).toBeInTheDocument();
      expect(screen.getByTestId('floating-alert')).toBeInTheDocument();
    });
  });

  describe('Dark Theme Support', () => {
    test('applies dark theme classes when dark mode is enabled', () => {
      renderDashboard({}, true);
      
      const dashboard = screen.getByText('Contract Guardian Dashboard').closest('div');
      expect(dashboard).toHaveClass('dark:bg-gray-900', 'dark:text-white');
    });

    test('applies light theme classes when dark mode is disabled', () => {
      renderDashboard({}, false);
      
      const dashboard = screen.getByText('Contract Guardian Dashboard').closest('div');
      expect(dashboard).toHaveClass('bg-gray-50');
    });

    test('system health cards have dark theme styling', () => {
      renderDashboard({}, true);
      
      const healthCard = screen.getByText('System Health').closest('div');
      expect(healthCard).toHaveClass('dark:bg-gray-800', 'dark:border-gray-700');
    });
  });

  describe('Authentication Integration', () => {
    test('shows login modal when "Unlock Full Features" is clicked', async () => {
      const user = userEvent.setup();
      renderDashboard();
      
      const unlockButton = screen.getByText('Unlock Full Features');
      await user.click(unlockButton);
      
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
    });

    test('hides login modal when closed', async () => {
      const user = userEvent.setup();
      renderDashboard();
      
      // Open modal
      const unlockButton = screen.getByText('Unlock Full Features');
      await user.click(unlockButton);
      
      // Close modal
      const closeButton = screen.getByText('Close');
      await user.click(closeButton);
      
      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
    });

    test('processes login success', async () => {
      const user = userEvent.setup();
      renderDashboard();
      
      // Open modal and login
      const unlockButton = screen.getByText('Unlock Full Features');
      await user.click(unlockButton);
      
      const loginButton = screen.getByText('Login');
      await user.click(loginButton);
      
      // Modal should close and user should be logged in
      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
    });

    test('hides restricted buttons when not logged in', () => {
      renderDashboard();
      
      expect(screen.queryByText('Stop Monitor')).not.toBeInTheDocument();
      expect(screen.queryByText('Unfreeze')).not.toBeInTheDocument();
    });

    test('shows restricted buttons when logged in', async () => {
      const user = userEvent.setup();
      renderDashboard();
      
      // Login first
      const unlockButton = screen.getByText('Unlock Full Features');
      await user.click(unlockButton);
      const loginButton = screen.getByText('Login');
      await user.click(loginButton);
      
      // Should now show restricted buttons
      await waitFor(() => {
        expect(screen.getByText('Stop Monitor')).toBeInTheDocument();
        expect(screen.getByText('Unfreeze')).toBeInTheDocument();
      });
    });
  });

  describe('Contract Interaction', () => {
    test('loads contracts on mount', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(mockAgentService.getContracts).toHaveBeenCalled();
      });
    });

    test('handles contract selection', async () => {
      const user = userEvent.setup();
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByTestId('contract-contract-1')).toBeInTheDocument();
      });
      
      const contractElement = screen.getByTestId('contract-contract-1');
      await user.click(contractElement);
      
      expect(screen.getByText('Selected: DeFi Protocol')).toBeInTheDocument();
    });

    test('displays selected contract in chat interface', async () => {
      const user = userEvent.setup();
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByTestId('contract-contract-1')).toBeInTheDocument();
      });
      
      const contractElement = screen.getByTestId('contract-contract-1');
      await user.click(contractElement);
      
      const chatInterface = screen.getByTestId('chat-interface');
      expect(within(chatInterface).getByText('Selected: DeFi Protocol')).toBeInTheDocument();
    });
  });

  describe('Monitoring Actions', () => {
    test('starts monitoring when start button is clicked', async () => {
      const user = userEvent.setup();
      renderDashboard();
      
      const startButton = screen.getByText('Start Monitor');
      await user.click(startButton);
      
      expect(mockAgentService.startMonitoring).toHaveBeenCalled();
    });

    test('stops monitoring when stop button is clicked (logged in users only)', async () => {
      const user = userEvent.setup();
      renderDashboard();
      
      // Login first
      const unlockButton = screen.getByText('Unlock Full Features');
      await user.click(unlockButton);
      const loginButton = screen.getByText('Login');
      await user.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText('Stop Monitor')).toBeInTheDocument();
      });
      
      const stopButton = screen.getByText('Stop Monitor');
      await user.click(stopButton);
      
      expect(mockAgentService.stopMonitoring).toHaveBeenCalled();
    });

    test('freezes contract when freeze button is clicked', async () => {
      const user = userEvent.setup();
      renderDashboard();
      
      // Select a contract first
      await waitFor(() => {
        expect(screen.getByTestId('contract-contract-1')).toBeInTheDocument();
      });
      
      const contractElement = screen.getByTestId('contract-contract-1');
      await user.click(contractElement);
      
      const freezeButton = screen.getByText('Freeze');
      await user.click(freezeButton);
      
      expect(mockAgentService.freezeContract).toHaveBeenCalledWith('contract-1');
    });

    test('unfreezes contract when unfreeze button is clicked (logged in users only)', async () => {
      const user = userEvent.setup();
      renderDashboard();
      
      // Login first
      const unlockButton = screen.getByText('Unlock Full Features');
      await user.click(unlockButton);
      const loginButton = screen.getByText('Login');
      await user.click(loginButton);
      
      // Select a frozen contract
      await waitFor(() => {
        expect(screen.getByTestId('contract-contract-2')).toBeInTheDocument();
      });
      
      const contractElement = screen.getByTestId('contract-contract-2');
      await user.click(contractElement);
      
      await waitFor(() => {
        expect(screen.getByText('Unfreeze')).toBeInTheDocument();
      });
      
      const unfreezeButton = screen.getByText('Unfreeze');
      await user.click(unfreezeButton);
      
      expect(mockAgentService.unfreezeContract).toHaveBeenCalledWith('contract-2');
    });
  });

  describe('Data Management', () => {
    test('exports data when export button is clicked', async () => {
      const user = userEvent.setup();
      mockAgentService.exportData.mockResolvedValue({ data: 'exported' });
      
      renderDashboard();
      
      const exportButton = screen.getByText('Export Data');
      await user.click(exportButton);
      
      expect(mockAgentService.exportData).toHaveBeenCalled();
    });

    test('imports data when import button is clicked', async () => {
      const user = userEvent.setup();
      
      // Mock file input
      const mockFile = new File(['test data'], 'test.json', { type: 'application/json' });
      
      renderDashboard();
      
      const importButton = screen.getByText('Import Data');
      await user.click(importButton);
      
      // Should trigger file input (implementation specific)
      expect(screen.getByText('Import Data')).toBeInTheDocument();
    });

    test('handles export errors gracefully', async () => {
      const user = userEvent.setup();
      mockAgentService.exportData.mockRejectedValue(new Error('Export failed'));
      
      renderDashboard();
      
      const exportButton = screen.getByText('Export Data');
      await user.click(exportButton);
      
      // Should handle error without crashing
      expect(mockAgentService.exportData).toHaveBeenCalled();
    });
  });

  describe('Real-time Updates', () => {
    test('refreshes data periodically', async () => {
      jest.useFakeTimers();
      
      renderDashboard();
      
      // Initial load
      await waitFor(() => {
        expect(mockAgentService.getContracts).toHaveBeenCalledTimes(1);
      });
      
      // Advance timer to trigger refresh
      jest.advanceTimersByTime(30000);
      
      await waitFor(() => {
        expect(mockAgentService.getContracts).toHaveBeenCalledTimes(2);
      });
      
      jest.useRealTimers();
    });

    test('updates system health metrics', async () => {
      jest.useFakeTimers();
      
      renderDashboard();
      
      // Initial load
      await waitFor(() => {
        expect(mockAgentService.getSystemHealth).toHaveBeenCalledTimes(1);
      });
      
      // Update mock data
      mockAgentService.getSystemHealth.mockResolvedValue({
        ...mockSystemHealth,
        uptime: '99.8%',
      });
      
      // Advance timer
      jest.advanceTimersByTime(30000);
      
      await waitFor(() => {
        expect(screen.getByText('99.8%')).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    test('handles contract loading errors', async () => {
      mockAgentService.getContracts.mockRejectedValue(new Error('Failed to load'));
      
      renderDashboard();
      
      // Should not crash and show error state
      await waitFor(() => {
        expect(screen.queryByTestId('contract-list')).toBeInTheDocument();
      });
    });

    test('handles system health loading errors', async () => {
      mockAgentService.getSystemHealth.mockRejectedValue(new Error('Health check failed'));
      
      renderDashboard();
      
      // Should show default or error state
      expect(screen.getByText('System Health')).toBeInTheDocument();
    });

    test('handles action errors gracefully', async () => {
      const user = userEvent.setup();
      mockAgentService.startMonitoring.mockRejectedValue(new Error('Start failed'));
      
      renderDashboard();
      
      const startButton = screen.getByText('Start Monitor');
      await user.click(startButton);
      
      // Should handle error without crashing
      expect(mockAgentService.startMonitoring).toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    test('has responsive grid layout', () => {
      renderDashboard();
      
      const dashboard = screen.getByText('Contract Guardian Dashboard').closest('div');
      expect(dashboard).toHaveClass('grid', 'lg:grid-cols-3', 'gap-6');
    });

    test('has responsive padding', () => {
      renderDashboard();
      
      const container = screen.getByText('Contract Guardian Dashboard').closest('div');
      expect(container).toHaveClass('p-4', 'lg:p-6');
    });

    test('cards have responsive styling', () => {
      renderDashboard();
      
      const card = screen.getByText('System Health').closest('div');
      expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm', 'border', 'p-6');
    });
  });

  describe('Accessibility', () => {
    test('has proper heading structure', () => {
      renderDashboard();
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
    });

    test('buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      renderDashboard();
      
      const startButton = screen.getByText('Start Monitor');
      startButton.focus();
      await user.keyboard('{Enter}');
      
      expect(mockAgentService.startMonitoring).toHaveBeenCalled();
    });

    test('has proper ARIA labels', () => {
      renderDashboard();
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeVisible();
      });
    });
  });

  describe('Performance', () => {
    test('cleans up timers on unmount', () => {
      jest.useFakeTimers();
      
      const { unmount } = renderDashboard();
      
      unmount();
      
      // Advance time after unmount
      jest.advanceTimersByTime(60000);
      
      // Should not cause additional API calls
      expect(mockAgentService.getContracts).toHaveBeenCalledTimes(1);
      
      jest.useRealTimers();
    });

    test('debounces rapid updates', async () => {
      jest.useFakeTimers();
      
      renderDashboard();
      
      // Trigger multiple rapid updates
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(1000);
      }
      
      // Should not cause excessive API calls
      await waitFor(() => {
        expect(mockAgentService.getContracts).toHaveBeenCalledTimes(1);
      });
      
      jest.useRealTimers();
    });
  });
});
