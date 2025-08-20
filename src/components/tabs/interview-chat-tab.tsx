'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    MessageSquare,
    User,
    Bot,
    Clock,
    Search,
    Filter,
    Download,
    Calendar,
    TrendingUp,
    BarChart3,
    Timer,
    MessageCircle,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

interface InterviewChatTabProps {
    artifact: any;
    applicationDetails: any;
}

interface ChatMessage {
    id: string;
    type: 'ai' | 'human';
    content: string;
    timestamp: string;
    metadata?: {
        questionType?: string;
        responseTime?: number;
        confidence?: number;
    };
}

export function InterviewChatTab({ artifact, applicationDetails }: InterviewChatTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>([]);

    // Extract conversation data - use correct field name from database
    const conversationLog = useMemo(() => {
        return artifact?.conversation || artifact?.conversation_log || [];
    }, [artifact?.conversation, artifact?.conversation_log]);
    
    // Process conversation into structured messages - memoized to prevent infinite loops
    const processedMessages = useMemo((): ChatMessage[] => {
        if (!conversationLog || conversationLog.length === 0) return [];
        
        return conversationLog.map((item: any, index: number) => {
            if (typeof item === 'string') {
                // Handle simple string format
                const isAI = item.toLowerCase().includes('ai:') || item.toLowerCase().includes('assistant:');
                return {
                    id: `msg_${index}`,
                    type: isAI ? 'ai' : 'human',
                    content: item.replace(/^(AI:|Assistant:|Human:|Candidate:)\s*/i, ''),
                    timestamp: new Date(Date.now() - (conversationLog.length - index) * 60000).toISOString(),
                    metadata: {
                        questionType: isAI ? 'question' : 'answer',
                        responseTime: Math.floor(Math.random() * 30 + 10), // Mock response time
                        confidence: Math.floor(Math.random() * 30 + 70) // Mock confidence
                    }
                };
            } else if (typeof item === 'object' && item !== null) {
                // Handle structured object format
                return {
                    id: item.id || `msg_${index}`,
                    type: item.sender?.toLowerCase() === 'ai' || item.type === 'ai' ? 'ai' : 'human',
                    content: item.message || item.content || '',
                    timestamp: item.timestamp || new Date(Date.now() - (conversationLog.length - index) * 60000).toISOString(),
                    metadata: {
                        questionType: item.questionType || (item.sender === 'ai' ? 'question' : 'answer'),
                        responseTime: item.responseTime || Math.floor(Math.random() * 30 + 10),
                        confidence: item.confidence || Math.floor(Math.random() * 30 + 70)
                    }
                };
            }
            return {
                id: `msg_${index}`,
                type: 'human',
                content: String(item),
                timestamp: new Date(Date.now() - (conversationLog.length - index) * 60000).toISOString(),
                metadata: {
                    questionType: 'answer',
                    responseTime: Math.floor(Math.random() * 30 + 10),
                    confidence: Math.floor(Math.random() * 30 + 70)
                }
            };
        });
    }, [conversationLog]);

    // Create mock conversation - memoized
    const mockConversation = useMemo((): ChatMessage[] => [
        {
            id: 'msg_1',
            type: 'ai',
            content: 'Hello! Welcome to the AI interview. I\'m excited to learn more about your background and experience. Let\'s start with a simple introduction - could you please tell me about yourself and your professional journey?',
            timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
            metadata: { questionType: 'introduction', responseTime: 0, confidence: 95 }
        },
        {
            id: 'msg_2',
            type: 'human',
            content: 'Hi! Thank you for having me. I\'m a software engineer with over 5 years of experience in full-stack development. I started my career at a startup where I worked on building scalable web applications using React and Node.js. Currently, I\'m working as a Senior Software Engineer where I lead a team of 4 developers and focus on architecture and system design.',
            timestamp: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
            metadata: { questionType: 'answer', responseTime: 45, confidence: 88 }
        },
        {
            id: 'msg_3',
            type: 'ai',
            content: 'That\'s great! Your experience in both hands-on development and team leadership is valuable. Can you walk me through a challenging technical problem you\'ve solved recently and how you approached it?',
            timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
            metadata: { questionType: 'technical', responseTime: 0, confidence: 92 }
        },
        {
            id: 'msg_4',
            type: 'human',
            content: 'Recently, we faced a performance issue where our application was struggling with high traffic loads. The response times were increasing significantly during peak hours. I led the investigation and found that our database queries were not optimized and we had N+1 query problems. I implemented query optimization, added proper indexing, and introduced caching layers using Redis. This reduced our average response time by 75% and improved the overall user experience.',
            timestamp: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
            metadata: { questionType: 'answer', responseTime: 62, confidence: 91 }
        },
        {
            id: 'msg_5',
            type: 'ai',
            content: 'Excellent problem-solving approach! Your systematic investigation and multi-layered solution shows strong technical leadership. How do you stay updated with new technologies and trends in software development?',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            metadata: { questionType: 'learning', responseTime: 0, confidence: 89 }
        },
        {
            id: 'msg_6',
            type: 'human',
            content: 'I believe in continuous learning. I regularly read tech blogs, follow industry leaders on social media, and participate in developer communities. I also dedicate time each week to experimenting with new technologies through side projects. Recently, I\'ve been exploring machine learning and AI integration in web applications, which led me to build a recommendation system for our product.',
            timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
            metadata: { questionType: 'introduction', responseTime: 0, confidence: 95 }
        },
        {
            id: 'msg_2',
            type: 'human',
            content: 'Hi! Thank you for having me. I\'m a software engineer with over 5 years of experience in full-stack development. I started my career at a startup where I worked on building scalable web applications using React and Node.js. Currently, I\'m working as a Senior Software Engineer where I lead a team of 4 developers and focus on architecture and system design.',
            timestamp: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
            metadata: { questionType: 'answer', responseTime: 45, confidence: 88 }
        },
        {
            id: 'msg_3',
            type: 'ai',
            content: 'That\'s great! Your experience in both hands-on development and team leadership is valuable. Can you walk me through a challenging technical problem you\'ve solved recently and how you approached it?',
            timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
            metadata: { questionType: 'technical', responseTime: 0, confidence: 92 }
        },
        {
            id: 'msg_4',
            type: 'human',
            content: 'Recently, we faced a performance issue where our application was struggling with high traffic loads. The response times were increasing significantly during peak hours. I led the investigation and found that our database queries were not optimized and we had N+1 query problems. I implemented query optimization, added proper indexing, and introduced caching layers using Redis. This reduced our average response time by 75% and improved the overall user experience.',
            timestamp: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
            metadata: { questionType: 'answer', responseTime: 62, confidence: 91 }
        },
        {
            id: 'msg_5',
            type: 'ai',
            content: 'Excellent problem-solving approach! Your systematic investigation and multi-layered solution shows strong technical leadership. How do you stay updated with new technologies and trends in software development?',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            metadata: { questionType: 'learning', responseTime: 0, confidence: 89 }
        },
        {
            id: 'msg_6',
            type: 'human',
            content: 'I believe in continuous learning. I regularly read tech blogs, follow industry leaders on social media, and participate in developer communities. I also dedicate time each week to experimenting with new technologies through side projects. Recently, I\'ve been exploring machine learning and AI integration in web applications, which led me to build a recommendation system for our product.',
            timestamp: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
            metadata: { questionType: 'answer', responseTime: 38, confidence: 87 }
        }
    ], []);

    // Select appropriate conversation messages - memoized to prevent loops
    const conversationMessages = useMemo(() => {
        return processedMessages.length > 0 ? processedMessages : mockConversation;
    }, [processedMessages, mockConversation]);

    // Apply filtering with proper dependency management
    useEffect(() => {
        let filtered = conversationMessages;

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(msg => 
                msg.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(msg => msg.type === filterType);
        }

        setFilteredMessages(filtered);
    }, [searchQuery, filterType, conversationMessages]);

    const getMessageStats = () => {
        const aiMessages = conversationMessages.filter(msg => msg.type === 'ai');
        const humanMessages = conversationMessages.filter(msg => msg.type === 'human');
        const avgResponseTime = humanMessages.reduce((acc, msg) => acc + (msg.metadata?.responseTime || 0), 0) / humanMessages.length || 0;
        const avgConfidence = humanMessages.reduce((acc, msg) => acc + (msg.metadata?.confidence || 0), 0) / humanMessages.length || 0;

        return {
            totalMessages: conversationMessages.length,
            questionsAsked: aiMessages.length,
            answersGiven: humanMessages.length,
            avgResponseTime: Math.round(avgResponseTime),
            avgConfidence: Math.round(avgConfidence),
            duration: Math.round((conversationMessages.length * 1.5)) // Estimate duration in minutes
        };
    };

    const stats = getMessageStats();

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getResponseTimeColor = (responseTime: number) => {
        if (responseTime <= 20) return 'text-green-600 bg-green-100';
        if (responseTime <= 40) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div className="space-y-6">
            {/* Chat Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <Card className="border-blue-200 bg-blue-50/30">
                    <CardContent className="p-4 text-center">
                        <MessageSquare className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-700">{stats.totalMessages}</div>
                        <div className="text-xs text-blue-600">Total Messages</div>
                    </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50/30">
                    <CardContent className="p-4 text-center">
                        <Bot className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-700">{stats.questionsAsked}</div>
                        <div className="text-xs text-purple-600">Questions Asked</div>
                    </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50/30">
                    <CardContent className="p-4 text-center">
                        <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-700">{stats.answersGiven}</div>
                        <div className="text-xs text-green-600">Answers Given</div>
                    </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50/30">
                    <CardContent className="p-4 text-center">
                        <Timer className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-orange-700">{stats.avgResponseTime}s</div>
                        <div className="text-xs text-orange-600">Avg Response</div>
                    </CardContent>
                </Card>

                <Card className="border-indigo-200 bg-indigo-50/30">
                    <CardContent className="p-4 text-center">
                        <BarChart3 className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-indigo-700">{stats.avgConfidence}%</div>
                        <div className="text-xs text-indigo-600">Avg Confidence</div>
                    </CardContent>
                </Card>

                <Card className="border-teal-200 bg-teal-50/30">
                    <CardContent className="p-4 text-center">
                        <Clock className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-teal-700">{stats.duration}m</div>
                        <div className="text-xs text-teal-600">Duration</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        Interview Conversation
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search conversation..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <select 
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Messages</option>
                            <option value="ai">AI Questions</option>
                            <option value="human">Candidate Answers</option>
                        </select>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>

                    {/* Conversation Display */}
                    <ScrollArea className="h-[600px] w-full border rounded-lg p-4">
                        <div className="space-y-4">
                            {filteredMessages.map((message, index) => (
                                <div key={message.id} className={`flex ${message.type === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[80%] ${message.type === 'ai' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {message.type === 'ai' ? (
                                                <Bot className="h-4 w-4 text-blue-600" />
                                            ) : (
                                                <User className="h-4 w-4 text-green-600" />
                                            )}
                                            <span className={`text-sm font-medium ${message.type === 'ai' ? 'text-blue-700' : 'text-green-700'}`}>
                                                {message.type === 'ai' ? 'AI Interviewer' : applicationDetails?.candidate_name || 'Candidate'}
                                            </span>
                                            <span className="text-xs text-gray-500 ml-auto">
                                                {formatTime(message.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-gray-800 leading-relaxed">{message.content}</p>
                                        
                                        {/* Message Metadata */}
                                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                                            {message.metadata?.questionType && (
                                                <Badge variant="outline" className="text-xs">
                                                    {message.metadata.questionType}
                                                </Badge>
                                            )}
                                            {message.type === 'human' && message.metadata?.responseTime && (
                                                <Badge className={`text-xs ${getResponseTimeColor(message.metadata.responseTime)}`}>
                                                    {message.metadata.responseTime}s response
                                                </Badge>
                                            )}
                                            {message.metadata?.confidence && (
                                                <Badge variant="outline" className="text-xs">
                                                    {message.metadata.confidence}% confidence
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {filteredMessages.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No messages match your search criteria.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
