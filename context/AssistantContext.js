// / File: /context / AssistantContext.js
'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { AIPersonas } from '@/lib/Personas';
import toast from 'react-hot-toast';

const WEBSITE_USER = process.env.WEBSITE_USER || 'babagpt.ai';
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const AssistantContext = createContext();

export const AssistantProvider = ({ children }) => {
    // UI States
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [assistantChatId, setAssistantChatId] = useState(null);
    const [messages, setMessages] = useState([]);

    // Model configuration
    const supportModel = AIPersonas.find(
        (p) => p.key === 'claude-3-5-sonnet-latest-helper'
    );

    const toggleAssistant = useCallback(() => {
        setIsOpen((prev) => !prev);
        setIsMinimized(false);
    }, []);

    const toggleMinimize = useCallback(() => {
        setIsMinimized((prev) => !prev);
    }, []);

    const createNewChat = useCallback(async () => {
        try {
            setIsLoading(true);
            const body = {
                userId: WEBSITE_USER,
                initialMessage: 'Conversation started',
                model: {
                    name: supportModel.name,
                    provider: supportModel.provider,
                    modelCodeName: supportModel.modelCodeName,
                    role: supportModel.role,
                },
            };

            const response = await fetch(`${API_URL}/api/chat/createChat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error('Failed to create chat');
            }

            const result = await response.json();
            if (!result.success || !result.data?.id) {
                throw new Error('No valid chat ID returned');
            }

            setAssistantChatId(result.data.id);
            return result.data.id;
        } catch (error) {
            console.error('Error creating chat:', error);
            toast.error('Failed to create chat. Please try again.');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [supportModel]);

    async function tryFetchChatAPI(payload, attempt = 1) {
        try {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error('Failed to get response');
            }
            return response;
        } catch (error) {
            if (attempt < 3) {
                await new Promise((r) => setTimeout(r, 500 * attempt));
                return tryFetchChatAPI(payload, attempt + 1);
            } else {
                throw error;
            }
        }
    }

    const handleStreamResponse = async (response) => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (
                                data.content &&
                                typeof data.content === 'string' &&
                                !data.content.includes('streaming_started') &&
                                !data.content.includes('streaming_completed') &&
                                !data.content.includes('stream_ended')
                            ) {
                                accumulatedContent += data.content;
                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    const lastMessage = newMessages[newMessages.length - 1];

                                    if (lastMessage && lastMessage.role === 'assistant') {
                                        lastMessage.content = accumulatedContent;
                                    }
                                    return newMessages;
                                });
                            }
                        } catch (err) {
                            console.error('Error parsing SSE data:', err);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error processing stream:', error);
            throw error;
        }
    };

    const sendMessage = useCallback(
        async (content, contextData = null) => {  // Added contextData parameter
            if (!content?.trim() || isSending) return;

            try {
                setIsSending(true);

                let tempChatId = assistantChatId;
                if (!tempChatId) {
                    tempChatId = await createNewChat();
                    if (!tempChatId) return;
                    setAssistantChatId(tempChatId);
                }

                const userMessage = {
                    id: nanoid(),
                    role: 'user',
                    content: content.trim(),
                    timestamp: new Date().toISOString(),
                    context: contextData  // Include context if provided
                };

                setMessages((prev) => [...prev, userMessage]);

                setMessages((prev) => [
                    ...prev,
                    {
                        id: nanoid(),
                        role: 'assistant',
                        content: '',
                        timestamp: new Date().toISOString(),
                    },
                ]);

                const payload = {
                    userId: WEBSITE_USER,
                    chatId: tempChatId,
                    content: content.trim(),
                    persona: supportModel,
                    context: contextData  // Include context in API payload
                };

                const response = await tryFetchChatAPI(payload);
                await handleStreamResponse(response);

            } catch (error) {
                console.error('Error sending message:', error);
                setMessages((prev) => [
                    ...prev,
                    {
                        id: nanoid(),
                        role: 'assistant',
                        content: 'I apologize, but I encountered an error. Please try again.',
                        timestamp: new Date().toISOString(),
                    },
                ]);
                toast.error('Failed to process message');
            } finally {
                setIsSending(false);
            }
        },
        [assistantChatId, isSending, createNewChat, supportModel]
    );

    const sendConferenceNotification = useCallback(async (email, conferenceUrl, chatMessages) => {
        try {
            const response = await fetch(`${API_URL}/api/conference-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    conferenceUrl,
                    messages: chatMessages
                })
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Failed to send conference notification');
                throw new Error(error.message || 'Failed to send conference notification');
            }

            const result = await response.json();
            toast.success('Conference notification sent successfully');
            return {
                success: true,
                message: 'Conference notification sent successfully',
                details: result.details
            };

        } catch (error) {
            console.error('Error sending conference notification:', error);
            toast.error('Failed to send notification');
            return {
                success: false,
                error: error.message || 'Failed to send conference notification',
                details: process.env.NODE_ENV === 'development' ? error : undefined
            };
        }
    }, []);

    const resetAssistant = useCallback(() => {
        setMessages([]);
        setAssistantChatId(null);
        setIsMinimized(false);
        setIsOpen(false);
        setIsLoading(false);
        setIsSending(false);
    }, []);

    const value = {
        isOpen,
        isMinimized,
        isLoading: isLoading || isSending,
        messages,
        toggleAssistant,
        toggleMinimize,
        sendMessage,
        resetAssistant,
        sendConferenceNotification,
        isLoggedIn: false,
    };

    return (
        <AssistantContext.Provider value={value}>
            {children}
        </AssistantContext.Provider>
    );
};

export const useAssistant = () => {
    const context = useContext(AssistantContext);
    if (!context) {
        throw new Error('useAssistant must be used within an AssistantProvider');
    }
    return context;
};

export default AssistantContext;