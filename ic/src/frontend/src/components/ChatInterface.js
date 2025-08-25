import React, { useState, useRef, useEffect } from "react";
import AgentService from "../services/AgentService";

const ChatInterface = ({ onSendMessage, isConnected }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "agent",
      text: 'Hello! I\'m your smart contract guardian 🐦\n\nI can help you monitor and analyze smart contracts. Try commands like:\n• "monitor this smart contract: [contract-id]"\n• "check this smart contract for unusual activity"\n• "what\'s the status of my contracts?"\n• "stop monitoring [contract-id]"\n\nType \'help\' for more detailed commands.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Send message to the agent
      const response = await sendMessageToAgent(inputMessage);

      // Make sure response is string
      const messageText =
        typeof response === "string"
          ? response
          : response?.response
            ? response.response
            : JSON.stringify(response);

      const agentMessage = {
        id: Date.now() + 1,
        sender: "agent",
        text: messageText,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error("Error sending message to agent:", error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: "agent",
        text: "❌ Sorry, I encountered an error processing your request. Please make sure the agent is running.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessageToAgent = async (message) => {
    try {
      // Try to send to real agent first
      return await AgentService.sendDirectMessage(message);
    } catch (error) {
      console.error("Agent service error:", error);
      // Fallback to simulated response
      return AgentService.simulateAgentResponse(message);
    }
  };

  const extractContractId = (text) => {
    return AgentService.extractContractId(text);
  };

  const quickCommands = [
    "monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai",
    "check contract status",
    "check for unusual activity",
    "help",
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🐦</span>
            <div>
              <h3 className="font-bold text-lg">AI Agent Chat</h3>
              <p className="text-orange-100 text-sm">Smart Contract Guardian</p>
            </div>
          </div>
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
            ></div>
            <span className="text-sm">
              {isConnected ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg whitespace-pre-line ${
                message.sender === "user"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === "user"
                    ? "text-orange-100"
                    : "text-gray-500"
                }`}
              >
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
                <span className="text-sm">Agent is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Commands */}
      <div className="p-3 border-t bg-gray-50">
        <p className="text-xs text-gray-600 mb-2">Quick commands:</p>
        <div className="flex flex-wrap gap-1">
          {quickCommands.map((command, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(command)}
              className="text-xs bg-white border border-gray-200 hover:bg-gray-50 px-2 py-1 rounded text-gray-700 transition-colors"
            >
              {command.length > 30 ? `${command.substring(0, 30)}...` : command}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message... (e.g., 'monitor this smart contract: contract-id')"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <span>Send</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
