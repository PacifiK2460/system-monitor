"use client"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { SimulationContext } from "@/app/simulationContext"
import { useContext } from "react"
import { Badge } from "@/components/ui/badge"


export default function ResourcePage() {
    const SimulationData = useContext(SimulationContext)

    const resource = SimulationData.resourceToView;

    if (!resource) {
        return <div>Resource not found</div>
    }

    return (
        <div className="font-[family-name:var(--font-geist-sans)] mx-5">
            <h1 className="text-2xl font-bold m-2">{resource.name}</h1>
            <div className="gap-x-2 text-2xl font-bold m-2">
                <Badge variant={"default"} >{resource.total_amount} MB</Badge>
                <Badge variant={"outline"} >{resource.id}</Badge>
            </div>
            <Table>
                <TableCaption>Listado de todos los procesos de {resource.name}.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="first:w-[100px] last:text-right">Nombre</TableHead>
                        <TableHead className="first:w-[100px] last:text-right">Memoria</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        // SimulationData.processes.Ready.resource_slot.map((resource_slot) => {
                        //     const resource = SimulationData.resources.find((resource) => resource.id === resource_slot.resource_id)
                        //     return (
                        //         <TableRow key={resource_slot.resource_id}>
                        //             <TableCell className="first:font-medium last:text-right">{resource?.name}</TableCell>
                        //             <TableCell className="first:font-medium last:text-right">{resource_slot.current_amount} MB</TableCell>
                        //         </TableRow>
                        //     )
                        // })
                        SimulationData.processes.map((process) => {
                            return process.Ready.resource_slot.map((resource_slot) => {
                                if (resource_slot.resource_id === resource.id) {
                                    return (
                                        <TableRow key={resource_slot.resource_id}>
                                            <TableCell className="first:font-medium last:text-right">{process.Ready.name}</TableCell>
                                            <TableCell className="first:font-medium last:text-right">{resource_slot.current_amount} MB</TableCell>
                                        </TableRow>
                                    )
                                }
                            })
                        })
                    }

                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell>Total</TableCell>
                        <TableCell className="last:text-right">
                            {
                                SimulationData.processes.reduce((acc, process) => {
                                    return acc + process.Ready.resource_slot.reduce((acc, resource_slot) => {
                                        return resource_slot.resource_id === resource.id ? acc + resource_slot.current_amount : acc
                                    }, 0)
                                }, 0)
                            }
                            MB</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div >
    )
}