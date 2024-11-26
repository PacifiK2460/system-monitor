import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Button } from "./button";
import { CardDescription } from "./card";
import { Activity } from "lucide-react";

export interface DataChildren {
    name: string;
    size: number;
    color?: React.CSSProperties["backgroundColor"];
}

export interface Data {
    name: string;
    children: DataChildren[];
}

export function Treemap({ data, className }: {
    data: Data;
    className?: React.HTMLAttributes<HTMLDivElement>["className"];
}) {
    const total = data.children.reduce((acc, child) => acc + child.size, 0);

    return (
        <div className={className}>
            <div className="flex flex-row h-full gap-0">
                {data.children.map((child) => (
                    <TooltipProvider key={child.name}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" className="rounded-none bg-white text-black h-full border border-black/10 [writing-mode:vertical-rl] justify-center" key={child.name + child.size} style={{ width: `${(child.size * 100) / total}%`, backgroundColor: `${child.color}` }}>{child.name}</Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-sm backdrop-blur-3xl bg-black/90 w-56 rounded-xl p-5">
                                    <div className="flex flex-row gap-1 items-center">
                                        <Activity />
                                        {child.name}
                                    </div>
                                    <CardDescription>{child.size}MB / {total}MB</CardDescription>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
                <p className="[writing-mode:vertical-rl] self-center">
                    {total}MB
                </p>
            </div>
        </div>
    )
}