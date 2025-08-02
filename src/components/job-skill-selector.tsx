import React, { useState, useCallback } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandGroup, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Plus, Check } from "lucide-react";

interface SkillGroup {
    label: string;
    skills: { label: string; value: string }[];
}

interface JobSkillSelectorProps {
    selectedSkills: string[];
    onSkillsChange: (skills: string[]) => void;
    placeholder?: string;
    maxSkills?: number;
}

// Predefined skill groups for job creation
const JOB_SKILL_GROUPS: SkillGroup[] = [
    {
        label: "Frontend Development",
        skills: [
            { label: "React", value: "React" },
            { label: "Vue.js", value: "Vue.js" },
            { label: "Angular", value: "Angular" },
            { label: "JavaScript", value: "JavaScript" },
            { label: "TypeScript", value: "TypeScript" },
            { label: "HTML", value: "HTML" },
            { label: "CSS", value: "CSS" },
            { label: "Sass/SCSS", value: "Sass/SCSS" },
            { label: "Tailwind CSS", value: "Tailwind CSS" },
            { label: "Next.js", value: "Next.js" },
            { label: "Svelte", value: "Svelte" },
        ]
    },
    {
        label: "Backend Development",
        skills: [
            { label: "Node.js", value: "Node.js" },
            { label: "Python", value: "Python" },
            { label: "Java", value: "Java" },
            { label: "C#", value: "C#" },
            { label: "PHP", value: "PHP" },
            { label: "Ruby", value: "Ruby" },
            { label: "Go", value: "Go" },
            { label: "Rust", value: "Rust" },
            { label: "Express.js", value: "Express.js" },
            { label: "Django", value: "Django" },
            { label: "Flask", value: "Flask" },
            { label: "Spring Boot", value: "Spring Boot" },
        ]
    },
    {
        label: "Databases",
        skills: [
            { label: "MySQL", value: "MySQL" },
            { label: "PostgreSQL", value: "PostgreSQL" },
            { label: "MongoDB", value: "MongoDB" },
            { label: "Redis", value: "Redis" },
            { label: "SQLite", value: "SQLite" },
            { label: "Oracle", value: "Oracle" },
            { label: "SQL Server", value: "SQL Server" },
            { label: "Elasticsearch", value: "Elasticsearch" },
        ]
    },
    {
        label: "Cloud & DevOps",
        skills: [
            { label: "AWS", value: "AWS" },
            { label: "Azure", value: "Azure" },
            { label: "Google Cloud", value: "Google Cloud" },
            { label: "Docker", value: "Docker" },
            { label: "Kubernetes", value: "Kubernetes" },
            { label: "Jenkins", value: "Jenkins" },
            { label: "GitLab CI", value: "GitLab CI" },
            { label: "Terraform", value: "Terraform" },
            { label: "Ansible", value: "Ansible" },
        ]
    },
    {
        label: "Mobile Development",
        skills: [
            { label: "React Native", value: "React Native" },
            { label: "Flutter", value: "Flutter" },
            { label: "Swift", value: "Swift" },
            { label: "Kotlin", value: "Kotlin" },
            { label: "Ionic", value: "Ionic" },
            { label: "Xamarin", value: "Xamarin" },
        ]
    },
    {
        label: "Tools & Others",
        skills: [
            { label: "Git", value: "Git" },
            { label: "GitHub", value: "GitHub" },
            { label: "GitLab", value: "GitLab" },
            { label: "Jira", value: "Jira" },
            { label: "Slack", value: "Slack" },
            { label: "Figma", value: "Figma" },
            { label: "Adobe XD", value: "Adobe XD" },
            { label: "Postman", value: "Postman" },
            { label: "REST APIs", value: "REST APIs" },
            { label: "GraphQL", value: "GraphQL" },
            { label: "Agile", value: "Agile" },
            { label: "Scrum", value: "Scrum" },
        ]
    }
];

export const JobSkillSelector: React.FC<JobSkillSelectorProps> = ({
    selectedSkills,
    onSkillsChange,
    placeholder = "Select skills...",
    maxSkills = 20
}) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [customSkill, setCustomSkill] = useState("");

    const toggleSkill = useCallback((skillValue: string) => {
        if (selectedSkills.includes(skillValue)) {
            onSkillsChange(selectedSkills.filter(s => s !== skillValue));
        } else if (selectedSkills.length < maxSkills) {
            onSkillsChange([...selectedSkills, skillValue]);
        }
    }, [selectedSkills, onSkillsChange, maxSkills]);

    const removeSkill = useCallback((skillValue: string) => {
        onSkillsChange(selectedSkills.filter(s => s !== skillValue));
    }, [selectedSkills, onSkillsChange]);

    const addCustomSkill = useCallback(() => {
        const trimmedSkill = customSkill.trim();
        if (trimmedSkill && !selectedSkills.includes(trimmedSkill) && selectedSkills.length < maxSkills) {
            onSkillsChange([...selectedSkills, trimmedSkill]);
            setCustomSkill("");
        }
    }, [customSkill, selectedSkills, onSkillsChange, maxSkills]);

    const handleCustomSkillKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomSkill();
        }
    };

    // Filter skills based on search term
    const filteredGroups = JOB_SKILL_GROUPS.map(group => ({
        ...group,
        skills: group.skills.filter(skill =>
            skill.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(group => group.skills.length > 0);

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between text-left font-normal"
                    >
                        {selectedSkills.length > 0
                            ? `${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''} selected`
                            : placeholder
                        }
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                        <CommandInput
                            placeholder="Search skills..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                        />
                        <ScrollArea className="h-[300px]">
                            <CommandList>
                                {/* Custom Skill Input */}
                                <CommandGroup heading="Add Custom Skill">
                                    <div className="flex gap-2 p-2">
                                        <Input
                                            placeholder="Enter custom skill..."
                                            value={customSkill}
                                            onChange={(e) => setCustomSkill(e.target.value)}
                                            onKeyPress={handleCustomSkillKeyPress}
                                            className="flex-1"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={addCustomSkill}
                                            disabled={!customSkill.trim() || selectedSkills.includes(customSkill.trim()) || selectedSkills.length >= maxSkills}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CommandGroup>

                                {/* Predefined Skills */}
                                {filteredGroups.map((group) => (
                                    <CommandGroup key={group.label} heading={group.label}>
                                        {group.skills.map((skill) => {
                                            const isSelected = selectedSkills.includes(skill.value);
                                            const isDisabled = !isSelected && selectedSkills.length >= maxSkills;

                                            return (
                                                <CommandItem
                                                    key={skill.value}
                                                    value={skill.value}
                                                    onSelect={() => !isDisabled && toggleSkill(skill.value)}
                                                    className={`cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <div className="flex items-center space-x-2 flex-1">
                                                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                                                            }`}>
                                                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                                        </div>
                                                        <span>{skill.label}</span>
                                                    </div>
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandGroup>
                                ))}
                            </CommandList>
                        </ScrollArea>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Selected Skills Display */}
            {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSkills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                            {skill}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 w-4 h-4 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => removeSkill(skill)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))}
                </div>
            )}

            {selectedSkills.length >= maxSkills && (
                <p className="text-sm text-muted-foreground">
                    Maximum {maxSkills} skills allowed
                </p>
            )}
        </div>
    );
};
