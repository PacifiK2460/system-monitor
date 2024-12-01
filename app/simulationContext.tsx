"use client"

import { Process, Resource } from "@/lib/defs";
import { invoke } from "@tauri-apps/api/core";
import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { EventCallback, EventName, UnlistenFn } from '@tauri-apps/api/event';

type SimulationData = {
  processes: Process[];
  resources: Resource[];
  simulationSpeed: number;
  simulationState: "stopped" | "running";

  processToDelete: Process[];
  updateProcessesToDelete: (newProcesses: Process[]) => void;

  updateProcesses: (newProcesses: Process[]) => void;
  updateResources: (newResources: Resource[]) => void;
  updateSimulationSpeed: (newSpeed: number) => void;
  updateSimulationState: (newState: "stopped" | "running") => void;

  listen: <T>(event: EventName, handler: EventCallback<T>) => Promise<UnlistenFn>;

  processToView: Process | null;
  resourceToView: Resource | null;
  setProcessToView: (process: Process) => void;
  setResourceToView: (resource: Resource) => void;
};

interface SimulationProviderProps {
  children: ReactNode;
}

export const SimulationContext = createContext<SimulationData>({
  processes: [],
  resources: [],
  simulationSpeed: 1,
  simulationState: "running",
  processToDelete: [],
  updateProcessesToDelete: () => { },
  updateProcesses: () => { },
  updateResources: () => { },
  updateSimulationSpeed: () => { },
  updateSimulationState: () => { },

  listen: async () => { return () => { } },

  processToView: null,
  resourceToView: null,
  setProcessToView: () => { },
  setResourceToView: () => { },
})

export const SimulationProvider = ({ children }: SimulationProviderProps) => {
  const [simulationData, setSimulationData] = useState<SimulationData>({
    processes: [],
    resources: [],
    simulationSpeed: 1,
    simulationState: "running",
    processToDelete: [],
    updateProcessesToDelete: () => { },
    updateProcesses: () => { },
    updateResources: () => { },
    updateSimulationSpeed: () => { },
    updateSimulationState: () => { },

    listen: async () => { return () => { } },

    processToView: null,
    resourceToView: null,
    setProcessToView: () => { },
    setResourceToView: () => { },
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

  const updatePorcessToDelete = useCallback((newProcesses: Process[]) => {
    setSimulationData((prev) => ({
      ...prev,
      processToDelete: newProcesses,
    }));
  }, []);

  const setProcessToView = useCallback((process: Process) => {
    setSimulationData((prev) => ({
      ...prev,
      processToView: process,
    }));
  }, []);

  const setResourceToView = useCallback((resource: Resource) => {
    setSimulationData((prev) => ({
      ...prev,
      resourceToView: resource,
    }));
  }, []);

  async function setupListen() {
    const listen = (await import('@tauri-apps/api/event')).listen
    setSimulationData((prev) => ({
      ...prev,
      listen: listen,
    }));
  }

  const simulationDataValue = useMemo(() => ({
    processes: simulationData.processes,
    resources: simulationData.resources,
    simulationSpeed: simulationData.simulationSpeed,
    simulationState: simulationData.simulationState,
    processToDelete: simulationData.processToDelete,
    updateProcessesToDelete: updatePorcessToDelete,
    updateProcesses,
    updateResources,
    updateSimulationSpeed,
    updateSimulationState,
    listen: simulationData.listen,
    setProcessToView,
    setResourceToView,
    processToView: simulationData.processToView,
    resourceToView: simulationData.resourceToView,
  }), [setProcessToView, setResourceToView, simulationData.listen, simulationData.processToDelete, simulationData.processToView, simulationData.processes, simulationData.resourceToView, simulationData.resources, simulationData.simulationSpeed, simulationData.simulationState, updatePorcessToDelete, updateProcesses, updateResources, updateSimulationSpeed, updateSimulationState]);

  useEffect(() => {
    invoke("simulation_resources")
      .then((res) => {
        simulationDataValue.updateResources(res as Resource[])
      })
      .catch((error) => {
        console.error("Error getting resources", error)
      })

    invoke("simulation_processes")
      .then((pros) => {
        simulationDataValue.updateProcesses(pros as Process[])
      })
      .catch((error) => {
        console.error("Error getting processes", error)
      })

    setupListen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    invoke("simulation_set_simulation_speed", { speed: simulationData.simulationSpeed })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationData.simulationSpeed])

  simulationDataValue.listen<string[]>("unsafe_state", (event) => {
    const _processes: string[] = event.payload;

    // Search for the processes with the ids inside the _processes array
    const processes: Process[] = simulationDataValue.processes.filter((process) => {
      return _processes.includes(process.Ready.id);
    });

    console.log("unsafe_state", event.payload)

    simulationDataValue.updateProcessesToDelete(processes);
    simulationDataValue.updateSimulationSpeed(0);
    simulationDataValue.updateSimulationState("stopped");
  })

  simulationDataValue.listen<Process[]>("processes", (event) => {
    simulationDataValue.updateProcesses(event.payload);
  })

  return (
    <SimulationContext.Provider value={simulationDataValue}>
      {children}
    </SimulationContext.Provider>
  );
}

