#![allow(unused_imports, unused_variables, dead_code)]

use nanoid::nanoid;
use rand::Rng;
use std::{marker::PhantomData, sync::Mutex};
use tauri::{Manager, State};

use crate::{AllSimulationTrait, GenericResource, Simulation, TauriSim};

#[non_exhaustive]
#[derive(Clone, PartialEq, Copy, serde::Serialize, serde::Deserialize)]
pub enum GenericProcessResourceIntensity {
    None = 0,
    Low = 1,
    Medium = 2,
    High = 3,
    Extreme = 4,
}

#[derive(Clone, PartialEq, serde::Serialize)]
pub struct ResourceSlot {
    resource_id: String,
    id: String,
    current_amount: u64,
    base_amount: u64,
}

impl ResourceSlot {
    fn new(resource: &GenericResource, base_amount: u64) -> Self {
        Self {
            resource_id: resource.id(),
            current_amount: base_amount,
            base_amount,
            id: nanoid!(7),
        }
    }
}

#[derive(Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct Process {
    _marker: PhantomData<()>,
}

#[derive(Clone, PartialEq, serde::Serialize)]
pub struct ReadyProcess {
    name: String,
    id: String,
    resource_intensity: GenericProcessResourceIntensity,
    resource_slot: Vec<ResourceSlot>,
}

#[derive(Clone, PartialEq, serde::Serialize)]
pub struct BlockedProcess {
    name: String,
    id: String,
    resource_intensity: GenericProcessResourceIntensity,
    resource_slot: Vec<ResourceSlot>,
}

#[derive(Clone, PartialEq, serde::Serialize)]
pub struct WorkingProcess {
    name: String,
    id: String,
    resource_intensity: GenericProcessResourceIntensity,
    resource_slot: Vec<ResourceSlot>,
}

impl Process {
    pub fn new(name: String, resource_intensity: GenericProcessResourceIntensity) -> ReadyProcess {
        let resource_list = vec![];

        ReadyProcess {
            name,
            resource_intensity,
            resource_slot: resource_list,
            id: nanoid!(7),
        }
    }
}

pub trait AllProcessTraits {
    fn remove_resource(&mut self, resource: String) -> Option<()>;
    fn resource_slot_mut(&mut self) -> &mut Vec<ResourceSlot>;
    fn name(&self) -> String;
    fn resource_intensity(&self) -> &GenericProcessResourceIntensity;
    fn set_name(&mut self, name: String);
    fn set_resource_intensity(&mut self, resource_intensity: GenericProcessResourceIntensity);
    fn should_perform_action(&self) -> bool;
    fn id(&self) -> String;
}

// impl AllProcessTraits for ReadyProcess {
//     fn remove_resource(&mut self, resource_id: String) -> Option<()> {
//         let index = self
//             .resource_slot_mut()
//             .iter_mut()
//             .position(|resource_slot| resource_slot.resource_id == resource_id);

//         match index {
//             Some(index) => {
//                 self.resource_slot_mut().remove(index);
//                 Some(())
//             }
//             None => None,
//         }
//     }

//     fn id(&self) -> String {
//         self.id.clone()
//     }

//     fn resource_slot_mut(&mut self) -> &mut Vec<ResourceSlot> {
//         &mut self.resource_slot
//     }

//     fn name(&self) -> String {
//         self.name.clone()
//     }

//     fn resource_intensity(&self) -> &GenericProcessResourceIntensity {
//         &self.resource_intensity
//     }

//     fn set_name(&mut self, name: String) {
//         self.name = name;
//     }

//     fn set_resource_intensity(&mut self, resource_intensity: GenericProcessResourceIntensity) {
//         self.resource_intensity = resource_intensity;
//     }

//     fn should_perform_action(&self) -> bool {
//         let mut rng = rand::thread_rng();
//         let roll: u64 = rng.gen::<u64>() * 10;
//         let intensity = self.resource_intensity as u64;

//         roll < intensity
//     }
// }

macro_rules! impl_AllProcessTraits {
    (for $($t:ty),+) => {
        $(impl AllProcessTraits for $t {
            fn remove_resource(&mut self, resource_id: String) -> Option<()> {
                let index = self
                    .resource_slot_mut()
                    .iter_mut()
                    .position(|resource_slot| resource_slot.resource_id == resource_id);

                match index {
                    Some(index) => {
                        self.resource_slot_mut().remove(index);
                        Some(())
                    }
                    None => None,
                }
            }

            fn id(&self) -> String {
                self.id.clone()
            }

            fn resource_slot_mut(&mut self) -> &mut Vec<ResourceSlot> {
                &mut self.resource_slot
            }

            fn name(&self) -> String {
                self.name.clone()
            }

            fn resource_intensity(&self) -> &GenericProcessResourceIntensity {
                &self.resource_intensity
            }

            fn set_name(&mut self, name: String) {
                self.name = name;
            }

            fn set_resource_intensity(&mut self, resource_intensity: GenericProcessResourceIntensity) {
                self.resource_intensity = resource_intensity;
            }

            fn should_perform_action(&self) -> bool {
                let mut rng = rand::thread_rng();
                let roll: u64 = rng.gen::<u64>() * 10;
                let intensity = self.resource_intensity as u64;

                roll < intensity
            }

        })*
    }
}

impl_AllProcessTraits!(for ReadyProcess, BlockedProcess, WorkingProcess);

impl ReadyProcess {
    fn prepare(&mut self) -> &Self {
        if self.resource_intensity == GenericProcessResourceIntensity::None {
            return self;
        }

        let intensity = self.resource_intensity as u64;
        for resource_slot in self.resource_slot_mut().iter_mut() {
            let mut rng = rand::thread_rng();
            let roll: u64 = rng.gen::<u64>() * 10;

            if roll < intensity as u64 {
                let amount_to_use = resource_slot.base_amount * (roll / 10);

                resource_slot.current_amount = amount_to_use;
            }
        }

        return self;
    }

    fn run(self) -> WorkingProcess {
        WorkingProcess {
            name: self.name,
            resource_intensity: self.resource_intensity,
            resource_slot: self.resource_slot,
            id: self.id,
        }
    }

    fn block(self) -> BlockedProcess {
        BlockedProcess {
            name: self.name,
            resource_intensity: self.resource_intensity,
            resource_slot: self.resource_slot,
            id: self.id,
        }
    }
}

impl BlockedProcess {
    fn unblock(self) -> ReadyProcess {
        ReadyProcess {
            name: self.name,
            resource_intensity: self.resource_intensity,
            resource_slot: self.resource_slot,
            id: self.id,
        }
    }
}

impl WorkingProcess {
    fn finish(self) -> ReadyProcess {
        ReadyProcess {
            name: self.name,
            resource_intensity: self.resource_intensity,
            resource_slot: self.resource_slot,
            id: self.id,
        }
    }
}

#[derive(Clone, PartialEq, serde::Serialize)]
pub enum ProcessStates {
    Ready(ReadyProcess),
    Blocked(BlockedProcess),
    Working(WorkingProcess),
}

#[tauri::command]
pub fn create_process(
    name: String,
    resource_intensity: GenericProcessResourceIntensity,
) -> ReadyProcess {
    Process::new(name, resource_intensity)
}

#[tauri::command]
pub fn process_add_resource(
    app_handle: tauri::AppHandle,
    process_id: String,
    resource_id: String,
    amount: u64,
) -> Option<()> {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let sim = state.lock().unwrap();
    let running_binding = sim.0.processes();
    let processes = running_binding.lock().unwrap();

    let resource_binding = sim.0.resources();
    let resources = resource_binding.lock().unwrap();

    let process = match processes
        .iter()
        .find(|p| match p {
            ProcessStates::Ready(process) => process.id == process_id,
            ProcessStates::Blocked(process) => process.id == process_id,
            ProcessStates::Working(process) => process.id == process_id,
        })
        .cloned()
    {
        Some(process_found) => process_found,
        None => return None,
    };

    let resource = match resources.iter().find(|r| r.id() == resource_id).cloned() {
        Some(resource_found) => resource_found,
        None => return None,
    };

    match process {
        ProcessStates::Ready(mut process) => {
            process
                .resource_slot_mut()
                .push(ResourceSlot::new(&resource, amount));
            Some(())
        }
        ProcessStates::Blocked(mut process) => {
            process
                .resource_slot_mut()
                .push(ResourceSlot::new(&resource, amount));
            Some(())
        }
        ProcessStates::Working(mut process) => {
            process
                .resource_slot_mut()
                .push(ResourceSlot::new(&resource, amount));
            Some(())
        }
    }
}

#[tauri::command]
pub fn process_remove_resource(app_handle: tauri::AppHandle, resource_id: String) -> Option<()> {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let mut sim = state.lock().unwrap();
    let running_binding = sim.0.resources();
    let resources = running_binding.lock().unwrap();

    match resources.iter().find(|r| r.id() == resource_id).cloned() {
        Some(resource_found) => return Some(sim.0.remove_resource(&resource_found)),
        None => return None,
    }
}

#[tauri::command]
pub fn process_get_resource_intensity(
    app_handle: tauri::AppHandle,
    process_id: String,
) -> GenericProcessResourceIntensity {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let sim = state.lock().unwrap();
    let running_binding = sim.0.processes();
    let stopped_binding = sim.0.processes();
    let processes = running_binding.lock().unwrap();
    match processes
        .iter()
        .find(|p| match p {
            ProcessStates::Ready(process) => process.id == process_id,
            ProcessStates::Blocked(process) => process.id == process_id,
            ProcessStates::Working(process) => process.id == process_id,
        })
        .cloned()
    {
        Some(process_found) => match process_found {
            ProcessStates::Ready(process) => return process.resource_intensity,
            ProcessStates::Blocked(process) => return process.resource_intensity,
            ProcessStates::Working(process) => return process.resource_intensity,
        },
        None => return GenericProcessResourceIntensity::None,
    }
}

#[tauri::command]
pub fn process_set_name(app_handle: tauri::AppHandle, process_id: String, name: String) {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let sim = state.lock().unwrap();
    let running_binding = sim.0.processes();
    let stopped_binding = sim.0.processes();
    let processes = running_binding.lock().unwrap();

    match processes
        .iter()
        .find(|p| match p {
            ProcessStates::Ready(process) => process.id == process_id,
            ProcessStates::Blocked(process) => process.id == process_id,
            ProcessStates::Working(process) => process.id == process_id,
        })
        .cloned()
    {
        Some(process_found) => match process_found {
            ProcessStates::Ready(mut process) => process.set_name(name),
            ProcessStates::Blocked(mut process) => process.set_name(name),
            ProcessStates::Working(mut process) => process.set_name(name),
        },
        None => {
            return;
        }
    }
}

#[tauri::command]
pub fn process_get_name(app_handle: tauri::AppHandle, process_id: String) -> Option<String> {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let sim = state.lock().unwrap();
    let running_binding = sim.0.processes();
    let stopped_binding = sim.0.processes();
    let processes = running_binding.lock().unwrap();

    match processes
        .iter()
        .find(|p| match p {
            ProcessStates::Ready(process) => process.id == process_id,
            ProcessStates::Blocked(process) => process.id == process_id,
            ProcessStates::Working(process) => process.id == process_id,
        })
        .cloned()
    {
        Some(process_found) => match process_found {
            ProcessStates::Ready(process) => return Some(process.name),
            ProcessStates::Blocked(process) => return Some(process.name),
            ProcessStates::Working(process) => return Some(process.name),
        },
        None => return None,
    }
}

#[tauri::command]
pub fn process_set_resource_intensity(
    app_handle: tauri::AppHandle,
    process_id: String,
    resource_intensity: GenericProcessResourceIntensity,
) {
    let state = app_handle.state::<Mutex<TauriSim>>();
    let sim = state.lock().unwrap();
    let running_binding = sim.0.processes();
    let stopped_binding = sim.0.processes();
    let processes = running_binding.lock().unwrap();

    match processes
        .iter()
        .find(|p| match p {
            ProcessStates::Ready(process) => process.id == process_id,
            ProcessStates::Blocked(process) => process.id == process_id,
            ProcessStates::Working(process) => process.id == process_id,
        })
        .cloned()
    {
        Some(process_found) => match process_found {
            ProcessStates::Ready(mut process) => process.resource_intensity = resource_intensity,
            ProcessStates::Blocked(mut process) => process.resource_intensity = resource_intensity,
            ProcessStates::Working(mut process) => process.resource_intensity = resource_intensity,
        },
        None => {
            return;
        }
    }
}
