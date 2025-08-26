import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ChatInterface from '../src/components/ChatInterface';

// Mock AgentService
const mockSendDirectMessage = jest.fn();
const mockSimulateAgentResponse = jest.fn();
const mockExtractContractId = jest.fn();

jest.mock('../src/services/AgentService', () => ({
  sendDirectMessage: mockSendDirectMessage,
  simulateAgentResponse: mockSimulateAgentResponse,
  extractContractId: mockExtractContractId,
}));

describe('ChatInterface Component', () => {
  const defaultProps = {
    onSendMessage: jest.fn(),
    isConnected: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSendDirectMessage.mockResolvedValue('Agent response');
    mockSimulateAgentResponse.mockResolvedValue('Simulated response');
    mockExtractContractId.mockReturnValue('test-contract-id');
  });

  describe('Rendering', () => {
    test('renders chat interface with header', () => {
      render(<ChatInterface {...defaultProps} />);
      
      expect(screen.getByText('AI Agent Chat')).toBeInTheDocument();
      expect(screen.getByText('Smart Contract Guardian')).toBeInTheDocument();
      expect(screen.getByText('🐦')).toBeInTheDocument();
    });

    test('shows online status when connected', () => {
      render(<ChatInterface {...defaultProps} isConnected={true} />);
      
      expect(screen.getByText('Online')).toBeInTheDocument();
      const statusIndicator = screen.getByText('Online').previousElementSibling;
      expect(statusIndicator).toHaveClass('bg-green-400', 'animate-pulse');
    });

    test('shows offline status when disconnected', () => {
      render(<ChatInterface {...defaultProps} isConnected={false} />);
      
      expect(screen.getByText('Offline')).toBeInTheDocument();
      const statusIndicator = screen.getByText('Offline').previousElementSibling;
      expect(statusIndicator).toHaveClass('bg-red-400');
    });

    test('renders initial agent message', () => {
      render(<ChatInterface {...defaultProps} />);
      
      expect(screen.getByText(/Hello! I'm your smart contract guardian/)).toBeInTheDocument();
      expect(screen.getByText(/Type 'help' for more detailed commands/)).toBeInTheDocument();
    });

    test('renders quick command buttons', () => {
      render(<ChatInterface {...defaultProps} />);
      
      expect(screen.getByText('Quick commands:')).toBeInTheDocument();
      expect(screen.getByText(/monitor this smart contract:/)).toBeInTheDocument();
      expect(screen.getByText('check contract status')).toBeInTheDocument();
      expect(screen.getByText('check for unusual activity')).toBeInTheDocument();
      expect(screen.getByText('help')).toBeInTheDocument();
    });

    test('renders message input and send button', () => {
      render(<ChatInterface {...defaultProps} />);
      
      expect(screen.getByPlaceholderText(/Type your message/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
    });
  });

  describe('Message Handling', () => {
    test('sends message when form is submitted', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message/);
      const sendButton = screen.getByRole('button', { name: 'Send' });
      
      await user.type(input, 'Test message');
      await user.click(sendButton);
      
      expect(mockSendDirectMessage).toHaveBeenCalledWith('Test message');
    });

    test('sends message when Enter key is pressed', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message/);
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      expect(mockSendDirectMessage).toHaveBeenCalledWith('Test message');
    });

    test('displays user message in chat', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message/);
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    test('displays agent response in chat', async () => {
      const user = userEvent.setup();
      mockSendDirectMessage.mockResolvedValue('Agent response');
      
      render(<ChatInterface {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message/);
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText('Agent response')).toBeInTheDocument();
      });
    });

    test('clears input after sending message', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message/);
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      expect(input).toHaveValue('');
    });

    test('prevents sending empty messages', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...defaultProps} />);
      
      const sendButton = screen.getByRole('button', { name: 'Send' });
      
      await user.click(sendButton);
      
      expect(mockSendDirectMessage).not.toHaveBeenCalled();
    });

    test('prevents sending messages while loading', async () => {
      const user = userEvent.setup();
      mockSendDirectMessage.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<ChatInterface {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message/);
      const sendButton = screen.getByRole('button', { name: 'Send' });
      
      await user.type(input, 'First message');
      await user.click(sendButton);
      
      // Try to send another message while first is loading
      await user.type(input, 'Second message');
      await user.click(sendButton);
      
      expect(mockSendDirectMessage).toHaveBeenCalledTimes(1);
    });
  });

  describe('Quick Commands', () => {
    test('clicking quick command fills input', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...defaultProps} />);
      
      const quickCommand = screen.getByText('help');
      const input = screen.getByPlaceholderText(/Type your message/);
      
      await user.click(quickCommand);
      
      expect(input).toHaveValue('help');
    });

    test('truncates long quick commands', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const longCommand = screen.getByText(/monitor this smart contract:/);
      expect(longCommand.textContent).toMatch(/\.\.\./);
    });
  });

  describe('Error Handling', () => {
    test('shows error message when agent service fails', async () => {
      const user = userEvent.setup();
      mockSendDirectMessage.mockRejectedValue(new Error('Service error'));
      mockSimulateAgentResponse.mockResolvedValue('Fallback response');
      
      render(<ChatInterface {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message/);
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText('Fallback response')).toBeInTheDocument();
      });
    });

    test('shows error message when both services fail', async () => {
      const user = userEvent.setup();
      mockSendDirectMessage.mockRejectedValue(new Error('Service error'));
      mockSimulateAgentResponse.mockRejectedValue(new Error('Fallback error'));
      
      render(<ChatInterface {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message/);
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText(/Sorry, I encountered an error/)).toBeInTheDocument();
      });
    });

    test('handles non-string agent responses', async () => {
      const user = userEvent.setup();
      mockSendDirectMessage.mockResolvedValue({ response: 'Object response' });
      
      render(<ChatInterface {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message/);
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText('Object response')).toBeInTheDocument();
      });
    });

    test('handles complex object responses', async () => {
      const user = userEvent.setup();
      mockSendDirectMessage.mockResolvedValue({ data: 'Complex object' });
      
      render(<ChatInterface {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message/);
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText(JSON.stringify({ data: 'Complex object' }))).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading indicator while sending message', async () => {
      const user = userEvent.setup();
      let resolvePromise;
      mockSendDirectMessage.mockImplementation(() => new Promise(resolve => {
        resolvePromise = resolve;
      }));
      
      render(<ChatInterface {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message/);
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      expect(screen.getByText('Agent is thinking...')).toBeInTheDocument();
      
      // Resolve the promise
      resolvePromise('Response');
      
      await waitFor(() => {
        expect(screen.queryByText('Agent is thinking...')).not.toBeInTheDocument();
      });
    });

    test('disables input and button while loading', async () => {
      const user = userEvent.setup();
      mockSendDirectMessage.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<ChatInterface {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message/);
      const sendButton = screen.getByRole('button', { name: 'Send' });
      
      await user.type(input, 'Test message');
      await user.click(sendButton);
      
      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });

    test('shows spinner in send button while loading', async () => {
      const user = userEvent.setup();
      mockSendDirectMessage.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<ChatInterface {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message/);
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      const sendButton = screen.getByRole('button');
      expect(sendButton.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Message Display', () => {
    test('displays messages with timestamps', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message/);
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      // Should show timestamp for user message
      const timestampElements = screen.getAllByText(/\d{1,2}:\d{2}:\d{2}/);
      expect(timestampElements.length).toBeGreaterThan(0);
    });

    test('applies correct styling to user messages', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message/);
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      const userMessage = screen.getByText('Test message').closest('div');
      expect(userMessage).toHaveClass('bg-orange-500', 'text-white');
    });

    test('applies correct styling to agent messages', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const agentMessage = screen.getByText(/Hello! I'm your smart contract guardian/).closest('div');
      expect(agentMessage).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    test('scrolls to bottom when new messages are added', async () => {
      const user = userEvent.setup();
      
      // Mock scrollIntoView
      const mockScrollIntoView = jest.fn();
      Element.prototype.scrollIntoView = mockScrollIntoView;
      
      render(<ChatInterface {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message/);
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      // Should call scrollIntoView when message is added
      await waitFor(() => {
        expect(mockScrollIntoView).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels and structure', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message/);
      const sendButton = screen.getByRole('button', { name: 'Send' });
      
      expect(input).toBeInTheDocument();
      expect(sendButton).toBeInTheDocument();
    });

    test('send button has proper type attribute', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const sendButton = screen.getByRole('button', { name: 'Send' });
      expect(sendButton).toHaveAttribute('type', 'submit');
    });

    test('quick command buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...defaultProps} />);
      
      const helpButton = screen.getByText('help');
      
      helpButton.focus();
      await user.keyboard('{Enter}');
      
      const input = screen.getByPlaceholderText(/Type your message/);
      expect(input).toHaveValue('help');
    });
  });

  describe('Responsive Design', () => {
    test('has responsive message width classes', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message/);
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      const messageContainer = screen.getByText('Test message').closest('div');
      expect(messageContainer).toHaveClass('max-w-xs', 'lg:max-w-md');
    });

    test('has proper container height classes', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const container = screen.getByText('AI Agent Chat').closest('div').parentElement;
      expect(container).toHaveClass('h-full', 'flex', 'flex-col');
    });
  });
});
