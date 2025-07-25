import React from "react";
import styles from "./skillselector.module.css";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandGroup, CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SkillGroup {
    label: string;
    skills: { label: string; value: string }[];
}

interface SkillSelectorProps {
    skillGroups: SkillGroup[];
    selectedSkills: string[];
    onSkillChange: (skill: string) => void;
}

export const SkillSelector: React.FC<SkillSelectorProps> = ({ skillGroups, selectedSkills, onSkillChange }) => {
    // Ensure mouse wheel scroll works when hovering over the skill popup
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (scrollAreaRef.current && e.target instanceof HTMLElement && scrollAreaRef.current.contains(e.target)) {
                scrollAreaRef.current.scrollTop += e.deltaY;
                e.preventDefault();
            }
        };
        const current = scrollAreaRef.current;
        if (current) {
            current.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (current) {
                current.removeEventListener('wheel', handleWheel);
            }
        };
    }, []);
    const handleSkillSelect = React.useCallback((skill: string) => () => {
        onSkillChange(skill);
    }, [onSkillChange]);

    const handleSkillCheckboxChange = React.useCallback((skill: string) => () => {
        onSkillChange(skill);
    }, [onSkillChange]);

    const selectedSkillsDisplay = React.useMemo(() => {
        if (selectedSkills.length > 0) {
            return `${selectedSkills.length} skill${selectedSkills.length > 1 ? "s" : ""} selected`;
        }
        return "Select skills";
    }, [selectedSkills]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                    {selectedSkillsDisplay}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0">
                <Command>
                    <CommandInput placeholder="Search skills..." />
                    <ScrollArea className="h-80 w-full" ref={scrollAreaRef}> {/* Increased height for longer list */}
                        <CommandList className="w-full">
                            {skillGroups.map((group) => (
                                <CommandGroup key={group.label} heading={group.label}>
                                    {group.skills.map((skill) => (
                                        <CommandItem
                                            key={skill.value}
                                            onSelect={handleSkillSelect(skill.value)}
                                            className="flex items-center cursor-pointer"
                                        >
                                            <Checkbox
                                                checked={selectedSkills.includes(skill.value)}
                                                onCheckedChange={handleSkillCheckboxChange(skill.value)}
                                                id={`skill-${skill.value}`}
                                            />
                                            <label htmlFor={`skill-${skill.value}`} className="ml-2 cursor-pointer select-none">
                                                {skill.label}
                                            </label>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ))}
                        </CommandList>
                    </ScrollArea>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
