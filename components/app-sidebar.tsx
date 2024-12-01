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
import { useContext } from "react"
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

import { invoke } from '@tauri-apps/api/core';
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

const ProcessToDdeleteSchema = z.object({
    id: z.array(
        z.object({
            id: z.string(),
        })
    ).refine((value) => value.some((item) => item), {
        message: "Debe seleccionar al menos un proceso",
    }),
})

import { SimulationContext } from "@/app/simulationContext"
import { Process, ProcessReady, Resource } from "@/lib/defs"
import router from "next/router"

export function AppSidebar() {
    const { setTheme } = useTheme()
    const SimulationData = useContext(SimulationContext)

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

        // setResources([...resources, nuevo_recurso])
        SimulationData.updateResources([...SimulationData.resources, nuevo_recurso])

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

        const _nuevo_proceso = invoke("create_process", {
            name: data.name,
            resourceIntensity: intensity,
            blocking: false
        })
            .then((nuevo_pro) => {
                return nuevo_pro as ProcessReady;
            })
            .catch((error) => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: `No se ha podido agregar el proceso ${data.name}. ${error}`,
                })
            })

        const nuevo_proceso = await _nuevo_proceso;

        if (!nuevo_proceso) {
            toast({
                variant: "destructive",
                title: "Error",
                description: `No se ha podido agregar el proceso ${data.name}.`,
            })
            return;
        }

        console.log("nuevo_proceso", nuevo_proceso)

        data.resources.forEach(async (resource, index) => {
            await invoke("process_add_resource", {
                processId: nuevo_proceso.id,
                resourceId: resource.id,
                amount: resource.totalAmount,
            })
                .then(() => {
                    console.log(`${index + 1}/${data.resources.length} Recurso ${resource.id} asignado al proceso ${nuevo_proceso.name} (${nuevo_proceso.id})`)
                })
                .catch((error) => {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: `No se ha podido asignar el recurso ${resource.id} al proceso ${nuevo_proceso.name} (${nuevo_proceso.id}). ${error}`,
                    })
                })
        })

        const nuevo_proceso_full: Process = {
            Ready: {
                id: nuevo_proceso.id,
                name: nuevo_proceso.name,
                resource_intensity: data.intensity,
                resource_slot: []
            },
            Blocked: {
                id: nuevo_proceso.id,
                name: nuevo_proceso.name,
                resource_intensity: data.intensity,
                resource_slot: []
            },
            Working: {
                id: nuevo_proceso.id,
                name: nuevo_proceso.name,
                resource_intensity: data.intensity,
                resource_slot: []
            },
        }

        // setProcesses([...processes, nuevo_proceso_full])
        SimulationData.updateProcesses([...SimulationData.processes, nuevo_proceso_full])
        toast({
            title: "Proceso Agregado",
            description: `Se ha agregado el proceso ${nuevo_proceso.name} (${nuevo_proceso.id})`,
        })
    }

    const processToDeleteForm = useForm<z.infer<typeof ProcessToDdeleteSchema>>({
        resolver: zodResolver(ProcessToDdeleteSchema),
        defaultValues: {
            id: [],
        },
    })

    async function onProcessToDeleteSubmit(data: z.infer<typeof ProcessToDdeleteSchema>) {
        // console.log("data", data)
        // for evert id invoke simulation_remove_process

        data.id.forEach(async (process) => {
            await invoke("simulation_remove_process", {
                processId: process.id,
            })
                .then(() => {
                    console.log(`Proceso ${process.id} eliminado`)
                })
                .catch((error) => {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: `No se ha podido eliminar el proceso ${process.id}. ${error}`,
                    })
                })
        })

        SimulationData.updateProcesses(SimulationData.processes.filter((process) => {
            return !data.id.some((item) => item.id === process.Ready.id)
        }))

        SimulationData.updateProcessesToDelete([]);
    }


    return (
        <>
            <Sidebar collapsible="icon">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Aplicación</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuSubButton asChild>
                                        <a href="/">
                                            <SquareArrowOutUpRight />
                                            Ver Recursos & Procesos
                                        </a>
                                    </SidebarMenuSubButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

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
                                                    render={({ field }) => {
                                                        const currentValue = field.value;
                                                        return (
                                                            <FormItem>
                                                                <FormLabel>Cantidad Total</FormLabel>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Cantidad"
                                                                    defaultValue={currentValue}
                                                                    disabled={!currentValue}
                                                                    onChange={(e) => {
                                                                        field.onChange(Number(e.target.value));
                                                                    }}
                                                                />
                                                                <FormDescription>
                                                                    {resourceForm.formState.errors.totalAmount?.message}
                                                                </FormDescription>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )
                                                    }
                                                    }
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

                                            {
                                                SimulationData.resources.map((resource) => (
                                                    <SidebarMenuItem key={resource.id} className="flex">
                                                        <SidebarMenuSubButton>
                                                            <p className="flex gap-2"
                                                                onClick={() => {
                                                                    SimulationData.setResourceToView(resource)
                                                                    router.push(`/recurso`)
                                                                }}
                                                            >
                                                                {resource.name}
                                                                <Badge>{resource.id}</Badge>
                                                            </p>
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
                                                                {SimulationData.resources.map((item) => (
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
                                            {
                                                SimulationData.processes.map((process) => (
                                                    <SidebarMenuItem key={process.Ready.id} className="flex">
                                                        <SidebarMenuSubButton>
                                                            <p className="flex gap-2"
                                                                onClick={() => {
                                                                    SimulationData.setProcessToView(process)
                                                                    router.push(`/proceso`)
                                                                }}
                                                            >
                                                                {process.Ready.name}
                                                                <Badge>{process.Ready.id}</Badge>
                                                            </p>
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
                                            SimulationData.simulationState === "stopped" ?
                                                <ToggleGroupItem value="continue" aria-label="Reanudar"
                                                    onClick={() => {
                                                        SimulationData.updateSimulationState("running")
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
                                                        SimulationData.updateSimulationState("stopped")
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
                                                if (SimulationData.simulationSpeed > 0) SimulationData.updateSimulationSpeed(SimulationData.simulationSpeed - 1)
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
                                                            {SimulationData.simulationSpeed}
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
                                                SimulationData.updateSimulationSpeed(SimulationData.simulationSpeed + 1)
                                                // setSimulationSpeed(simulationSpeed + 1)
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

            <Dialog open={SimulationData.processToDelete.length > 0}>
                <DialogContent className="sm:max-w-[425px] bg-red-600">
                    <DialogHeader>
                        <DialogTitle>Estado Inseguro Prevenido</DialogTitle>
                        <DialogDescription className="text-white/90">
                            Por favor, revise los procesos sugeridos para eliminar.
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <Form {...processForm}>
                            <form onSubmit={processToDeleteForm.handleSubmit(onProcessToDeleteSubmit)} className="space-y-6">
                                <FormField
                                    control={processToDeleteForm.control}
                                    name="id"
                                    render={() => (
                                        <FormItem>
                                            <ScrollArea className="h-36 rounded-sm border px-1 border-white">
                                                {SimulationData.processToDelete.map((process) => (
                                                    <FormField
                                                        key={process.Ready.id}
                                                        control={processToDeleteForm.control}
                                                        name="id"
                                                        render={({ field }) => {
                                                            const currentValue = Array.isArray(field.value) ? field.value : [];
                                                            return (
                                                                <div key={process.Ready.id} className="flex flex-row items-center m-2">
                                                                    <FormItem
                                                                        className="flex flex-row items-start space-x-3 space-y-0 grow"
                                                                    >
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={currentValue.some(process => process.id === process.id)}
                                                                                // onCheckedChange={(checked) => {
                                                                                //     console.log("checked", checked);
                                                                                //     return checked
                                                                                //         ? field.onChange([...currentValue, {
                                                                                //             id: process.Ready.id,
                                                                                //         }
                                                                                //         ])
                                                                                //         : field.onChange(currentValue.filter((value) => value.id !== process.Ready.id));
                                                                                // }}
                                                                                // onChange={(e) => {
                                                                                //     // const value = e.target.value;
                                                                                //     // const index = currentValue.findIndex(resource => resource.id === item.id);
                                                                                //     // const newResources = [...currentValue];
                                                                                //     // newResources[index] = { id: item.id, totalAmount: parseInt(value) };
                                                                                //     // field.onChange(newResources);

                                                                                //     console.log("e", e);
                                                                                // }}

                                                                                onCheckedChange={(checked) => {
                                                                                    return checked
                                                                                        ? field.onChange([...currentValue, { id: process.Ready.id }])
                                                                                        : field.onChange(currentValue.filter((value) => value.id !== process.Ready.id));
                                                                                }}


                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="text-sm font-normal flex flex-row gap-2">
                                                                            <p>


                                                                                {
                                                                                    // Find the process in the processes array with the same id
                                                                                    SimulationData.processes.find((p) => p.Ready.id === process.Ready.id)?.Ready.name
                                                                                }
                                                                            </p>
                                                                            <p>
                                                                                ({
                                                                                    process.Ready.id
                                                                                })
                                                                            </p>
                                                                        </FormLabel>
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
                                <DialogFooter className="grid grid-cols-2">
                                    <Button type="submit" variant="destructive">Continuar (inseguro)</Button>
                                    <Button type="submit">Eliminar procesos</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
