"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { extractKeyValuePairs } from "@/lib/job-description-parser";

interface JobDataExtractorProps {
    description: any;
    title?: string;
}

export function JobDataExtractor({ description, title = "Job Description Analysis" }: JobDataExtractorProps) {
    const keyValuePairs = extractKeyValuePairs(description);

    const renderValue = (key: string, value: any): React.ReactNode => {
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return <span className="text-muted-foreground">None</span>;
            }
            return (
                <div className="space-y-1">
                    {value.map((item, index) => (
                        <Badge key={index} variant="outline" className="mr-1 mb-1">
                            {item}
                        </Badge>
                    ))}
                </div>
            );
        }

        if (typeof value === 'boolean') {
            return <Badge variant={value ? "default" : "secondary"}>{value ? "Yes" : "No"}</Badge>;
        }

        if (typeof value === 'number') {
            return <Badge variant="outline">{value}</Badge>;
        }

        if (typeof value === 'string' && value.length > 100) {
            return (
                <div className="text-sm bg-muted p-2 rounded-md max-h-32 overflow-y-auto">
                    {value}
                </div>
            );
        }

        return <span>{value}</span>;
    };

    const getCategoryColor = (key: string): string => {
        if (key.toLowerCase().includes('benefit')) return 'text-green-600';
        if (key.toLowerCase().includes('requirement')) return 'text-blue-600';
        if (key.toLowerCase().includes('responsibilit')) return 'text-purple-600';
        if (key.toLowerCase().includes('experience')) return 'text-orange-600';
        return 'text-gray-600';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(keyValuePairs).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                            <div className={`font-medium text-sm ${getCategoryColor(key)}`}>
                                {key}
                            </div>
                            <div className="pl-2">
                                {renderValue(key, value)}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
