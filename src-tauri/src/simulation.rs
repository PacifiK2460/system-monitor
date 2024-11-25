use crate::generic_process::{Process, ProcessStates};
use crate::{generic_process::GenericProcessResourceIntensity, generic_resource::GenericResource};
use std::marker::PhantomData;
use std::sync::mpsc::channel;
use std::{
    sync::{Arc, Mutex},
    thread,
    time::{Duration, Instant},
};
use tauri::http::status;
use tauri::State;

pub struct Simulation<'a> {
    simulation_speed: Arc<Mutex<u64>>,
    processes: Arc<Mutex<Vec<ProcessStates<'a>>>>,
    resources: Arc<Mutex<Vec<GenericResource>>>,
    tx: std::sync::mpsc::Sender<()>,
    rx: std::sync::mpsc::Receiver<()>,
}

pub struct RunningSimulation<'a> {
    _marker: PhantomData<&'a ()>,
    simulation_speed: Arc<Mutex<u64>>,
    processes: Arc<Mutex<Vec<ProcessStates<'a>>>>,
    resources: Arc<Mutex<Vec<GenericResource>>>,
    tx: std::sync::mpsc::Sender<()>,
}

pub struct StoppedSimulation<'a> {
    _marker: PhantomData<&'a ()>,
    simulation_speed: Arc<Mutex<u64>>,
    processes: Arc<Mutex<Vec<ProcessStates<'a>>>>,
    resources: Arc<Mutex<Vec<GenericResource>>>,
}

impl<'a> Simulation<'a> {
    pub fn new() -> StoppedSimulation<'a> {
        StoppedSimulation {
            _marker: PhantomData,
            simulation_speed: Arc::new(Mutex::new(1)),
            processes: Arc::new(Mutex::new(vec![])),
            resources: Arc::new(Mutex::new(vec![])),
        }
    }
}

impl std::default::Default for Simulation<'a> {
    
}

// impl `std::default::Default` trait for Process

pub trait AllSimulationTrait<'a> {
    fn add_process(&mut self, process: ProcessStates<'a>);
    fn processes(&self) -> Arc<Mutex<Vec<ProcessStates<'a>>>>;
    fn add_resource(&mut self, resource: GenericResource);
    fn resources(&self) -> Arc<Mutex<Vec<GenericResource>>>;
    fn set_simulation_speed(&mut self, speed: u64);
    fn simulation_speed(&self) -> Arc<Mutex<u64>>;
}

// impl<'a> AllSimulationTrait<'a> for Simulation<'a> {
//     fn add_process(&mut self, process: ProcessStates<'a>) {
//         self.processes().lock().unwrap().push(process);
//     }
//     fn processes(&self) -> Arc<Mutex<Vec<ProcessStates<'a>>>> {
//         Arc::clone(&self.processes)
//     }
//     fn add_resource(&mut self, resource: GenericResource) {
//         self.resources.lock().unwrap().push(resource);
//     }
//     fn resources(&self) -> Arc<Mutex<Vec<GenericResource>>> {
//         Arc::clone(&self.resources)
//     }
//     fn set_simulation_speed(&mut self, speed: u64) {
//         let mut simulation_speed = self.simulation_speed.lock().unwrap();
//         *simulation_speed = speed;
//     }
//     fn simulation_speed(&self) -> Arc<Mutex<u64>> {
//         Arc::clone(&self.simulation_speed)
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
                let mut simulation_speed = self.simulation_speed.lock().unwrap();
                *simulation_speed = speed;
            }

            fn simulation_speed(&self) -> Arc<Mutex<u64>> {
                Arc::clone(&self.simulation_speed)
            }

        })*
    }
}

impl_AllSimulationTrait!(for Simulation<'a>, RunningSimulation<'a>, StoppedSimulation<'a>);

// #[tauri::command]
// pub fn process_remove_resource<'a>(state: State<'_, Mutex<sim>>) -> Option<()> {
// todo!()
// }

// #[tauri::command]
// pub fn process_name<'a>(process: &ProcessStates<'a>) -> String {
//     match process {
//         ProcessStates::Ready(process) => process.name().to_string(),
//         ProcessStates::Blocked(process) => process.name().to_string(),
//         ProcessStates::Working(process) => process.name().to_string(),
//     }
// }

// #[tauri::command]
// pub fn process_resource_intensity<'a>(
//     process: &ProcessStates<'a>,
// ) -> GenericProcessResourceIntensity {
//     match process {
//         ProcessStates::Ready(process) => process.resource_intensity.clone(),
//         ProcessStates::Blocked(process) => process.resource_intensity.clone(),
//         ProcessStates::Working(process) => process.resource_intensity.clone(),
//     }
// }

// #[tauri::command]
// pub fn process_set_name<'a>(process: &mut ProcessStates<'a>, name: String) {
//     match process {
//         ProcessStates::Ready(process) => process.set_name(name),
//         ProcessStates::Blocked(process) => process.set_name(name),
//         ProcessStates::Working(process) => process.set_name(name),
//     }
// }

// #[tauri::command]
// pub fn process_set_resource_intensity<'a>(
//     process: &mut ProcessStates<'a>,
//     resource_intensity: GenericProcessResourceIntensity,
// ) {
//     match process {
//         ProcessStates::Ready(process) => process.set_resource_intensity(resource_intensity),
//         ProcessStates::Blocked(process) => process.set_resource_intensity(resource_intensity),
//         ProcessStates::Working(process) => process.set_resource_intensity(resource_intensity),
//     }
// }

// #[tauri::command]
// pub fn simulation_add_process<'a>(simulation: &mut Simulation<'a>, process: ProcessStates<'a>) {
//     simulation.add_process(process);
// }

// #[tauri::command]
// pub fn simulation_processes<'a>(simulation: &Simulation<'a>) -> Arc<Mutex<Vec<ProcessStates<'a>>>> {
//     simulation.processes()
// }

// #[tauri::command]
// pub fn simulation_add_resource<'a>(simulation: &mut Simulation<'a>, resource: GenericResource) {
//     simulation.add_resource(resource);
// }

// #[tauri::command]
// pub fn simulation_resources<'a>(simulation: &Simulation<'a>) -> Arc<Mutex<Vec<GenericResource>>> {
//     simulation.resources()
// }

// #[tauri::command]
// pub fn set_simulation_speed<'a>(simulation: &mut Simulation<'a>, speed: u64) {
//     simulation.set_simulation_speed(speed);
// }

// #[tauri::command]
// pub fn simulation_speed<'a>(simulation: &Simulation<'a>) -> Arc<Mutex<u64>> {
//     simulation.simulation_speed()
// }

// impl<'a> RunningSimulation<'a> {
//     pub fn stop(self) -> StoppedSimulation<'a> {
//         self.tx.send(()).unwrap();
//         StoppedSimulation {
//             _marker: PhantomData,
//             simulation_speed: self.simulation_speed,
//             processes: Arc::clone(&self.processes),
//             resources: Arc::clone(&self.resources),
//         }
//     }
// }

// #[tauri::command]
// pub fn stop_simulation<'a>(running_simulation: RunningSimulation<'a>) -> StoppedSimulation<'a> {
//     running_simulation.stop()
// }

impl<'a> StoppedSimulation<'a> {
    pub fn start(self) -> RunningSimulation<'a> {
        let (tx, rx) = channel();

        // Run the simulation in a separate thread
        let simulation_speed_clone = Arc::clone(&self.simulation_speed);
        thread::spawn(move || {
            let mut last_update = Instant::now();
            loop {
                if let Ok(_) = rx.try_recv() {
                    break;
                }

                let simulation_speed = simulation_speed_clone.lock().unwrap();

                todo!();

                thread::sleep(Duration::from_millis(1000 / *simulation_speed));
            }
        });

        RunningSimulation {
            _marker: PhantomData,
            simulation_speed: Arc::clone(&self.simulation_speed),
            processes: Arc::clone(&self.processes),
            resources: Arc::clone(&self.resources),
            tx,
        }
    }
}

// #[tauri::command]
// pub fn start_simulation<'a>(stopped_simulation: StoppedSimulation<'a>) -> RunningSimulation<'a> {
//     stopped_simulation.start()
// }
