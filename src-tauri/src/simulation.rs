#![allow(unused_imports, unused_variables, dead_code, unreachable_code)]
use crate::generic_process::{Process, ProcessStates};
use crate::{generic_process::GenericProcessResourceIntensity, generic_resource::GenericResource};
use crate::{AllProcessTraits, ReadyProcess, TauriSim};
use std::borrow::BorrowMut;
use std::os::windows::process;
use std::sync::mpsc::channel;
use std::{
    sync::{Arc, Mutex},
    thread,
    time::{Duration, Instant},
};
use tauri::{AppHandle, Emitter};
use tauri::{Builder, Manager};

extern crate nalgebra as na;

pub struct _Simulation {
    simulation_speed: Arc<Mutex<u64>>,
    last_simulation_speed: Arc<Mutex<u64>>,
    processes: Arc<Mutex<Vec<ProcessStates>>>,
    resources: Arc<Mutex<Vec<GenericResource>>>,
    tx: std::sync::mpsc::Sender<()>,
    rx: std::sync::mpsc::Receiver<()>,
}

#[derive(Clone)]
pub struct RunningSimulation {
    simulation_speed: Arc<Mutex<u64>>,
    last_simulation_speed: Arc<Mutex<u64>>,
    processes: Arc<Mutex<Vec<ProcessStates>>>,
    resources: Arc<Mutex<Vec<GenericResource>>>,
    tx: std::sync::mpsc::Sender<()>,
}

impl RunningSimulation {
    pub fn new() -> Self {
        let (tx, rx) = channel();
        RunningSimulation {
            simulation_speed: Arc::new(Mutex::new(60)),
            last_simulation_speed: Arc::new(Mutex::new(0)),
            processes: Arc::new(Mutex::new(vec![])),
            resources: Arc::new(Mutex::new(vec![])),
            tx,
        }
    }
}

#[derive(Clone)]
pub struct StoppedSimulation {
    simulation_speed: Arc<Mutex<u64>>,
    last_simulation_speed: Arc<Mutex<u64>>,
    processes: Arc<Mutex<Vec<ProcessStates>>>,
    resources: Arc<Mutex<Vec<GenericResource>>>,
}

pub enum Simulation {
    Running(RunningSimulation),
    Stopped(StoppedSimulation),
}

impl Simulation {
    pub fn new() -> StoppedSimulation {
        StoppedSimulation {
            simulation_speed: Arc::new(Mutex::new(60)),
            last_simulation_speed: Arc::new(Mutex::new(0)),
            processes: Arc::new(Mutex::new(vec![])),
            resources: Arc::new(Mutex::new(vec![])),
        }
    }
}

pub trait AllSimulationTrait {
    fn add_process(&mut self, process: ProcessStates);
    fn remove_process(&mut self, process: &ProcessStates);
    fn processes(&self) -> Arc<Mutex<Vec<ProcessStates>>>;
    fn get_process_by_id(&self, id: String) -> Option<ProcessStates>;

    fn add_resource(&mut self, resource: GenericResource);
    fn remove_resource(&mut self, resource: &GenericResource);
    fn resources(&self) -> Arc<Mutex<Vec<GenericResource>>>;
    fn get_resource_by_id(&self, id: String) -> Option<GenericResource>;

    fn set_simulation_speed(&mut self, speed: u64);
    fn simulation_speed(&self) -> Arc<Mutex<u64>>;
}

impl AllSimulationTrait for Simulation {
    fn add_process(&mut self, process: ProcessStates) {
        match self {
            Simulation::Running(sim) => sim.add_process(process),
            Simulation::Stopped(sim) => sim.add_process(process),
        }
    }

    fn remove_process(&mut self, process: &ProcessStates) {
        match self {
            Simulation::Running(sim) => sim.remove_process(process),
            Simulation::Stopped(sim) => sim.remove_process(process),
        }
    }

    fn processes(&self) -> Arc<Mutex<Vec<ProcessStates>>> {
        match self {
            Simulation::Running(sim) => sim.processes(),
            Simulation::Stopped(sim) => sim.processes(),
        }
    }

    fn add_resource(&mut self, resource: GenericResource) {
        match self {
            Simulation::Running(sim) => sim.add_resource(resource),
            Simulation::Stopped(sim) => sim.add_resource(resource),
        }
    }

    fn remove_resource(&mut self, resource: &GenericResource) {
        match self {
            Simulation::Running(sim) => sim.remove_resource(resource),
            Simulation::Stopped(sim) => sim.remove_resource(resource),
        }
    }

    fn resources(&self) -> Arc<Mutex<Vec<GenericResource>>> {
        match self {
            Simulation::Running(sim) => sim.resources(),
            Simulation::Stopped(sim) => sim.resources(),
        }
    }

    fn set_simulation_speed(&mut self, speed: u64) {
        match self {
            Simulation::Running(sim) => sim.set_simulation_speed(speed),
            Simulation::Stopped(sim) => sim.set_simulation_speed(speed),
        }
    }

    fn simulation_speed(&self) -> Arc<Mutex<u64>> {
        match self {
            Simulation::Running(sim) => sim.simulation_speed(),
            Simulation::Stopped(sim) => sim.simulation_speed(),
        }
    }

    fn get_process_by_id(&self, id: String) -> Option<ProcessStates> {
        let binding = self.processes();
        let processes = binding.lock().unwrap();
        let process = processes.iter().find(|p| match p {
            ProcessStates::Ready(ready_process) => ready_process.id() == id,
            ProcessStates::Blocked(blocked_process) => blocked_process.id() == id,
            ProcessStates::Working(working_process) => working_process.id() == id,
        });
        process.cloned()
    }

    fn get_resource_by_id(&self, id: String) -> Option<GenericResource> {
        let binding = self.resources();
        let resources = binding.lock().unwrap();
        let resource = resources.iter().find(|r| r.id() == id);
        resource.cloned()
    }
}

// impl  AllSimulationTrait  for _Simulation  {
//     fn add_process(&mut self, process: ProcessStates ) {
//         self.processes().lock().unwrap().push(process);
//     }
//     fn processes(&self) -> Arc<Mutex<Vec<ProcessStates >>> {
//         Arc::clone(&self.processes)
//     }
//     fn add_resource(&mut self, resource: GenericResource) {
//         self.resources().lock().unwrap().push(resource);
//     }
//     fn resources(&self) -> Arc<Mutex<Vec<GenericResource>>> {
//         Arc::clone(&self.resources)
//     }
//     fn set_simulation_speed(&mut self, speed: u64) {
//         let mut simulation_speed = self.simulation_speed();
//         let mut simulation_speed = simulation_speed.lock().unwrap();
//         *simulation_speed = speed;
//     }
//     fn simulation_speed(&self) -> Arc<Mutex<u64>> {
//         Arc::clone(&self.simulation_speed)
//     }
//     fn remove_process(&mut self, process: &ProcessStates ) {
//         let index = self
//             .processes()
//             .lock()
//             .unwrap()
//             .iter()
//             .position(|p| *p == *process);
//         if let Some(index) = index {
//             self.processes().lock().unwrap().remove(index);
//         }
//     }
//     fn remove_resource(&mut self, resource: &GenericResource) {
//         let index = self
//             .resources()
//             .lock()
//             .unwrap()
//             .iter()
//             .position(|r| *r == *resource);
//         if let Some(index) = index {
//             self.resources().lock().unwrap().remove(index);
//         }
//     }
// }

macro_rules! impl_AllSimulationTrait {
    (for $($t:ty),+) => {
        $(impl  AllSimulationTrait  for $t {
            fn add_process(&mut self, process: ProcessStates) {
                self.processes().lock().unwrap().push(process);
            }
            fn processes(&self) -> Arc<Mutex<Vec<ProcessStates>>> {
                Arc::clone(&self.processes)
            }
            fn add_resource(&mut self, resource: GenericResource) {
                self.resources().lock().unwrap().push(resource);
            }
            fn resources(&self) -> Arc<Mutex<Vec<GenericResource>>> {
                Arc::clone(&self.resources)
            }
            fn set_simulation_speed(&mut self, speed: u64) {
                let simulation_speed = self.simulation_speed();
                let mut simulation_speed = simulation_speed.lock().unwrap();
                *simulation_speed = speed;
            }
            fn simulation_speed(&self) -> Arc<Mutex<u64>> {
                Arc::clone(&self.simulation_speed)
            }

            fn remove_process(&mut self, process: &ProcessStates) {
                let index = self
                    .processes()
                    .lock()
                    .unwrap()
                    .iter()
                    .position(|p| *p == *process);

                if let Some(index) = index {
                    self.processes().lock().unwrap().remove(index);
                }
            }

            fn remove_resource(&mut self, resource: &GenericResource) {
                let index = self
                    .resources()
                    .lock()
                    .unwrap()
                    .iter()
                    .position(|r| *r == *resource);

                if let Some(index) = index {
                    self.resources().lock().unwrap().remove(index);
                }
            }

            fn get_process_by_id(&self, id: String) -> Option<ProcessStates> {
                let binding = self.processes();
                let processes = binding.lock().unwrap();
                let process = processes.iter().find(|p| match p {
                    ProcessStates::Ready(ready_process) => ready_process.id() == id,
                    ProcessStates::Blocked(blocked_process) => blocked_process.id() == id,
                    ProcessStates::Working(working_process) => working_process.id() == id,
                });
                process.cloned()
            }

            fn get_resource_by_id(&self, id: String) -> Option<GenericResource> {
                let binding = self.resources();
                let resources = binding.lock().unwrap();
                let resource = resources.iter().find(|r| r.id() == id);
                resource.cloned()
            }

        })*
    }
}

impl_AllSimulationTrait!(for _Simulation , RunningSimulation , StoppedSimulation );

#[tauri::command]
pub fn simulation_add_process(
    app_handle: tauri::AppHandle,
    name: String,
    resource_intensity: GenericProcessResourceIntensity,
) {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let new_process = Process::new(name, resource_intensity);
    let new_process = ProcessStates::Ready(new_process);

    let mut sim = state.lock().unwrap();
    sim.0.add_process(new_process.clone());
}

#[tauri::command]
pub fn simulation_processes(app_handle: tauri::AppHandle) -> Vec<ProcessStates> {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let sim = state.lock().unwrap();
    let sim = &sim.0;

    let binding = sim.processes();
    let processes = binding.lock().unwrap();
    processes.clone()
}

#[tauri::command]
pub fn simulation_add_resource(app_handle: tauri::AppHandle, resource: GenericResource) {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let mut sim = state.lock().unwrap();
    sim.0.add_resource(resource.clone());
}

#[tauri::command]
pub fn simulation_remove_process(app_handle: tauri::AppHandle, process_id: String) {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let mut sim = state.lock().unwrap();

    let process = match sim.0.get_process_by_id(process_id) {
        Some(p) => p,
        None => return,
    };

    sim.0.remove_process(&process);
}

#[tauri::command]
pub fn simulation_remove_resource(app_handle: tauri::AppHandle, resource_id: String) {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let mut sim = state.lock().unwrap();
    let resource = match sim.0.get_resource_by_id(resource_id) {
        Some(r) => r,
        None => return,
    };
    sim.0.remove_resource(&resource);
}

#[tauri::command]
pub fn simulation_resources(app_handle: tauri::AppHandle) -> Vec<GenericResource> {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let sim = state.lock().unwrap();
    let sim = &sim.0;

    let binding = sim.resources();
    let resources = binding.lock().unwrap();
    resources.clone()
}

#[tauri::command]
pub fn simulation_set_simulation_speed(app_handle: tauri::AppHandle, speed: u64) {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let mut sim = state.lock().unwrap();
    sim.0.set_simulation_speed(speed);
}

#[tauri::command]
pub fn simulation_speed(app_handle: tauri::AppHandle) -> u64 {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let sim = state.lock().unwrap();
    let sim = &sim.0;

    let binding = sim.simulation_speed();
    let simulation_speed = binding.lock().unwrap();

    *simulation_speed
}

fn safe_to_continue(processes: Vec<ProcessStates>, resources: Vec<GenericResource>) -> bool {
    if processes.len() == 0 {
        return true;
    }

    let mut resource_vector = na::DVector::<u64>::zeros(resources.len());
    let mut process_requests = na::DMatrix::<u64>::zeros(processes.len(), resources.len());
    for (i, process) in processes.iter().enumerate() {
        match process {
            ProcessStates::Ready(ready_process) => {
                for (j, resource) in resources.iter().enumerate() {
                    process_requests[(i, j)] = match ready_process
                        .resource_slot()
                        .iter()
                        .find(|r| r.resource_id() == resource.id())
                    {
                        Some(r) => r.current_amount(),
                        None => 0,
                    };
                }
            }
            _ => continue,
        }
    }

    for (i, resource) in resources.iter().enumerate() {
        resource_vector[i] = resource.total_amount();
    }

    // El estado es seguro si podemos liberar todos los procesos
    // Intentamos indefinidamente liberar procesos hasta que no podamos liberar más.
    // Numero de filas restantes debe de ser menor con cada iteración.

    let mut processes_to_free = processes.len();

    loop {
        // Si cualquier prceoso puede ser liberado, entonces lo liberamos y reintentamos con los demás procesos.
        let process_freed = (0..processes_to_free).any(|process_index| {
            // Verificamos si el proceso puede ser liberado.
            let can_free_process = (0..resources.len()).all(|resource_index| {
                process_requests[(process_index, resource_index)] <= resource_vector[resource_index]
            });

            // Si el proceso puede ser liberado, entonces lo liberamos.
            if can_free_process {
                process_requests = process_requests.clone().remove_row(process_index);
                processes_to_free -= 1;
            }

            can_free_process
        });

        // Si ningun proceso puede ser liberado, entonces no es seguro continuar.
        if !process_freed {
            return false;
        }

        // Si todos los procesos han sido liberados, entonces es seguro continuar.
        if processes_to_free == 0 {
            return true;
        }
    }
}

impl RunningSimulation {
    pub fn start(&self, _app: &AppHandle) {
        // Run the simulation in a separate thread
        let simulation_speed_clone = self.simulation_speed.clone();
        let last_simulation_speed_clone = self.last_simulation_speed.clone();
        let resources_clone = self.resources.clone();
        let processes_clone = self.processes.clone();

        let app = _app.clone();

        thread::spawn(move || {
            let mut last_update = Instant::now();
            loop {
                // Check for the time lapse
                loop {
                    let simulation_speed = simulation_speed_clone.lock().unwrap();
                    let elapsed = last_update.elapsed().as_secs_f64();
                    let div = (1.0 / *simulation_speed as f64) as f64;
                    if *simulation_speed == 0 || (elapsed <= div) {
                        thread::sleep(Duration::from_micros(1));
                    } else {
                        last_update = Instant::now();
                        break;
                    }
                    drop(simulation_speed);
                }

                let mut simulation_speed = simulation_speed_clone.lock().unwrap();
                let mut last_simulation_speed = last_simulation_speed_clone.lock().unwrap();
                let resources = resources_clone.lock().unwrap();
                let processes = processes_clone.lock().unwrap();

                // Check if it is safe to continue
                if !safe_to_continue(processes.clone(), resources.clone()) {
                    /*
                        If it is not safe to continue:
                        Try the simulation by adding one process at a time, if it is not safe
                        to continue (with this new set of processes), mark the process for deletion.
                        Continue with the next process.
                    */
                    let mut processes_to_delete = vec![];
                    let mut safe_processes = vec![];
                    for process in processes.iter() {
                        match process {
                            ProcessStates::Ready(ready_process) => {
                                let mut processes_to_try = safe_processes.clone();
                                processes_to_try.push(ready_process.clone());

                                // Wrap all process to a process ready state
                                let _processes_to_try = processes_to_try
                                    .iter()
                                    .map(|p| ProcessStates::Ready(p.clone()))
                                    .collect::<Vec<ProcessStates>>();

                                if safe_to_continue(_processes_to_try, resources.clone()) {
                                    safe_processes.push(ready_process.clone());
                                } else {
                                    processes_to_delete.push(ready_process.clone().id());
                                }
                            }
                            _ => continue,
                        }
                    }

                    match app.emit::<Vec<String>>("unsafe_state", processes_to_delete) {
                        Ok(_) => {
                            println!("Emitted unsafe_state");
                        }
                        Err(e) => {
                            println!("Error: {}", e);
                        }
                    }

                    let temp = *simulation_speed;
                    *simulation_speed = 0;
                    *last_simulation_speed = temp;

                    match app.emit("simulation_stopped", 0) {
                        Ok(_) => {
                            println!("Emitted simulation_stopped");
                        }
                        Err(e) => {
                            println!("Error: {}", e);
                        }
                    }
                } else {
                    drop(simulation_speed);
                    drop(resources);
                    drop(processes);
                }
            }
        });
    }

    pub fn stop(&self, _app: &AppHandle) {
        let mut simulation_speed = self.simulation_speed.lock().unwrap();
        let mut last_simulation_speed = self.last_simulation_speed.lock().unwrap();

        let temp = *simulation_speed;

        *simulation_speed = 0;
        *last_simulation_speed = temp;
    }
}
#[tauri::command]
pub fn stop_simulation(app_handle: tauri::AppHandle) {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let sim = state.lock().unwrap();
    sim.0.stop(&app_handle);
}

#[tauri::command]
pub fn start_simulation(app_handle: tauri::AppHandle) {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let sim = state.lock().unwrap();
    sim.0.start(&app_handle);
}

// remember to call `.manage(MyState::default())`
// #[tauri::command]
// pub fn initialize_simulation(app_handle: tauri::AppHandle) {
//     let state = app_handle.state::<Mutex<TauriSim>>();
//     let mut sim = state.lock().unwrap();
//     sim.0 = Simulation::Stopped(Simulation::new());
// }
