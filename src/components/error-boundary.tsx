'use client';

import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallbackMessage?: string;
    onRetry?: () => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="h-5 w-5" />
                            Something went wrong
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-600 text-sm mb-4">
                            {this.props.fallbackMessage || 
                             'An error occurred while loading this section. Please try refreshing or contact support if the problem persists.'}
                        </p>
                        {this.props.onRetry && (
                            <Button 
                                onClick={() => {
                                    this.setState({ hasError: false, error: undefined });
                                    this.props.onRetry?.();
                                }}
                                variant="outline"
                                size="sm"
                                className="text-red-700 border-red-300 hover:bg-red-100"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                            </Button>
                        )}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4 text-xs text-red-600">
                                <summary className="cursor-pointer">Error Details (Development)</summary>
                                <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}

// Hook version for functional components
export function useErrorHandler() {
    const [error, setError] = React.useState<Error | null>(null);

    const resetError = () => setError(null);

    const captureError = React.useCallback((error: Error) => {
        console.error('Captured error:', error);
        setError(error);
    }, []);

    if (error) {
        throw error; // Let ErrorBoundary catch it
    }

    return { captureError, resetError };
}
