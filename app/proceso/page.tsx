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

export default function ProcessPage() {
    const SimulationData = useContext(SimulationContext)
    const process = SimulationData.processToView;

    if (!process) {
        return <div>Process not found</div>
    }

    return (
        <div className="font-[family-name:var(--font-geist-sans)] mx-5">
            <h1 className="text-2xl font-bold m-2">{process.Ready.name}</h1>
            <div className="gap-x-2 text-2xl font-bold m-2">
                <Badge variant={"default"} >{process.Ready.resource_intensity}</Badge>
                <Badge variant={"outline"} >{process.Ready.id}</Badge>
            </div>
            <Table>
                <TableCaption>Listado de todos los recursos de {process.Ready.name}.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="first:w-[100px] last:text-right">Nombre</TableHead>
                        <TableHead className="first:w-[100px] last:text-right">Memoria</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        process.Ready.resource_slot.map((resource_slot) => {
                            const resource = SimulationData.resources.find((resource) => resource.id === resource_slot.resource_id)
                            return (
                                <TableRow key={resource_slot.resource_id}>
                                    <TableCell className="first:font-medium last:text-right">{resource?.name}</TableCell>
                                    <TableCell className="first:font-medium last:text-right">{resource_slot.current_amount} MB</TableCell>
                                </TableRow>
                            )
                        })
                    }

                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell>Total</TableCell>
                        <TableCell className="last:text-right">
                            {
                                process.Ready.resource_slot.reduce((acc, resource_slot) => {
                                    return acc + resource_slot.current_amount
                                }, 0)
                            }
                            MB</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div >
    )
}