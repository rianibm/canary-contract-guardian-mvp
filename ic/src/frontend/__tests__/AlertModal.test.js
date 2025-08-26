import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AlertModal from '../src/components/AlertModal';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon">AlertTriangle</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  Activity: () => <div data-testid="activity-icon">Activity</div>,
  TrendingUp: () => <div data-testid="trending-up-icon">TrendingUp</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  User: () => <div data-testid="user-icon">User</div>,
  FileText: () => <div data-testid="file-text-icon">FileText</div>,
  ExternalLink: () => <div data-testid="external-link-icon">ExternalLink</div>,
}));

describe('AlertModal Component', () => {
  const mockAlert = {
    id: 'alert-123',
    title: 'High Gas Usage Detected',
    description: 'Contract gas usage exceeded threshold of 100,000 units',
    severity: 'warning',
    timestamp: '2025-01-01T10:30:00Z',
    contract: 'contract-abc123',
    nickname: 'DeFi Trading Contract',
    icon: '⚠️',
    category: 'gas',
    details: {
      gasUsed: 150000,
      gasLimit: 100000,
      transactionHash: '0x1234567890abcdef',
      blockNumber: 18500000,
      methodCalled: 'swapTokens',
      triggeredBy: 'user-456',
      additionalInfo: 'This transaction used 50% more gas than the configured threshold.',
    },
    recommendations: [
      'Consider optimizing contract code',
      'Review gas limit settings',
      'Monitor future transactions closely',
    ],
    relatedAlerts: [
      {
        id: 'alert-122',
        title: 'Gas Price Spike',
        timestamp: '2025-01-01T10:25:00Z',
      },
    ],
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    alert: mockAlert,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders when isOpen is true', () => {
      render(<AlertModal {...defaultProps} />);
      
      expect(screen.getByText('Alert Details')).toBeInTheDocument();
      expect(screen.getByText('High Gas Usage Detected')).toBeInTheDocument();
    });

    test('does not render when isOpen is false', () => {
      render(<AlertModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Alert Details')).not.toBeInTheDocument();
    });

    test('does not render when alert is null', () => {
      render(<AlertModal {...defaultProps} alert={null} />);
      
      expect(screen.queryByText('Alert Details')).not.toBeInTheDocument();
    });

    test('renders modal backdrop', () => {
      render(<AlertModal {...defaultProps} />);
      
      const backdrop = screen.getByTestId('modal-backdrop');
      expect(backdrop).toBeInTheDocument();
      expect(backdrop).toHaveClass('fixed', 'inset-0', 'bg-black', 'bg-opacity-50', 'z-50');
    });

    test('renders modal content container', () => {
      render(<AlertModal {...defaultProps} />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('bg-white', 'rounded-xl', 'shadow-2xl', 'max-w-4xl', 'w-full', 'max-h-90vh', 'overflow-hidden');
    });
  });

  describe('Alert Information Display', () => {
    test('displays alert title and description', () => {
      render(<AlertModal {...defaultProps} />);
      
      expect(screen.getByText('High Gas Usage Detected')).toBeInTheDocument();
      expect(screen.getByText('Contract gas usage exceeded threshold of 100,000 units')).toBeInTheDocument();
    });

    test('displays alert icon and nickname', () => {
      render(<AlertModal {...defaultProps} />);
      
      expect(screen.getByText('⚠️')).toBeInTheDocument();
      expect(screen.getByText('DeFi Trading Contract')).toBeInTheDocument();
    });

    test('displays formatted timestamp', () => {
      render(<AlertModal {...defaultProps} />);
      
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
      // Should format the timestamp appropriately
      expect(screen.getByText(/Jan.*2025/)).toBeInTheDocument();
    });

    test('displays contract information', () => {
      render(<AlertModal {...defaultProps} />);
      
      expect(screen.getByText('Contract ID')).toBeInTheDocument();
      expect(screen.getByText('contract-abc123')).toBeInTheDocument();
    });

    test('displays category information', () => {
      render(<AlertModal {...defaultProps} />);
      
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('gas')).toBeInTheDocument();
    });
  });

  describe('Severity Styling', () => {
    test('applies warning severity styling', () => {
      render(<AlertModal {...defaultProps} />);
      
      const severityBadge = screen.getByText('Warning');
      expect(severityBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    test('applies danger severity styling', () => {
      const dangerAlert = { ...mockAlert, severity: 'danger' };
      render(<AlertModal {...defaultProps} alert={dangerAlert} />);
      
      const severityBadge = screen.getByText('Danger');
      expect(severityBadge).toHaveClass('bg-red-100', 'text-red-800');
    });

    test('applies success severity styling', () => {
      const successAlert = { ...mockAlert, severity: 'success' };
      render(<AlertModal {...defaultProps} alert={successAlert} />);
      
      const severityBadge = screen.getByText('Success');
      expect(severityBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    test('applies info severity styling', () => {
      const infoAlert = { ...mockAlert, severity: 'info' };
      render(<AlertModal {...defaultProps} alert={infoAlert} />);
      
      const severityBadge = screen.getByText('Info');
      expect(severityBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    });
  });

  describe('Alert Details Section', () => {
    test('displays technical details when available', () => {
      render(<AlertModal {...defaultProps} />);
      
      expect(screen.getByText('Technical Details')).toBeInTheDocument();
      expect(screen.getByText('Gas Used:')).toBeInTheDocument();
      expect(screen.getByText('150,000')).toBeInTheDocument();
      expect(screen.getByText('Gas Limit:')).toBeInTheDocument();
      expect(screen.getByText('100,000')).toBeInTheDocument();
      expect(screen.getByText('Transaction Hash:')).toBeInTheDocument();
      expect(screen.getByText('0x1234567890abcdef')).toBeInTheDocument();
    });

    test('handles missing details gracefully', () => {
      const alertWithoutDetails = { ...mockAlert, details: undefined };
      render(<AlertModal {...defaultProps} alert={alertWithoutDetails} />);
      
      expect(screen.queryByText('Technical Details')).not.toBeInTheDocument();
    });

    test('displays additional info when available', () => {
      render(<AlertModal {...defaultProps} />);
      
      expect(screen.getByText('This transaction used 50% more gas than the configured threshold.')).toBeInTheDocument();
    });

    test('displays method called information', () => {
      render(<AlertModal {...defaultProps} />);
      
      expect(screen.getByText('Method Called:')).toBeInTheDocument();
      expect(screen.getByText('swapTokens')).toBeInTheDocument();
    });

    test('displays triggered by information', () => {
      render(<AlertModal {...defaultProps} />);
      
      expect(screen.getByText('Triggered By:')).toBeInTheDocument();
      expect(screen.getByText('user-456')).toBeInTheDocument();
    });
  });

  describe('Recommendations Section', () => {
    test('displays recommendations when available', () => {
      render(<AlertModal {...defaultProps} />);
      
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Consider optimizing contract code')).toBeInTheDocument();
      expect(screen.getByText('Review gas limit settings')).toBeInTheDocument();
      expect(screen.getByText('Monitor future transactions closely')).toBeInTheDocument();
    });

    test('handles missing recommendations gracefully', () => {
      const alertWithoutRecommendations = { ...mockAlert, recommendations: undefined };
      render(<AlertModal {...defaultProps} alert={alertWithoutRecommendations} />);
      
      expect(screen.queryByText('Recommendations')).not.toBeInTheDocument();
    });

    test('displays recommendations as list items', () => {
      render(<AlertModal {...defaultProps} />);
      
      const recommendations = screen.getAllByRole('listitem');
      expect(recommendations).toHaveLength(3);
    });
  });

  describe('Related Alerts Section', () => {
    test('displays related alerts when available', () => {
      render(<AlertModal {...defaultProps} />);
      
      expect(screen.getByText('Related Alerts')).toBeInTheDocument();
      expect(screen.getByText('Gas Price Spike')).toBeInTheDocument();
    });

    test('handles missing related alerts gracefully', () => {
      const alertWithoutRelated = { ...mockAlert, relatedAlerts: undefined };
      render(<AlertModal {...defaultProps} alert={alertWithoutRelated} />);
      
      expect(screen.queryByText('Related Alerts')).not.toBeInTheDocument();
    });

    test('formats related alert timestamps', () => {
      render(<AlertModal {...defaultProps} />);
      
      expect(screen.getByText(/Jan.*2025/)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();
      
      render(<AlertModal {...defaultProps} onClose={mockOnClose} />);
      
      const closeButton = screen.getByTestId('x-icon').closest('button');
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();
      
      render(<AlertModal {...defaultProps} onClose={mockOnClose} />);
      
      const backdrop = screen.getByTestId('modal-backdrop');
      await user.click(backdrop);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('does not close when modal content is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();
      
      render(<AlertModal {...defaultProps} onClose={mockOnClose} />);
      
      const modalContent = screen.getByRole('dialog');
      await user.click(modalContent);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('closes on Escape key press', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();
      
      render(<AlertModal {...defaultProps} onClose={mockOnClose} />);
      
      await user.keyboard('{Escape}');
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('handles copy to clipboard for transaction hash', async () => {
      const user = userEvent.setup();
      
      // Mock clipboard API
      const mockWriteText = jest.fn();
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });
      
      render(<AlertModal {...defaultProps} />);
      
      const hashElement = screen.getByText('0x1234567890abcdef');
      await user.click(hashElement);
      
      expect(mockWriteText).toHaveBeenCalledWith('0x1234567890abcdef');
    });
  });

  describe('Action Buttons', () => {
    test('displays action buttons', () => {
      render(<AlertModal {...defaultProps} />);
      
      expect(screen.getByText('View on Explorer')).toBeInTheDocument();
      expect(screen.getByText('Mark as Resolved')).toBeInTheDocument();
      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    test('handles view on explorer click', async () => {
      const user = userEvent.setup();
      
      // Mock window.open
      const mockOpen = jest.fn();
      window.open = mockOpen;
      
      render(<AlertModal {...defaultProps} />);
      
      const explorerButton = screen.getByText('View on Explorer');
      await user.click(explorerButton);
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('0x1234567890abcdef'),
        '_blank'
      );
    });

    test('handles mark as resolved click', async () => {
      const user = userEvent.setup();
      
      render(<AlertModal {...defaultProps} />);
      
      const resolveButton = screen.getByText('Mark as Resolved');
      await user.click(resolveButton);
      
      // Should show confirmation or update UI
      expect(screen.getByText('Resolved')).toBeInTheDocument();
    });

    test('handles close button click', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();
      
      render(<AlertModal {...defaultProps} onClose={mockOnClose} />);
      
      const closeButton = screen.getByText('Close');
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Design', () => {
    test('has responsive classes for mobile', () => {
      render(<AlertModal {...defaultProps} />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('mx-4', 'sm:mx-0');
    });

    test('has responsive width classes', () => {
      render(<AlertModal {...defaultProps} />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('max-w-4xl', 'w-full');
    });

    test('has responsive height constraints', () => {
      render(<AlertModal {...defaultProps} />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('max-h-90vh', 'overflow-hidden');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<AlertModal {...defaultProps} />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-labelledby');
      expect(modal).toHaveAttribute('aria-describedby');
    });

    test('has proper heading structure', () => {
      render(<AlertModal {...defaultProps} />);
      
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    test('close button is keyboard accessible', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();
      
      render(<AlertModal {...defaultProps} onClose={mockOnClose} />);
      
      const closeButton = screen.getByTestId('x-icon').closest('button');
      closeButton.focus();
      await user.keyboard('{Enter}');
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('traps focus within modal', async () => {
      const user = userEvent.setup();
      
      render(<AlertModal {...defaultProps} />);
      
      // Focus should be trapped within the modal
      const firstButton = screen.getByTestId('x-icon').closest('button');
      const lastButton = screen.getByText('Close');
      
      expect(document.activeElement).toBe(firstButton);
      
      await user.tab();
      await user.tab();
      await user.tab();
      
      // Focus should cycle back to first element
      expect(document.activeElement).toBe(firstButton);
    });
  });

  describe('Animation and Transitions', () => {
    test('has transition classes', () => {
      render(<AlertModal {...defaultProps} />);
      
      const backdrop = screen.getByTestId('modal-backdrop');
      expect(backdrop).toHaveClass('transition-opacity', 'duration-300');
    });

    test('has transform classes for animation', () => {
      render(<AlertModal {...defaultProps} />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('transition-all', 'duration-300', 'ease-out');
    });
  });

  describe('Edge Cases', () => {
    test('handles very long alert titles', () => {
      const longTitleAlert = {
        ...mockAlert,
        title: 'This is a very long alert title that should wrap properly and not break the layout even when it contains many words and extends beyond normal length',
      };
      
      render(<AlertModal {...defaultProps} alert={longTitleAlert} />);
      
      expect(screen.getByText(/This is a very long alert title/)).toBeInTheDocument();
    });

    test('handles missing optional fields', () => {
      const minimalAlert = {
        id: 'minimal',
        title: 'Minimal Alert',
        severity: 'info',
        timestamp: '2025-01-01T10:00:00Z',
      };
      
      expect(() => {
        render(<AlertModal {...defaultProps} alert={minimalAlert} />);
      }).not.toThrow();
    });

    test('handles malformed timestamp', () => {
      const invalidTimestampAlert = {
        ...mockAlert,
        timestamp: 'invalid-timestamp',
      };
      
      expect(() => {
        render(<AlertModal {...defaultProps} alert={invalidTimestampAlert} />);
      }).not.toThrow();
    });

    test('handles empty recommendations array', () => {
      const emptyRecommendationsAlert = {
        ...mockAlert,
        recommendations: [],
      };
      
      render(<AlertModal {...defaultProps} alert={emptyRecommendationsAlert} />);
      
      expect(screen.queryByText('Recommendations')).not.toBeInTheDocument();
    });

    test('handles missing onClose prop', () => {
      expect(() => {
        render(<AlertModal isOpen={true} alert={mockAlert} />);
      }).not.toThrow();
    });
  });
});
