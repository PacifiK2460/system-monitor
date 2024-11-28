"use client"

import React from 'react';

import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SimulationContext } from "@/app/simulationContext"
import { useContext } from "react"

export default function Home() {
  const SimulationData = useContext(SimulationContext)

  return (
    <div className="font-[family-name:var(--font-geist-sans)] mx-5">
      <h1 className="text-2xl font-bold m-2">Recursos & Recursos del Sistema</h1>
      <Table>
        <TableCaption>Listado de todos los recursos.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="first:w-[100px] last:text-right">Nombre</TableHead>
            {
              SimulationData.resources.map((resource) => (
                <TableHead key={resource.id} className="first:w-[100px] last:text-right">{resource.name}</TableHead>
              ))
            }
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            SimulationData.processes.map((process) => (
              <TableRow key={process.Ready.id}>
                <TableCell key={process.Ready.id} className="first:font-medium last:text-right">{process.Ready.name}</TableCell>
                {
                  // Show the  Process Resource usage, if the process is not using the resource show 0
                  SimulationData.resources.map((resource) => {
                    const resource_in_process = process.Ready.resource_slot.find((resource_slot) => resource_slot.resource_id === resource.id) || { current_amount: 0 }

                    return (
                      <TableCell key={resource.id} className="first:font-medium last:text-right">{resource_in_process.current_amount} MB</TableCell>
                    )
                  })
                }
              </TableRow>
            ))
          }

        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            {
              SimulationData.resources.map((resource) => (
                // Iterate over all processes and sum the resource usage of the current resource

                <TableCell key={resource.id} className="first:font-medium last:text-right">
                  {SimulationData.processes.reduce((acc, process) => {
                    const resource_in_process = process.Ready.resource_slot.find((resource_slot) => resource_slot.resource_id === resource.id) || { current_amount: 0 }
                    return acc + resource_in_process.current_amount
                  }, 0)} MB
                </TableCell>

              ))
            }
          </TableRow>
        </TableFooter>
      </Table>

    </div>
  );
}
