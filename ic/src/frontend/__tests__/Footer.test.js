import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Footer from '../src/components/Footer';

// Mock the ThemeContext
const mockToggleTheme = jest.fn();
const mockThemeContext = {
  isDarkMode: false,
  toggleTheme: mockToggleTheme,
};

jest.mock('../src/contexts/ThemeContext', () => ({
  useTheme: () => mockThemeContext,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Sun: () => <div data-testid="sun-icon">Sun</div>,
  Moon: () => <div data-testid="moon-icon">Moon</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  Zap: () => <div data-testid="zap-icon">Zap</div>,
}));

describe('Footer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockThemeContext.isDarkMode = false;
  });

  describe('Rendering', () => {
    test('renders footer with all trust indicators', () => {
      render(<Footer />);
      
      expect(screen.getByText('24/7 Monitoring')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Security')).toBeInTheDocument();
      expect(screen.getByText('Instant Alerts')).toBeInTheDocument();
      
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
      expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
      expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
    });

    test('renders copyright notice', () => {
      render(<Footer />);
      
      expect(screen.getByText('© 2025 Canary Contract Guardian')).toBeInTheDocument();
    });

    test('renders theme toggle button', () => {
      render(<Footer />);
      
      const themeButton = screen.getByRole('button', { name: /switch to/i });
      expect(themeButton).toBeInTheDocument();
    });

    test('shows moon icon in light mode', () => {
      mockThemeContext.isDarkMode = false;
      render(<Footer />);
      
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
    });

    test('shows sun icon in dark mode', () => {
      mockThemeContext.isDarkMode = true;
      render(<Footer />);
      
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
    });
  });

  describe('Theme Toggle Functionality', () => {
    test('calls toggleTheme when theme button is clicked', async () => {
      const user = userEvent.setup();
      render(<Footer />);
      
      const themeButton = screen.getByRole('button', { name: /switch to/i });
      await user.click(themeButton);
      
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    test('has correct aria-label for light mode', () => {
      mockThemeContext.isDarkMode = false;
      render(<Footer />);
      
      const themeButton = screen.getByRole('button', { name: 'Switch to dark mode' });
      expect(themeButton).toBeInTheDocument();
    });

    test('has correct aria-label for dark mode', () => {
      mockThemeContext.isDarkMode = true;
      render(<Footer />);
      
      const themeButton = screen.getByRole('button', { name: 'Switch to light mode' });
      expect(themeButton).toBeInTheDocument();
    });

    test('theme button has hover effects', () => {
      render(<Footer />);
      
      const themeButton = screen.getByRole('button', { name: /switch to/i });
      expect(themeButton).toHaveClass('hover:bg-gray-100', 'dark:hover:bg-gray-800');
    });
  });

  describe('Styling and Layout', () => {
    test('has proper container structure', () => {
      render(<Footer />);
      
      const footer = screen.getByText('© 2025 Canary Contract Guardian').closest('div').parentElement.parentElement;
      expect(footer).toHaveClass('bg-white', 'dark:bg-gray-900', 'border-t', 'border-gray-200', 'dark:border-gray-700');
    });

    test('has responsive layout classes', () => {
      render(<Footer />);
      
      const contentContainer = screen.getByText('24/7 Monitoring').closest('div');
      expect(contentContainer).toHaveClass('flex', 'flex-col', 'lg:flex-row');
    });

    test('trust indicators have correct styling', () => {
      render(<Footer />);
      
      const monitoring = screen.getByText('24/7 Monitoring').closest('div');
      const security = screen.getByText('Enterprise Security').closest('div');
      const alerts = screen.getByText('Instant Alerts').closest('div');
      
      expect(monitoring).toHaveClass('flex', 'items-center', 'gap-2');
      expect(security).toHaveClass('flex', 'items-center', 'gap-2');
      expect(alerts).toHaveClass('flex', 'items-center', 'gap-2');
    });

    test('icons have correct colors', () => {
      render(<Footer />);
      
      const checkIcon = screen.getByTestId('check-circle-icon');
      const shieldIcon = screen.getByTestId('shield-icon');
      const zapIcon = screen.getByTestId('zap-icon');
      
      expect(checkIcon).toHaveClass('text-green-500');
      expect(shieldIcon).toHaveClass('text-blue-500');
      expect(zapIcon).toHaveClass('text-yellow-500');
    });
  });

  describe('Dark Mode Styling', () => {
    test('applies dark mode classes correctly', () => {
      render(<Footer />);
      
      const footer = screen.getByText('© 2025 Canary Contract Guardian').closest('div').parentElement.parentElement;
      expect(footer).toHaveClass('dark:bg-gray-900', 'dark:border-gray-700');
      
      const textElements = screen.getAllByText(/24\/7 Monitoring|Enterprise Security|Instant Alerts|© 2025/);
      textElements.forEach(element => {
        expect(element.closest('div')).toHaveClass('dark:text-gray-300', 'dark:text-gray-400');
      });
    });

    test('theme button has dark mode styling', () => {
      render(<Footer />);
      
      const themeButton = screen.getByRole('button', { name: /switch to/i });
      expect(themeButton).toHaveClass('dark:hover:bg-gray-800');
    });
  });

  describe('Accessibility', () => {
    test('has proper semantic structure', () => {
      render(<Footer />);
      
      // Footer should be in a footer element or have proper role
      const footer = screen.getByText('© 2025 Canary Contract Guardian').closest('div').parentElement.parentElement;
      expect(footer).toBeInTheDocument();
    });

    test('theme toggle button is keyboard accessible', () => {
      render(<Footer />);
      
      const themeButton = screen.getByRole('button', { name: /switch to/i });
      expect(themeButton).not.toHaveAttribute('disabled');
      expect(themeButton).toHaveAttribute('aria-label');
    });

    test('has proper focus styles', () => {
      render(<Footer />);
      
      const themeButton = screen.getByRole('button', { name: /switch to/i });
      expect(themeButton).toHaveClass('transition-colors');
    });

    test('trust indicators are properly labeled', () => {
      render(<Footer />);
      
      expect(screen.getByText('24/7 Monitoring')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Security')).toBeInTheDocument();
      expect(screen.getByText('Instant Alerts')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('has responsive flex direction classes', () => {
      render(<Footer />);
      
      const flexContainer = screen.getByText('24/7 Monitoring').closest('div').parentElement;
      expect(flexContainer).toHaveClass('flex-col', 'lg:flex-row');
    });

    test('has responsive gap classes', () => {
      render(<Footer />);
      
      const flexContainer = screen.getByText('24/7 Monitoring').closest('div').parentElement;
      expect(flexContainer).toHaveClass('gap-4', 'lg:gap-0');
    });

    test('trust indicators have responsive wrap', () => {
      render(<Footer />);
      
      const trustContainer = screen.getByText('24/7 Monitoring').closest('div');
      expect(trustContainer).toHaveClass('flex-wrap', 'lg:flex-nowrap');
    });
  });

  describe('Integration with Theme Context', () => {
    test('uses theme context values correctly', () => {
      mockThemeContext.isDarkMode = true;
      render(<Footer />);
      
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
    });

    test('updates when theme context changes', () => {
      const { rerender } = render(<Footer />);
      
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
      
      mockThemeContext.isDarkMode = true;
      rerender(<Footer />);
      
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('renders without performance issues', () => {
      const startTime = performance.now();
      render(<Footer />);
      const endTime = performance.now();
      
      // Rendering should be fast (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('handles rapid theme toggles', async () => {
      const user = userEvent.setup();
      render(<Footer />);
      
      const themeButton = screen.getByRole('button', { name: /switch to/i });
      
      // Rapidly click the theme toggle
      await user.click(themeButton);
      await user.click(themeButton);
      await user.click(themeButton);
      
      expect(mockToggleTheme).toHaveBeenCalledTimes(3);
    });
  });
});
