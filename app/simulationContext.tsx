"use client"

import { Process, Resource } from "@/lib/defs";
import { invoke } from "@tauri-apps/api/tauri";
import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
type SimulationData = {
  processes: Process[];
  resources: Resource[];
  simulationSpeed: number;
  simulationState: "stopped" | "running";

  updateProcesses: (newProcesses: Process[]) => void;
  updateResources: (newResources: Resource[]) => void;
  updateSimulationSpeed: (newSpeed: number) => void;
  updateSimulationState: (newState: "stopped" | "running") => void;
};

interface SimulationProviderProps {
  children: ReactNode;
}

export const SimulationContext = createContext<SimulationData>({
  processes: [],
  resources: [],
  simulationSpeed: 1,
  simulationState: "running",
  updateProcesses: () => { },
  updateResources: () => { },
  updateSimulationSpeed: () => { },
  updateSimulationState: () => { },
})

export const SimulationProvider = ({ children }: SimulationProviderProps) => {
  const [simulationData, setSimulationData] = useState<SimulationData>({
    processes: [],
    resources: [],
    simulationSpeed: 1,
    simulationState: "running",
    updateProcesses: () => { },
    updateResources: () => { },
    updateSimulationSpeed: () => { },
    updateSimulationState: () => { },
  });

  const updateProcesses = useCallback((newProcesses: Process[]) => {
    setSimulationData((prev) => ({
      ...prev,
      processes: newProcesses,
    }));
  }, []);

  const updateResources = useCallback((newResources: Resource[]) => {
    setSimulationData((prev) => ({
      ...prev,
      resources: newResources,
    }));
  }, []);

  const updateSimulationSpeed = useCallback((newSpeed: number) => {
    setSimulationData((prev) => ({
      ...prev,
      simulationSpeed: newSpeed,
    }));
  }, []);

  const updateSimulationState = useCallback((newState: "stopped" | "running") => {
    switch (newState) {
      case "stopped":
        invoke("stop_simulation")
        break;
      case "running":
        invoke("start_simulation")
        break;
    }

    setSimulationData((prev) => ({
      ...prev,
      simulationState: newState,
    }));
  }, []);

  const simulationDataValue = useMemo(() => ({
    processes: simulationData.processes,
    resources: simulationData.resources,
    simulationSpeed: simulationData.simulationSpeed,
    simulationState: simulationData.simulationState,
    updateProcesses,
    updateResources,
    updateSimulationSpeed,
    updateSimulationState,
  }), [simulationData.processes, simulationData.resources, simulationData.simulationSpeed, simulationData.simulationState, updateProcesses, updateResources, updateSimulationSpeed, updateSimulationState]);

  useEffect(() => {
    invoke("simulation_resources")
      .then((res) => {
        updateResources(res as Resource[])
      })
      .catch((error) => {
        console.error("Error getting resources", error)
      })

    invoke("simulation_processes")
      .then((pros) => {
        updateProcesses(pros as Process[])
      })
      .catch((error) => {
        console.error("Error getting processes", error)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    invoke("simulation_set_simulation_speed", { speed: simulationData.simulationSpeed })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationData.simulationSpeed])

  return (
    <SimulationContext.Provider value={simulationDataValue}>
      {children}
    </SimulationContext.Provider>
  );
}

