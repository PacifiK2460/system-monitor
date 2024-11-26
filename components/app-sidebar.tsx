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
import { Checkbox } from "./ui/checkbox"
import { ScrollArea } from "./ui/scroll-area"

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
    }),
    resources: z.array(z.object({
        id: z.string(),
        totalAmount: z.number().min(1, {
            message: "La cantidad de recursos debe ser mayor a 0",
        }),
    })).refine((value) => value.some((item) => item), {
        message: "Debe seleccionar al menos un recurso",
    }),
})

// Define the process type
type Process = {
    Ready: {
        id: string
        name: string
        intensity: number
    },
    Blocked: {
        id: string
        name: string
        intensity: number
    },
    Working: {
        id: string
        name: string
        intensity: number
    }
}

// Define the resource type
type Resource = {
    id: string
    name: string
    totalAmount: number
    usedAmount: number
}

export function AppSidebar() {
    const { setTheme } = useTheme()
    // const [simState, setSimState] = useState < "stopped" || "running" > ("stopped")
    const [simState, setSimState] = useState<"stopped" | "running">("running");
    const [simulationSpeed, setSimulationSpeed] = useState(1)
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

        invoke("simulation_add_resource", {
            resource: nuevo_recurso
        }).catch((error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: `No se ha podido agregar el recurso ${nuevo_recurso.name} (${nuevo_recurso.id}) a la simulación. ${error}`,
            })
        })

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
            toast({
                variant: "destructive",
                title: "Error",
                description: `No se ha podido agregar el proceso ${data.name}.`,
            })
            return;
        }

        await Promise.all(data.resources.map(async (resource) => {
            await invoke("process_add_resource", {
                processId: nuevo_proceso.Ready.id,
                resourceId: resource.id,
                amount: resource.totalAmount,
            })
                .then(() => {

                })
                .catch((error) => {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: `No se ha podido asignar el recurso ${resource.id} al proceso ${nuevo_proceso.Ready.name} (${nuevo_proceso.Ready.id}). ${error}`,
                    })
                })
        }));

        invoke("simulation_add_process", {
            name: nuevo_proceso.Ready.name,
            resourceIntensity: intensity,
        }).catch((error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: `No se ha podido agregar el proceso ${nuevo_proceso.Ready.name} (${nuevo_proceso.Ready.id}) a la simulación. ${error}`,
            })
        })

        setProcesses([...processes, nuevo_proceso])
        toast({
            title: "Proceso Agregado",
            description: `Se ha agregado el proceso ${nuevo_proceso.Ready.name} (${nuevo_proceso.Ready.id})`,
        })
    }

    useEffect(() => {
        invoke("simulation_set_simulation_speed", { speed: simulationSpeed })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [simulationSpeed])

    useEffect(() => {
        invoke("simulation_resources")
            .then((res) => {
                console.log("Resources", res)

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
                console.log("Processes R", pros)
                // Check if the processes are the same
                if (JSON.stringify(processes) === JSON.stringify(pros)) {
                    return
                }
                setProcesses(pros as Process[])
            })
            .catch((error) => {
                console.error("Error getting processes", error)
            })

        invoke("start_simulation")
            .then(() => {
                console.log("Simulation started")
            })
            .catch((error) => {
                console.error("Error starting simulation", error)
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

                                            <FormField
                                                control={processForm.control}
                                                name="resources"
                                                render={() => (
                                                    <FormItem>
                                                        <div className="mb-4">
                                                            <FormLabel className="text-base">
                                                                Recursos
                                                            </FormLabel>
                                                            <FormDescription>
                                                                Seleccione los recursos que necesita el proceso
                                                            </FormDescription>
                                                        </div>

                                                        <ScrollArea className="h-36 rounded-sm border px-1">
                                                            {resources.map((item) => (
                                                                <FormField
                                                                    key={item.id}
                                                                    control={processForm.control}
                                                                    name="resources"
                                                                    render={({ field }) => {
                                                                        const currentValue = Array.isArray(field.value) ? field.value : [];
                                                                        return (
                                                                            <div key={item.id} className="flex flex-row items-center m-2">
                                                                                <FormItem
                                                                                    className="flex flex-row items-start space-x-3 space-y-0 grow"
                                                                                >
                                                                                    <FormControl>
                                                                                        <Checkbox
                                                                                            checked={currentValue.some(resource => resource.id === item.id)}
                                                                                            onCheckedChange={(checked) => {
                                                                                                return checked
                                                                                                    ? field.onChange([...currentValue, { id: item.id, totalAmount: 0 }])
                                                                                                    : field.onChange(currentValue.filter((value) => value.id !== item.id));
                                                                                            }}
                                                                                        />
                                                                                    </FormControl>
                                                                                    <FormLabel className="text-sm font-normal">
                                                                                        {item.name} ({item.id})
                                                                                    </FormLabel>
                                                                                </FormItem>

                                                                                <FormItem className="flex flex-row gap-1 items-center">
                                                                                    <FormControl>
                                                                                        <>
                                                                                            <Input
                                                                                                type="number"
                                                                                                placeholder="Cantidad"
                                                                                                disabled={!currentValue.some(resource => resource.id === item.id)}
                                                                                                onChange={(e) => {
                                                                                                    const value = e.target.value;
                                                                                                    const index = currentValue.findIndex(resource => resource.id === item.id);
                                                                                                    const newResources = [...currentValue];
                                                                                                    newResources[index] = { id: item.id, totalAmount: parseInt(value) };
                                                                                                    field.onChange(newResources);
                                                                                                }}
                                                                                            />
                                                                                        </>
                                                                                    </FormControl>
                                                                                </FormItem>
                                                                            </div>
                                                                        );
                                                                    }}
                                                                />
                                                            ))}
                                                        </ScrollArea>

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
                                                <SidebarMenuItem key={process.Ready.id} className="flex">
                                                    <SidebarMenuSubButton>
                                                        {process.Ready.name}
                                                        <Badge>{process.Ready.id}</Badge>
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
                                        simState === "stopped" ?
                                            <ToggleGroupItem value="continue" aria-label="Reanudar"
                                                onClick={() => {
                                                    invoke("start_simulation")
                                                    setSimState("running")
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
                                                    invoke("stop_simulation")
                                                    setSimState("stopped")
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
