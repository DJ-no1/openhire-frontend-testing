import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    iconColor?: string;
}

export default function FeatureCard({ icon: Icon, title, description, iconColor = "text-primary" }: FeatureCardProps) {
    return (
        <Card className="text-center hover:shadow-lg transition-all duration-200 hover:scale-105 group">
            <CardContent className="p-6">
                <div className="mx-auto mb-4 w-fit group-hover:scale-110 transition-transform duration-200">
                    <Icon className={`h-8 w-8 ${iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
