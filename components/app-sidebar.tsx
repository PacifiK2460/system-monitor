"use client"

import {
    Sidebar,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarContent,
    SidebarMenuAction,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarGroupAction,
    SidebarMenuSubButton,
    SidebarMenuBadge,
} from "@/components/ui/sidebar"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { Activity, ChevronDown, Eye, Laptop, List, Minus, Moon, MoreHorizontal, Palette, Pause, Play, Plus, RectangleEllipsis, Settings, SquareArrowLeftIcon, SquareArrowOutUpLeft, SquareArrowOutUpRight, Sun } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { useTheme } from "next-themes"
import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group"
import { StopIcon } from "@radix-ui/react-icons"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip"
import { useState } from "react"
import { Badge } from "./ui/badge"

// import { ThemeButton } from "@/components/ui/theme-button"

export function AppSidebar() {
    const { setTheme } = useTheme()
    const [tps, setTps] = useState(60)

    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="gap-2">
                        <span>Recursos</span>
                    </SidebarGroupLabel>

                    <SidebarGroupAction>
                        <Plus /> <span className="sr-only">Nuevo Recurso</span>
                    </SidebarGroupAction>

                    <SidebarMenu>
                        <Collapsible defaultOpen className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton>
                                        <Activity />
                                        Recursos Disponibles
                                        <ChevronDown className="ml-auto" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        <SidebarMenuSubButton asChild>
                                            <a href="/recursos">
                                                <SquareArrowOutUpRight />
                                                Ver los Recursos
                                            </a>
                                        </SidebarMenuSubButton>
                                        <SidebarMenuItem className="flex">
                                            <SidebarMenuSubButton>
                                                R1
                                                <Badge>472 MB / 500MB</Badge>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem className="flex">
                                            <SidebarMenuSubButton>
                                                R2
                                                <Badge>61 MB / 700MB</Badge>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem className="flex">
                                            <SidebarMenuSubButton>
                                                R3
                                                <Badge>813 MB / 2000MB</Badge>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuItem>
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="gap-2">
                        <span>Procesos</span>
                    </SidebarGroupLabel>
                    <SidebarGroupAction>
                        <Plus /> <span className="sr-only">Nuevo Proceso</span>
                    </SidebarGroupAction>
                    <SidebarMenu>
                        <Collapsible defaultOpen className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton>
                                        <List />
                                        <span>Procesos En Memoria</span>
                                        <ChevronDown className="ml-auto" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        <SidebarMenuSubButton asChild>
                                            <a href="/procesos">
                                                <SquareArrowOutUpRight />
                                                Ver los Procesos
                                            </a>
                                        </SidebarMenuSubButton>
                                        <SidebarMenuItem className="flex">
                                            <SidebarMenuSubButton>
                                                chrome.exe
                                                <Badge>305 MB</Badge>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem className="flex">
                                            <SidebarMenuSubButton>
                                                firefox.exe
                                                <Badge>81 MB</Badge>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem className="flex">
                                            <SidebarMenuSubButton>
                                                vim.exe
                                                <Badge>9 MB</Badge>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem className="flex">
                                            <SidebarMenuSubButton>
                                                beamng.exe
                                                <Badge>950 MB</Badge>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuItem>
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarGroup>
                    <SidebarGroupLabel className="gap-2">
                        <RectangleEllipsis />
                        <span>Sistema</span>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="my-3">
                            <SidebarMenuItem className="flex justify-center">
                                <ToggleGroup type="single">
                                    <ToggleGroupItem value="stop" aria-label="Parar">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <StopIcon className="h-5 w-5 text-red-300" />
                                                </TooltipTrigger>
                                                <TooltipContent className="dark:bg-black/30 bg-black/5 backdrop-blur-3xl p-2 rounded-md border dark:border-white/10 border-black/10">
                                                    <p>Parar Simulación</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="pause" aria-label="Pausar">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Pause className="h-5 w-5 text-blue-300" />
                                                </TooltipTrigger>
                                                <TooltipContent className="dark:bg-black/30 bg-black/5 backdrop-blur-3xl p-2 rounded-md border dark:border-white/10 border-black/10">
                                                    <p>Pausar Simulación</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="continue" aria-label="Reanudar">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Play className="h-5 w-5 text-green-300" />
                                                </TooltipTrigger>
                                                <TooltipContent className="dark:bg-black/30 bg-black/5 backdrop-blur-3xl p-2 rounded-md border dark:border-white/10 border-black/10">
                                                    <p>Continuar Simulación</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </SidebarMenuItem>
                        </SidebarMenu>

                        <SidebarMenu className="my-3">
                            <SidebarMenuItem>
                                <ToggleGroup type="single" className="flex flex-wrap justify-evenly">
                                    <ToggleGroupItem value="stop" aria-label="Parar"
                                        onClick={() => {
                                            if (tps > 1) setTps(tps - 1)
                                        }}
                                    >
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Minus className="h-5 w-5" />
                                                </TooltipTrigger>
                                                <TooltipContent className="dark:bg-black/30 bg-black/5 backdrop-blur-3xl p-2 rounded-md border dark:border-white/10 border-black/10">
                                                    <p>Disminuir TPS</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="pause" aria-label="Pausar">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild className="flex justify-center">
                                                    <span>
                                                        {tps}
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent className="dark:bg-black/30 bg-black/5 backdrop-blur-3xl p-2 rounded-md border dark:border-white/10 border-black/10">
                                                    <p>Ticks por segundo</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="continue" aria-label="Reanudar"
                                        onClick={() => {
                                            setTps(tps + 1)
                                        }}
                                    >
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Plus className="h-5 w-5" />
                                                </TooltipTrigger>
                                                <TooltipContent className="dark:bg-black/30 bg-black/5 backdrop-blur-3xl p-2 rounded-md border dark:border-white/10 border-black/10">
                                                    <p>Aumentar TPS</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>


                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a>
                                <Palette />
                                <span>Tema</span>
                            </a>
                        </SidebarMenuButton>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuAction>
                                    <MoreHorizontal />
                                </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="dark:bg-black/10 bg-white/85 backdrop-blur-3xl p-1 px-2 rounded-sm border dark:border-white/10 border-black/10">
                                <DropdownMenuItem className="hover:dark:bg-white/10 hover:bg-black/10 rounded-sm px-2 py-1 cursor-pointer my-1 flex gap-2" onClick={() => { setTheme("light") }}>
                                    <Sun />
                                    <span>Claro</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:dark:bg-white/10 hover:bg-black/10 rounded-sm px-2 py-1 cursor-pointer my-1 flex gap-2" onClick={() => { setTheme("dark") }}>
                                    <Moon />
                                    <span>Oscuro</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:dark:bg-white/10 hover:bg-black/10 rounded-sm px-2 py-1 cursor-pointer my-1 flex gap-2" onClick={() => { setTheme("system") }}>
                                    <Laptop />
                                    <span>Definido por el Sistema</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a>
                                <Settings />
                                <span>opciones</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar >
    )
}
