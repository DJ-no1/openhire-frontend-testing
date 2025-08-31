import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

interface PricingCardProps {
    title: string;
    description: string;
    price: string;
    period: string;
    features: string[];
    isPopular?: boolean;
    ctaText?: string;
    ctaHref?: string;
}

export default function PricingCard({
    title,
    description,
    price,
    period,
    features,
    isPopular = false,
    ctaText = "Get Started",
    ctaHref = "/auth/signup"
}: PricingCardProps) {
    return (
        <Card className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}>
            {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
            )}

            <CardContent className="p-6">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {description}
                    </p>
                    <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                            {price}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                            /{period}
                        </span>
                    </div>
                </div>

                <ul className="space-y-3 mb-6">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                        </li>
                    ))}
                </ul>

                <Link href={ctaHref}>
                    <Button
                        className={`w-full ${isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                        variant={isPopular ? 'default' : 'outline'}
                    >
                        {ctaText}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
