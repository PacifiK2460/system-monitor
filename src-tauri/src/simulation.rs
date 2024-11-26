#![allow(unused_imports, unused_variables, dead_code, unreachable_code)]
use crate::generic_process::{Process, ProcessStates};
use crate::{generic_process::GenericProcessResourceIntensity, generic_resource::GenericResource};
use crate::{AllProcessTraits, TauriSim};
use std::sync::mpsc::channel;
use std::{
    sync::{Arc, Mutex},
    thread,
    time::{Duration, Instant},
};
use tauri::State;
use tauri::{Builder, GlobalWindowEvent, Manager};

pub struct _Simulation<'a> {
    simulation_speed: Arc<Mutex<u64>>,
    last_simulation_speed: Arc<Mutex<u64>>,
    processes: Arc<Mutex<Vec<ProcessStates<'a>>>>,
    resources: Arc<Mutex<Vec<GenericResource>>>,
    tx: std::sync::mpsc::Sender<()>,
    rx: std::sync::mpsc::Receiver<()>,
}

#[derive(Clone)]
pub struct RunningSimulation<'a> {
    simulation_speed: Arc<Mutex<u64>>,
    last_simulation_speed: Arc<Mutex<u64>>,
    processes: Arc<Mutex<Vec<ProcessStates<'a>>>>,
    resources: Arc<Mutex<Vec<GenericResource>>>,
    tx: std::sync::mpsc::Sender<()>,
}

#[derive(Clone)]
pub struct StoppedSimulation<'a> {
    simulation_speed: Arc<Mutex<u64>>,
    last_simulation_speed: Arc<Mutex<u64>>,
    processes: Arc<Mutex<Vec<ProcessStates<'a>>>>,
    resources: Arc<Mutex<Vec<GenericResource>>>,
}

pub enum Simulation<'a> {
    Running(RunningSimulation<'a>),
    Stopped(StoppedSimulation<'a>),
}

impl<'a> Simulation<'a> {
    pub fn new() -> StoppedSimulation<'a> {
        StoppedSimulation {
            simulation_speed: Arc::new(Mutex::new(60)),
            last_simulation_speed: Arc::new(Mutex::new(0)),
            processes: Arc::new(Mutex::new(vec![])),
            resources: Arc::new(Mutex::new(vec![])),
        }
    }
}

pub trait AllSimulationTrait<'a> {
    fn add_process(&mut self, process: ProcessStates<'a>);
    fn remove_process(&mut self, process: &ProcessStates<'a>);
    fn processes(&self) -> Arc<Mutex<Vec<ProcessStates<'a>>>>;

    fn add_resource(&mut self, resource: GenericResource);
    fn remove_resource(&mut self, resource: &GenericResource);
    fn resources(&self) -> Arc<Mutex<Vec<GenericResource>>>;

    fn set_simulation_speed(&mut self, speed: u64);
    fn simulation_speed(&self) -> Arc<Mutex<u64>>;
}

impl<'a> AllSimulationTrait<'a> for Simulation<'a> {
    fn add_process(&mut self, process: ProcessStates<'a>) {
        match self {
            Simulation::Running(sim) => sim.add_process(process),
            Simulation::Stopped(sim) => sim.add_process(process),
        }
    }

    fn remove_process(&mut self, process: &ProcessStates<'a>) {
        match self {
            Simulation::Running(sim) => sim.remove_process(process),
            Simulation::Stopped(sim) => sim.remove_process(process),
        }
    }

    fn processes(&self) -> Arc<Mutex<Vec<ProcessStates<'a>>>> {
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
}

// impl<'a> AllSimulationTrait<'a> for _Simulation<'a> {
//     fn add_process(&mut self, process: ProcessStates<'a>) {
//         self.processes().lock().unwrap().push(process);
//     }
//     fn processes(&self) -> Arc<Mutex<Vec<ProcessStates<'a>>>> {
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
//     fn remove_process(&mut self, process: &ProcessStates<'a>) {
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
        $(impl<'a> AllSimulationTrait<'a> for $t {
            fn add_process(&mut self, process: ProcessStates<'a>) {
                self.processes().lock().unwrap().push(process);
            }
            fn processes(&self) -> Arc<Mutex<Vec<ProcessStates<'a>>>> {
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

            fn remove_process(&mut self, process: &ProcessStates<'a>) {
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

        })*
    }
}

impl_AllSimulationTrait!(for _Simulation<'a>, RunningSimulation<'a>, StoppedSimulation<'a>);

#[tauri::command]
pub fn simulation_add_process<'a>(
    app_handle: tauri::AppHandle,
    name: String,
    resource_intensity: GenericProcessResourceIntensity,
) {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let new_process = Process::new(name, resource_intensity);
    let new_process = ProcessStates::Ready(new_process);

    let mut sim = state.lock().unwrap();
    sim.0.add_process(new_process);
}

#[tauri::command]
pub fn simulation_processes<'a>(app_handle: tauri::AppHandle) -> Vec<String> {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let sim = state.lock().unwrap();
    let sim = &sim.0;

    let binding = sim.processes();
    let processes = binding.lock().unwrap();
    processes
        .iter()
        .map(|p| match p {
            ProcessStates::Ready(ready_process) => ready_process.name(),
            ProcessStates::Blocked(blocked_process) => blocked_process.name(),
            ProcessStates::Working(working_process) => working_process.name(),
        })
        .collect()
}

#[tauri::command]
pub fn simulation_add_resource<'a>(app_handle: tauri::AppHandle, resource: GenericResource) {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let mut sim = state.lock().unwrap();
    sim.0.add_resource(resource);
}

#[tauri::command]
pub fn simulation_resources<'a>(app_handle: tauri::AppHandle) -> Vec<String> {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let sim = state.lock().unwrap();
    let sim = &sim.0;

    let binding = sim.resources();
    let resources = binding.lock().unwrap();
    resources.iter().map(|r| r.name()).collect()
}

#[tauri::command]
pub fn simulation_set_simulation_speed(app_handle: tauri::AppHandle, speed: u64) {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let mut sim = state.lock().unwrap();
    sim.0.set_simulation_speed(speed);
}

#[tauri::command]
pub fn simulation_speed<'a>(app_handle: tauri::AppHandle) -> u64 {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let sim = state.lock().unwrap();
    let sim = &sim.0;

    let binding = sim.simulation_speed();
    let simulation_speed = binding.lock().unwrap();
    *simulation_speed
}

impl<'a> RunningSimulation<'a> {
    pub fn stop(self) -> StoppedSimulation<'a> {
        self.tx.send(()).unwrap();
        StoppedSimulation {
            simulation_speed: self.last_simulation_speed,
            last_simulation_speed: Arc::new(Mutex::new(0)),
            processes: Arc::clone(&self.processes),
            resources: Arc::clone(&self.resources),
        }
    }
}

#[tauri::command]
pub fn stop_simulation<'a>(app_handle: tauri::AppHandle) {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let mut sim = state.lock().unwrap();
    let sim = &mut sim.0;
}

impl<'a> StoppedSimulation<'a> {
    pub fn start(self) -> RunningSimulation<'a> {
        let (tx, rx) = channel();

        // Run the simulation in a separate thread
        let simulation_speed_clone = Arc::clone(&self.simulation_speed);
        thread::spawn(move || {
            let last_update = Instant::now();
            loop {
                if let Ok(_) = rx.try_recv() {
                    break;
                }

                let simulation_speed = simulation_speed_clone.lock().unwrap();

                todo!("Simulation logic goes here");

                thread::sleep(Duration::from_millis(1000 / *simulation_speed));
            }
        });

        RunningSimulation {
            simulation_speed: self.last_simulation_speed,
            last_simulation_speed: self.simulation_speed,
            processes: Arc::clone(&self.processes),
            resources: Arc::clone(&self.resources),
            tx,
        }
    }
}

#[tauri::command]
pub fn start_simulation<'a>(app_handle: tauri::AppHandle) {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let mut sim = state.lock().unwrap();
    let sim = &mut sim.0;

    match sim {
        Simulation::Running(_) => {}
        Simulation::Stopped(sim) => {
            sim.clone().start();
        }
    }
}

// remember to call `.manage(MyState::default())`
#[tauri::command]
pub fn initialize_simulation(app_handle: tauri::AppHandle) {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let mut sim = state.lock().unwrap();
    sim.0 = Simulation::Stopped(Simulation::new());
}
