import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface TestimonialCardProps {
    name: string;
    role: string;
    company: string;
    content: string;
    rating: number;
    avatar?: string;
}

export default function TestimonialCard({
    name,
    role,
    company,
    content,
    rating,
    avatar
}: TestimonialCardProps) {
    return (
        <Card className="h-full">
            <CardContent className="p-6">
                {/* Rating */}
                <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                        />
                    ))}
                </div>

                {/* Testimonial Content */}
                <blockquote className="text-gray-600 dark:text-gray-400 mb-6 italic">
                    "{content}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={avatar} alt={name} />
                        <AvatarFallback>
                            {name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                            {name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {role} at {company}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
