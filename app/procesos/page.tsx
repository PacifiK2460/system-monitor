"use client";

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
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";

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

export default function Home() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
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
    <div className="font-[family-name:var(--font-geist-sans)] mx-5">
      <h1 className="text-2xl font-bold m-2">Procesos</h1>
      <Table>
        <TableCaption>Listado de todos los procesos.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="first:w-[100px] last:text-right">Nombre</TableHead>
            {
              resources.map((resource) => (
                <TableHead key={resource.id} className="first:w-[100px] last:text-right">{resource.name}</TableHead>
              ))
            }
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            processes.map((process) => (
              <TableRow key={process.Ready.id}>
                <TableCell className="first:font-medium last:text-right">{process.Ready.name}</TableCell>
                {
                  // Show the  Process Resource usage, if the process is not using the resource show 0

                  resources.map((resource) => {
                    const resourceUsed = process.Ready.id === resource.id ? process.Ready.intensity : 0
                    return (
                      <TableCell key={resource.id} className="first:font-medium last:text-right">{resourceUsed} MB</TableCell>
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
              resources.map((resource) => (
                <TableCell key={resource.id} className="first:font-medium last:text-right">{resource.totalAmount}MB</TableCell>
              ))
            }
          </TableRow>
        </TableFooter>
      </Table>

    </div>
  );
}
