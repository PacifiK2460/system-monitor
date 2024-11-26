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
    SidebarGroupAction,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { Activity, ChevronDown, Laptop, List, Minus, Moon, MoreHorizontal, Palette, Pause, Play, Plus, RectangleEllipsis, SquareArrowOutUpRight, Sun } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { useTheme } from "next-themes"
import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group"
import { StopIcon } from "@radix-ui/react-icons"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip"
import { useEffect, useState } from "react"
import { Badge } from "./ui/badge"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { invoke } from '@tauri-apps/api/tauri';
// import { listen } from '@tauri-apps/api/event';
import { Button } from "./ui/button"
import { Input } from "./ui/input"

// import { ThemeButton } from "@/components/ui/theme-button"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { toast } from "@/hooks/use-toast"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const ResourceSchema = z.object({
    name: z.string().min(2, {
        message: "El nombre del recurso debe tener al menos 2 caracteres",
    }),
    totalAmount: z.number().int().min(1, {
        message: "La cantidad total debe ser mayor a 0",
    }),
})

const ProcesoSchema = z.object({
    name: z.string().min(2, {
        message: "El nombre del proceso debe tener al menos 2 caracteres",
    }),
    intensity: z.coerce.number().min(0, {
        message: "La cantidad de memoria debe ser mayor a 0",
    }).max(4, {
        message: "La cantidad de memoria debe ser menor a 4",
    })
})

// Define the process type
type Process = {
    id: number
    name: string
    intensity: number
}

// Define the resource type
type Resource = {
    id: number
    name: string
    totalAmount: number
    usedAmount: number
}

export function AppSidebar() {
    const { setTheme } = useTheme()
    const [simulationSpeed, setSimulationSpeed] = useState(60);
    const [lastSimulationSpeed, setLastSimulationSpeed] = useState(60);
    const [processes, setProcesses] = useState<Process[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);

    const resourceForm = useForm<z.infer<typeof ResourceSchema>>({
        resolver: zodResolver(ResourceSchema),
        defaultValues: {
            name: "R1",
            totalAmount: 500,
        },
    })

    async function onResourceSubmit(data: z.infer<typeof ResourceSchema>) {
        const nuevo_recurso = await invoke("create_resource", {
            name: data.name,
            totalAmount: data.totalAmount,
            blocking: false
        })
            .then((nuevo_res) => {
                return nuevo_res as Resource
            })
            .catch((error) => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: `No se ha podido agregar el recurso ${data.name}. ${error}`,
                })
            })

        if (!nuevo_recurso) {
            return
        }

        setResources([...resources, nuevo_recurso])

        toast({
            title: "Recurso Agregado",
            description: `Se ha agregado el recurso ${nuevo_recurso.name} (${nuevo_recurso.id})`,
        })
    }

    const processForm = useForm<z.infer<typeof ProcesoSchema>>({
        resolver: zodResolver(ProcesoSchema),
        defaultValues: {
            name: "chrome.exe",
            intensity: 1,
        },
    })

    async function onProcessSubmit(data: z.infer<typeof ProcesoSchema>) {
        let intensity = "Low"

        switch (data.intensity) {
            case 0:
                intensity = "None"
            case 1:
                intensity = "Low"
            case 2:
                intensity = "Medium"
            case 3:
                intensity = "High"
            case 4:
                intensity = "Extreme"
            default:
                intensity = "Low"
        }

        const nuevo_proceso = await invoke("create_process", {
            name: data.name,
            resourceIntensity: intensity,
            blocking: false
        })
            .then((nuevo_pro) => {
                return nuevo_pro as Process
            })
            .catch((error) => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: `No se ha podido agregar el proceso ${data.name}. ${error}`,
                })
            })

        if (!nuevo_proceso) {
            return
        }

        setProcesses([...processes, nuevo_proceso])
        toast({
            title: "Proceso Agregado",
            description: `Se ha agregado el proceso ${nuevo_proceso.name} (${nuevo_proceso.id})`,
        })
    }

    useEffect(() => {
        if (lastSimulationSpeed === simulationSpeed) {
            return
        }

        setLastSimulationSpeed(simulationSpeed);
        invoke("simulation_set_simulation_speed", { speed: simulationSpeed })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [simulationSpeed])

    useEffect(() => {
        invoke("simulation_resources")
            .then((res) => {
                // Check if the resources are the same
                if (JSON.stringify(resources) === JSON.stringify(res)) {
                    return
                }
                setResources(res as Resource[])
            })
            .catch((error) => {
                console.error("Error getting resources", error)
            })

        invoke("simulation_processes")
            .then((pros) => {
                // Check if the processes are the same
                if (JSON.stringify(processes) === JSON.stringify(pros)) {
                    return
                }
                setProcesses(pros as Process[])
            })
            .catch((error) => {
                console.error("Error getting processes", error)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="gap-2">
                        <span>Recursos</span>
                    </SidebarGroupLabel>

                    <SidebarGroupAction title="Nuevo Recurso">
                        <>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Plus />
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Nuevo Recurso</DialogTitle>
                                        <DialogDescription>
                                            Complete los campos para agregar un nuevo recurso
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Form {...resourceForm}>
                                        <form onSubmit={resourceForm.handleSubmit(onResourceSubmit)} className="space-y-6">
                                            <FormField
                                                control={resourceForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Nombre del Recurso</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormDescription>
                                                            {resourceForm.formState.errors.name?.message}
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={resourceForm.control}
                                                name="totalAmount"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Cantidad Total</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                        <FormDescription>
                                                            {resourceForm.formState.errors.totalAmount?.message}
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <DialogFooter>
                                                <Button type="submit">Agregar Recurso</Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </>
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
                                        {
                                            resources.map((resource) => (
                                                <SidebarMenuItem key={resource.id} className="flex">
                                                    <SidebarMenuSubButton>
                                                        {resource.name}
                                                        <Badge>{resource.id}</Badge>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuItem>
                                            ))
                                        }
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
                        <>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Plus />
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Nuevo Proceso</DialogTitle>
                                        <DialogDescription>
                                            Complete los campos para agregar un nuevo proceso
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Form {...processForm}>
                                        <form onSubmit={processForm.handleSubmit(onProcessSubmit)} className="space-y-6">
                                            <FormField
                                                control={processForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Nombre del Proceso</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormDescription>
                                                            {processForm.formState.errors.name?.message}
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={processForm.control}
                                                name="intensity"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Intensidad en Memoria</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Entre mayor sea el valor, más memoria consumirá el proceso
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <DialogFooter>
                                                <Button type="submit">Agregar Proceso</Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </>
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

                                        {
                                            processes.map((process) => (
                                                <SidebarMenuItem key={process.id} className="flex">
                                                    <SidebarMenuSubButton>
                                                        {process.name}
                                                        <Badge>{process.id}</Badge>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuItem>
                                            ))
                                        }
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
                                    {
                                        simulationSpeed === 0 ?
                                            <ToggleGroupItem value="continue" aria-label="Reanudar"
                                                onClick={() => {
                                                    setSimulationSpeed(60)
                                                }}
                                            >
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
                                            :
                                            <ToggleGroupItem value="pause" aria-label="Pausar"
                                                onClick={() => {
                                                    setSimulationSpeed(0)
                                                }}
                                            >
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

                                    }
                                </ToggleGroup>
                            </SidebarMenuItem>
                        </SidebarMenu>

                        <SidebarMenu className="my-3">
                            <SidebarMenuItem>
                                <ToggleGroup type="single" className="flex flex-wrap justify-evenly">
                                    <ToggleGroupItem value="stop" aria-label="Parar"
                                        onClick={() => {
                                            if (simulationSpeed > 0) setSimulationSpeed(simulationSpeed - 1)
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
                                                        {simulationSpeed}
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
                                            setSimulationSpeed(simulationSpeed + 1)
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
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar >
    )
}
