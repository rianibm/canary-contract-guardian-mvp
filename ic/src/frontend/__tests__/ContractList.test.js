import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ContractList from '../src/components/ContractList';

// Mock the ThemeContext
const mockThemeContext = {
  isDarkMode: false,
  toggleTheme: jest.fn(),
};

jest.mock('../src/contexts/ThemeContext', () => ({
  useTheme: () => mockThemeContext,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon">AlertTriangle</div>,
  Pause: () => <div data-testid="pause-icon">Pause</div>,
  Snowflake: () => <div data-testid="snowflake-icon">Snowflake</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  X: () => <div data-testid="x-icon">X</div>,
}));

describe('ContractList Component', () => {
  const mockContracts = [
    {
      id: 'contract-1',
      nickname: 'Test Contract 1',
      isActive: true,
      isPaused: false,
      status: 'healthy',
      addedAt: '2025-01-01',
      lastCheck: '2 minutes ago',
    },
    {
      id: 'contract-2',
      nickname: 'Test Contract 2',
      isActive: false,
      isPaused: false,
      status: 'inactive',
      addedAt: '2025-01-02',
      lastCheck: 'Never',
    },
    {
      id: 'contract-3',
      nickname: 'Paused Contract',
      isActive: true,
      isPaused: true,
      status: 'healthy',
      addedAt: '2025-01-03',
      lastCheck: '5 minutes ago',
    },
  ];

  const defaultProps = {
    contracts: mockContracts,
    onPauseContract: jest.fn(),
    onResumeContract: jest.fn(),
    onRemoveContract: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders contract list header', () => {
      render(<ContractList {...defaultProps} />);
      
      expect(screen.getByText('Smart Contract Monitoring')).toBeInTheDocument();
      expect(screen.getByText(`Total: ${mockContracts.length}`)).toBeInTheDocument();
    });

    test('renders search input', () => {
      render(<ContractList {...defaultProps} />);
      
      expect(screen.getByPlaceholderText(/Search contracts/)).toBeInTheDocument();
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    test('renders tab navigation', () => {
      render(<ContractList {...defaultProps} />);
      
      expect(screen.getByText(/Monitored/)).toBeInTheDocument();
      expect(screen.getByText(/Not Monitored/)).toBeInTheDocument();
    });

    test('shows correct contract count in tabs', () => {
      render(<ContractList {...defaultProps} />);
      
      // 2 active contracts (1 healthy, 1 paused but active)
      expect(screen.getByText(/Monitored \(2\)/)).toBeInTheDocument();
      // 1 inactive contract
      expect(screen.getByText(/Not Monitored \(1\)/)).toBeInTheDocument();
    });

    test('renders contracts in monitored tab by default', () => {
      render(<ContractList {...defaultProps} />);
      
      expect(screen.getByText('Test Contract 1')).toBeInTheDocument();
      expect(screen.getByText('Paused Contract')).toBeInTheDocument();
      expect(screen.queryByText('Test Contract 2')).not.toBeInTheDocument();
    });
  });

  describe('Contract Display', () => {
    test('displays contract information correctly', () => {
      render(<ContractList {...defaultProps} />);
      
      expect(screen.getByText('Test Contract 1')).toBeInTheDocument();
      expect(screen.getByText('contract-1')).toBeInTheDocument();
      expect(screen.getByText('Added 2025-01-01 • Last check: 2 minutes ago')).toBeInTheDocument();
    });

    test('shows correct status indicators', () => {
      render(<ContractList {...defaultProps} />);
      
      // Healthy contract
      expect(screen.getByText('Healthy')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });

    test('shows paused status for paused contracts', () => {
      render(<ContractList {...defaultProps} />);
      
      expect(screen.getByText('Frozen')).toBeInTheDocument();
      expect(screen.getByTestId('snowflake-icon')).toBeInTheDocument();
    });

    test('displays fallback name for contracts without nickname', () => {
      const contractsWithoutNickname = [
        {
          id: 'very-long-contract-id-12345',
          isActive: true,
          isPaused: false,
          status: 'healthy',
          addedAt: '2025-01-01',
          lastCheck: '2 minutes ago',
        }
      ];

      render(<ContractList {...defaultProps} contracts={contractsWithoutNickname} />);
      
      expect(screen.getByText('Contract very-lon...')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    test('switches to not monitored tab', async () => {
      const user = userEvent.setup();
      render(<ContractList {...defaultProps} />);
      
      const notMonitoredTab = screen.getByText(/Not Monitored/);
      await user.click(notMonitoredTab);
      
      expect(screen.getByText('Test Contract 2')).toBeInTheDocument();
      expect(screen.queryByText('Test Contract 1')).not.toBeInTheDocument();
    });

    test('applies active styling to selected tab', async () => {
      const user = userEvent.setup();
      render(<ContractList {...defaultProps} />);
      
      const monitoredTab = screen.getByText(/Monitored/).closest('button');
      expect(monitoredTab).toHaveClass('border-orange-500', 'text-orange-600');
      
      const notMonitoredTab = screen.getByText(/Not Monitored/).closest('button');
      await user.click(notMonitoredTab);
      
      expect(notMonitoredTab).toHaveClass('border-gray-500', 'text-gray-600');
    });
  });

  describe('Search Functionality', () => {
    test('filters contracts by nickname', async () => {
      const user = userEvent.setup();
      render(<ContractList {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/Search contracts/);
      await user.type(searchInput, 'Paused');
      
      expect(screen.getByText('Paused Contract')).toBeInTheDocument();
      expect(screen.queryByText('Test Contract 1')).not.toBeInTheDocument();
    });

    test('filters contracts by contract ID', async () => {
      const user = userEvent.setup();
      render(<ContractList {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/Search contracts/);
      await user.type(searchInput, 'contract-1');
      
      expect(screen.getByText('Test Contract 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Contract 2')).not.toBeInTheDocument();
    });

    test('shows search results count', async () => {
      const user = userEvent.setup();
      render(<ContractList {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/Search contracts/);
      await user.type(searchInput, 'Test');
      
      expect(screen.getByText(/Showing 1 contract matching "Test"/)).toBeInTheDocument();
    });

    test('shows clear search button when searching', async () => {
      const user = userEvent.setup();
      render(<ContractList {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/Search contracts/);
      await user.type(searchInput, 'test');
      
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    test('clears search when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<ContractList {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/Search contracts/);
      await user.type(searchInput, 'test');
      
      const clearButton = screen.getByTestId('x-icon').closest('button');
      await user.click(clearButton);
      
      expect(searchInput).toHaveValue('');
    });

    test('case-insensitive search', async () => {
      const user = userEvent.setup();
      render(<ContractList {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/Search contracts/);
      await user.type(searchInput, 'TEST');
      
      expect(screen.getByText('Test Contract 1')).toBeInTheDocument();
    });
  });

  describe('Contract Actions', () => {
    test('shows resume button for inactive contracts', async () => {
      const user = userEvent.setup();
      render(<ContractList {...defaultProps} />);
      
      // Switch to not monitored tab
      const notMonitoredTab = screen.getByText(/Not Monitored/);
      await user.click(notMonitoredTab);
      
      expect(screen.getByText('▶️ Resume')).toBeInTheDocument();
    });

    test('shows unfreeze button for paused contracts', () => {
      render(<ContractList {...defaultProps} />);
      
      expect(screen.getByText('❄️ Unfreeze')).toBeInTheDocument();
    });

    test('calls onResumeContract when resume button is clicked', async () => {
      const user = userEvent.setup();
      render(<ContractList {...defaultProps} />);
      
      // Switch to not monitored tab
      const notMonitoredTab = screen.getByText(/Not Monitored/);
      await user.click(notMonitoredTab);
      
      const resumeButton = screen.getByText('▶️ Resume');
      await user.click(resumeButton);
      
      expect(defaultProps.onResumeContract).toHaveBeenCalledWith('contract-2');
    });

    test('calls onPauseContract when unfreeze button is clicked', async () => {
      const user = userEvent.setup();
      render(<ContractList {...defaultProps} />);
      
      const unfreezeButton = screen.getByText('❄️ Unfreeze');
      await user.click(unfreezeButton);
      
      expect(defaultProps.onPauseContract).toHaveBeenCalledWith('contract-3');
    });
  });

  describe('Empty States', () => {
    test('shows empty state for monitored contracts', () => {
      render(<ContractList {...defaultProps} contracts={[]} />);
      
      expect(screen.getByText('No contracts currently being monitored')).toBeInTheDocument();
      expect(screen.getByText('Add a contract address above to start monitoring')).toBeInTheDocument();
    });

    test('shows empty state for not monitored contracts', async () => {
      const user = userEvent.setup();
      const onlyActiveContracts = mockContracts.filter(c => c.isActive);
      render(<ContractList {...defaultProps} contracts={onlyActiveContracts} />);
      
      // Switch to not monitored tab
      const notMonitoredTab = screen.getByText(/Not Monitored/);
      await user.click(notMonitoredTab);
      
      expect(screen.getByText('No frozen contracts')).toBeInTheDocument();
      expect(screen.getByText('Frozen contracts will appear here')).toBeInTheDocument();
    });

    test('shows loading state', () => {
      render(<ContractList {...defaultProps} loading={true} />);
      
      expect(screen.getByText('Loading contracts...')).toBeInTheDocument();
    });
  });

  describe('Status Indicators', () => {
    test('shows correct status colors', () => {
      render(<ContractList {...defaultProps} />);
      
      // Find status indicators by their container elements
      const healthyStatus = screen.getByText('Healthy').closest('span');
      const frozenStatus = screen.getByText('Frozen').closest('span');
      
      expect(healthyStatus).toHaveClass('bg-green-100', 'text-green-700');
      expect(frozenStatus).toHaveClass('bg-orange-100', 'text-orange-700');
    });

    test('shows correct status dots', () => {
      render(<ContractList {...defaultProps} />);
      
      // Check for status indicator dots
      const statusDots = document.querySelectorAll('.w-3.h-3.rounded-full');
      expect(statusDots.length).toBeGreaterThan(0);
    });
  });

  describe('Dark Theme Integration', () => {
    test('applies dark theme classes when dark mode is enabled', () => {
      mockThemeContext.isDarkMode = true;
      render(<ContractList {...defaultProps} />);
      
      const container = screen.getByText('Smart Contract Monitoring').closest('div');
      expect(container).toHaveClass('dark:bg-gray-800', 'dark:text-white');
    });

    test('uses light theme classes by default', () => {
      mockThemeContext.isDarkMode = false;
      render(<ContractList {...defaultProps} />);
      
      const container = screen.getByText('Smart Contract Monitoring').closest('div');
      expect(container).toHaveClass('bg-white', 'text-gray-900');
    });
  });

  describe('Responsive Design', () => {
    test('has responsive grid layout', () => {
      render(<ContractList {...defaultProps} />);
      
      const contractGrid = screen.getByText('Test Contract 1').closest('.grid');
      expect(contractGrid).toHaveClass('grid-cols-2', 'gap-3');
    });

    test('has responsive tab layout', () => {
      render(<ContractList {...defaultProps} />);
      
      const tabContainer = screen.getByText(/Monitored/).closest('.flex');
      expect(tabContainer).toHaveClass('border-b');
    });
  });

  describe('Accessibility', () => {
    test('has proper heading structure', () => {
      render(<ContractList {...defaultProps} />);
      
      const heading = screen.getByText('Smart Contract Monitoring');
      expect(heading).toBeInTheDocument();
    });

    test('search input has proper attributes', () => {
      render(<ContractList {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/Search contracts/);
      expect(searchInput).toHaveAttribute('type', 'text');
      expect(searchInput).toHaveAttribute('autoComplete', 'off');
      expect(searchInput).toHaveAttribute('spellCheck', 'false');
    });

    test('buttons have proper roles and are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<ContractList {...defaultProps} />);
      
      const unfreezeButton = screen.getByText('❄️ Unfreeze');
      expect(unfreezeButton).toHaveRole('button');
      
      unfreezeButton.focus();
      await user.keyboard('{Enter}');
      
      expect(defaultProps.onPauseContract).toHaveBeenCalled();
    });

    test('tabs are keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<ContractList {...defaultProps} />);
      
      const notMonitoredTab = screen.getByText(/Not Monitored/);
      
      notMonitoredTab.focus();
      await user.keyboard('{Enter}');
      
      expect(screen.getByText('Test Contract 2')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles contracts with missing data gracefully', () => {
      const incompleteContracts = [
        {
          id: 'incomplete-contract',
          // Missing other properties
        }
      ];

      expect(() => {
        render(<ContractList {...defaultProps} contracts={incompleteContracts} />);
      }).not.toThrow();
    });

    test('handles very long contract IDs', () => {
      const longIdContracts = [
        {
          id: 'very-very-very-long-contract-id-that-should-be-truncated-properly',
          nickname: 'Long ID Contract',
          isActive: true,
          status: 'healthy',
          addedAt: '2025-01-01',
          lastCheck: 'now',
        }
      ];

      render(<ContractList {...defaultProps} contracts={longIdContracts} />);
      
      expect(screen.getByText('Long ID Contract')).toBeInTheDocument();
    });

    test('handles special characters in search', async () => {
      const user = userEvent.setup();
      render(<ContractList {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/Search contracts/);
      await user.type(searchInput, '@#$%');
      
      // Should not crash and should show no results
      expect(screen.queryByText('Test Contract 1')).not.toBeInTheDocument();
    });
  });
});
