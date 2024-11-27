#![allow(unused_imports, unused_variables, dead_code, unreachable_code)]
use crate::generic_process::{Process, ProcessStates};
use crate::{generic_process::GenericProcessResourceIntensity, generic_resource::GenericResource};
use crate::{AllProcessTraits, ReadyProcess, TauriSim};
use std::os::windows::process;
use std::sync::mpsc::channel;
use std::{
    sync::{Arc, Mutex},
    thread,
    time::{Duration, Instant},
};
use tauri::State;
use tauri::{Builder, GlobalWindowEvent, Manager};

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

    fn add_resource(&mut self, resource: GenericResource);
    fn remove_resource(&mut self, resource: &GenericResource);
    fn resources(&self) -> Arc<Mutex<Vec<GenericResource>>>;

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
    sim.0.add_process(new_process);
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
    sim.0.add_resource(resource);
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

impl RunningSimulation {
    // pub fn stop(self) -> StoppedSimulation  {
    //     self.tx.send(()).unwrap();
    //     StoppedSimulation {
    //         simulation_speed: self.last_simulation_speed,
    //         last_simulation_speed: Arc::new(Mutex::new(0)),
    //         processes: Arc::clone(&self.processes),
    //         resources: Arc::clone(&self.resources),
    //     }
    // }
    pub fn start(&self) {
        // Run the simulation in a separate thread
        let simulation_speed_clone = self.simulation_speed.clone();
        let resources_clone = self.resources.clone();
        let processes_clone = self.processes.clone();

        thread::spawn(move || {
            let mut last_update = Instant::now();
            loop {
                let simulation_speed = simulation_speed_clone.lock().unwrap();
                let resources = resources_clone.lock().unwrap();
                let processes = processes_clone.lock().unwrap();

                println!("Resources: {:?}", resources.len());
                println!("Processes: {:?}", processes.len());

                drop(simulation_speed);
                drop(resources);
                drop(processes);

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
            }
        });
    }

    pub fn stop(&self) {
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
    sim.0.stop();
}

#[tauri::command]
pub fn start_simulation(app_handle: tauri::AppHandle) {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let sim = state.lock().unwrap();
    sim.0.start();
}

// remember to call `.manage(MyState::default())`
// #[tauri::command]
// pub fn initialize_simulation(app_handle: tauri::AppHandle) {
//     let state = app_handle.state::<Mutex<TauriSim>>();
//     let mut sim = state.lock().unwrap();
//     sim.0 = Simulation::Stopped(Simulation::new());
// }
