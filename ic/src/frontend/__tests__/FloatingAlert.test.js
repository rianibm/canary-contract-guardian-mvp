import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DynamicFloatingAlertSystem from '../src/components/FloatingAlert';

// Mock timers
jest.useFakeTimers();

// Mock agent service
const mockAgentService = {
  getRecentAlerts: jest.fn(),
};

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertTriangle: () => <div data-testid="alert-triangle-icon">AlertTriangle</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  Bell: () => <div data-testid="bell-icon">Bell</div>,
}));

describe('DynamicFloatingAlertSystem Component', () => {
  const mockAlerts = [
    {
      id: 'alert-1',
      title: 'High Gas Usage Detected',
      description: 'Contract gas usage exceeded threshold',
      severity: 'warning',
      timestamp: '2025-01-01T10:00:00Z',
      contract: 'contract-123',
      nickname: 'Test Contract',
      icon: '⚠️',
      category: 'gas',
    },
    {
      id: 'alert-2',
      title: 'Critical Security Issue',
      description: 'Suspicious transaction detected',
      severity: 'danger',
      timestamp: '2025-01-01T11:00:00Z',
      contract: 'contract-456',
      nickname: 'Security Contract',
      icon: '🚨',
      category: 'security',
    },
  ];

  const defaultProps = {
    agentService: mockAgentService,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAgentService.getRecentAlerts.mockResolvedValue(mockAlerts);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    test('renders without alerts initially', () => {
      mockAgentService.getRecentAlerts.mockResolvedValue([]);
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    test('renders alert when available', async () => {
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      // Fast-forward to trigger initial fetch
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByText('High Gas Usage Detected')).toBeInTheDocument();
      });
    });

    test('displays alert content correctly', async () => {
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByText('High Gas Usage Detected')).toBeInTheDocument();
        expect(screen.getByText('Contract gas usage exceeded threshold')).toBeInTheDocument();
        expect(screen.getByText('Test Contract')).toBeInTheDocument();
        expect(screen.getByText('⚠️')).toBeInTheDocument();
      });
    });

    test('shows close button', async () => {
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('x-icon')).toBeInTheDocument();
      });
    });

    test('shows view details button', async () => {
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByText('View Details')).toBeInTheDocument();
        expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
      });
    });
  });

  describe('Alert Cycling', () => {
    test('cycles through multiple alerts', async () => {
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      // First alert
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByText('High Gas Usage Detected')).toBeInTheDocument();
      });
      
      // Advance to next alert (assuming 5 second display time)
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Critical Security Issue')).toBeInTheDocument();
      });
    });

    test('cycles back to first alert after showing all', async () => {
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      // Show first alert
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByText('High Gas Usage Detected')).toBeInTheDocument();
      });
      
      // Advance through second alert
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Critical Security Issue')).toBeInTheDocument();
      });
      
      // Advance to cycle back to first
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(screen.getByText('High Gas Usage Detected')).toBeInTheDocument();
      });
    });

    test('does not cycle when only one alert', async () => {
      mockAgentService.getRecentAlerts.mockResolvedValue([mockAlerts[0]]);
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByText('High Gas Usage Detected')).toBeInTheDocument();
      });
      
      // Advance time but should stay on same alert
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      expect(screen.getByText('High Gas Usage Detected')).toBeInTheDocument();
    });
  });

  describe('Alert Severity Styling', () => {
    test('applies warning styling for warning alerts', async () => {
      mockAgentService.getRecentAlerts.mockResolvedValue([mockAlerts[0]]);
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        const alertElement = screen.getByText('High Gas Usage Detected').closest('div');
        expect(alertElement).toHaveClass('border-yellow-300', 'bg-yellow-50');
      });
    });

    test('applies danger styling for critical alerts', async () => {
      mockAgentService.getRecentAlerts.mockResolvedValue([mockAlerts[1]]);
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        const alertElement = screen.getByText('Critical Security Issue').closest('div');
        expect(alertElement).toHaveClass('border-red-300', 'bg-red-50');
      });
    });

    test('applies success styling for info alerts', async () => {
      const infoAlert = {
        ...mockAlerts[0],
        severity: 'success',
        title: 'Contract Healthy',
      };
      mockAgentService.getRecentAlerts.mockResolvedValue([infoAlert]);
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        const alertElement = screen.getByText('Contract Healthy').closest('div');
        expect(alertElement).toHaveClass('border-green-300', 'bg-green-50');
      });
    });
  });

  describe('User Interactions', () => {
    test('closes alert when close button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByText('High Gas Usage Detected')).toBeInTheDocument();
      });
      
      const closeButton = screen.getByTestId('x-icon').closest('button');
      await user.click(closeButton);
      
      expect(screen.queryByText('High Gas Usage Detected')).not.toBeInTheDocument();
    });

    test('opens alert details when view details is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByText('View Details')).toBeInTheDocument();
      });
      
      const viewButton = screen.getByText('View Details');
      await user.click(viewButton);
      
      // Should show alert modal (assuming it renders)
      await waitFor(() => {
        expect(screen.getByText('Alert Details')).toBeInTheDocument();
      });
    });

    test('pauses cycling when user hovers over alert', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByText('High Gas Usage Detected')).toBeInTheDocument();
      });
      
      const alertElement = screen.getByText('High Gas Usage Detected').closest('div');
      await user.hover(alertElement);
      
      // Advance time that would normally trigger next alert
      act(() => {
        jest.advanceTimersByTime(6000);
      });
      
      // Should still show first alert due to hover
      expect(screen.getByText('High Gas Usage Detected')).toBeInTheDocument();
    });

    test('resumes cycling when user stops hovering', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByText('High Gas Usage Detected')).toBeInTheDocument();
      });
      
      const alertElement = screen.getByText('High Gas Usage Detected').closest('div');
      
      // Hover and unhover
      await user.hover(alertElement);
      await user.unhover(alertElement);
      
      // Advance time to trigger next alert
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Critical Security Issue')).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    test('fetches alerts on mount', async () => {
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(mockAgentService.getRecentAlerts).toHaveBeenCalled();
      });
    });

    test('refreshes alerts periodically', async () => {
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      // Initial fetch
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(mockAgentService.getRecentAlerts).toHaveBeenCalledTimes(1);
      });
      
      // Advance time to trigger refresh (assuming 30 second interval)
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      await waitFor(() => {
        expect(mockAgentService.getRecentAlerts).toHaveBeenCalledTimes(2);
      });
    });

    test('handles fetch errors gracefully', async () => {
      mockAgentService.getRecentAlerts.mockRejectedValue(new Error('Fetch failed'));
      
      // Should not crash
      expect(() => {
        render(<DynamicFloatingAlertSystem {...defaultProps} />);
      }).not.toThrow();
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      // Should not show any alerts
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    test('updates alerts when new data is available', async () => {
      const { rerender } = render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByText('High Gas Usage Detected')).toBeInTheDocument();
      });
      
      // Update mock to return new alert
      const newAlert = {
        ...mockAlerts[0],
        id: 'alert-3',
        title: 'New Alert',
      };
      mockAgentService.getRecentAlerts.mockResolvedValue([newAlert]);
      
      // Trigger refresh
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      await waitFor(() => {
        expect(screen.getByText('New Alert')).toBeInTheDocument();
      });
    });
  });

  describe('Animation and Positioning', () => {
    test('has correct positioning classes', async () => {
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        const alertElement = screen.getByText('High Gas Usage Detected').closest('div');
        expect(alertElement).toHaveClass('fixed', 'top-20', 'right-4', 'z-40');
      });
    });

    test('has animation classes', async () => {
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        const alertElement = screen.getByText('High Gas Usage Detected').closest('div');
        expect(alertElement).toHaveClass('transition-all', 'duration-500', 'ease-in-out');
      });
    });

    test('has shadow and border radius', async () => {
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        const alertElement = screen.getByText('High Gas Usage Detected').closest('div');
        expect(alertElement).toHaveClass('shadow-lg', 'rounded-lg');
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', async () => {
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        const alertElement = screen.getByRole('alert');
        expect(alertElement).toBeInTheDocument();
      });
    });

    test('buttons are keyboard accessible', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        const closeButton = screen.getByTestId('x-icon').closest('button');
        expect(closeButton).toBeVisible();
        expect(closeButton).not.toHaveAttribute('disabled');
      });
    });

    test('has proper button labels', async () => {
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    test('cleans up timers on unmount', () => {
      const { unmount } = render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      unmount();
      
      // Advance time after unmount - should not cause issues
      act(() => {
        jest.advanceTimersByTime(60000);
      });
      
      expect(mockAgentService.getRecentAlerts).not.toHaveBeenCalled();
    });

    test('handles rapid alert updates efficiently', async () => {
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      // Trigger multiple rapid updates
      for (let i = 0; i < 10; i++) {
        act(() => {
          jest.advanceTimersByTime(100);
        });
      }
      
      // Should not cause performance issues or multiple renders
      await waitFor(() => {
        expect(screen.getByText('High Gas Usage Detected')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles empty alert arrays', async () => {
      mockAgentService.getRecentAlerts.mockResolvedValue([]);
      
      render(<DynamicFloatingAlertSystem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    test('handles malformed alert data', async () => {
      const malformedAlert = {
        id: 'malformed',
        // Missing required fields
      };
      
      mockAgentService.getRecentAlerts.mockResolvedValue([malformedAlert]);
      
      expect(() => {
        render(<DynamicFloatingAlertSystem {...defaultProps} />);
      }).not.toThrow();
    });

    test('handles missing agentService prop', () => {
      expect(() => {
        render(<DynamicFloatingAlertSystem />);
      }).not.toThrow();
    });
  });
});
