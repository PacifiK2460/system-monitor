use nanoid::nanoid;
use rand::Rng;
use std::marker::PhantomData;

use crate::GenericResource;

#[non_exhaustive]
#[derive(Clone, PartialEq, Copy, serde::Serialize, serde::Deserialize)]
pub enum GenericProcessResourceIntensity {
    None = 0,
    Low = 1,
    Medium = 4,
    High = 6,
    Extreme = 8,
}

#[derive(Clone, PartialEq, serde::Serialize)]
pub struct ResourceSlot<'a> {
    resource: &'a GenericResource,
    id: String,
    current_amount: u64,
    base_amount: u64,
}

impl<'a> ResourceSlot<'a> {
    fn new(resource: &'a GenericResource, base_amount: u64) -> Self {
        Self {
            resource,
            current_amount: base_amount,
            base_amount,
            id: nanoid!(7),
        }
    }
}

#[derive(Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct Process<'a> {
    _marker: PhantomData<&'a ()>,
}

#[derive(Clone, PartialEq, serde::Serialize)]
pub struct ReadyProcess<'a> {
    name: String,
    id: String,
    resource_intensity: GenericProcessResourceIntensity,
    resource_slot: Vec<ResourceSlot<'a>>,
}

#[derive(Clone, PartialEq, serde::Serialize)]
pub struct BlockedProcess<'a> {
    name: String,
    id: String,
    resource_intensity: GenericProcessResourceIntensity,
    resource_slot: Vec<ResourceSlot<'a>>,
}

#[derive(Clone, PartialEq, serde::Serialize)]
pub struct WorkingProcess<'a> {
    name: String,
    id: String,
    resource_intensity: GenericProcessResourceIntensity,
    resource_slot: Vec<ResourceSlot<'a>>,
}

impl<'a> Process<'a> {
    pub fn new(
        name: String,
        resource_intensity: GenericProcessResourceIntensity,
    ) -> ReadyProcess<'a> {
        let resource_list = vec![];

        ReadyProcess {
            name,
            resource_intensity,
            resource_slot: resource_list,
            id: nanoid!(7),
        }
    }
}

pub trait AllProcessTraits<'a> {
    fn remove_resource(&mut self, resource: &'a GenericResource) -> Option<()>;
    fn resource_slot_mut(&mut self) -> &mut Vec<ResourceSlot<'a>>;
    fn name(&self) -> &String;
    fn resource_intensity(&self) -> &GenericProcessResourceIntensity;
    fn set_name(&mut self, name: String);
    fn set_resource_intensity(&mut self, resource_intensity: GenericProcessResourceIntensity);
    fn should_perform_action(&self) -> bool;
    fn id(&self) -> &String;
}

macro_rules! impl_AllProcessTraits {
    (for $($t:ty),+) => {
        $(impl<'a> AllProcessTraits<'a> for $t {
            fn remove_resource(&mut self, resource: &GenericResource) -> Option<()> {
                let index = self
                    .resource_slot_mut()
                    .iter_mut()
                    .position(|resource_slot| resource_slot.resource == resource);

                match index {
                    Some(index) => {
                        self.resource_slot_mut().remove(index);
                        Some(())
                    }
                    None => None,
                }
            }

            fn id(&self) -> &String {
                &self.id
            }

            fn resource_slot_mut(&mut self) -> &mut Vec<ResourceSlot<'a>> {
                &mut self.resource_slot
            }

            fn name(&self) -> &String {
                &self.name
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

impl_AllProcessTraits!(for ReadyProcess<'a>, BlockedProcess<'a>, WorkingProcess<'a>);

impl<'a> ReadyProcess<'a> {
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

    fn run(self) -> WorkingProcess<'a> {
        WorkingProcess {
            name: self.name,
            resource_intensity: self.resource_intensity,
            resource_slot: self.resource_slot,
            id: self.id,
        }
    }

    fn block(self) -> BlockedProcess<'a> {
        BlockedProcess {
            name: self.name,
            resource_intensity: self.resource_intensity,
            resource_slot: self.resource_slot,
            id: self.id,
        }
    }
}

impl<'a> BlockedProcess<'a> {
    fn unblock(self) -> ReadyProcess<'a> {
        ReadyProcess {
            name: self.name,
            resource_intensity: self.resource_intensity,
            resource_slot: self.resource_slot,
            id: self.id,
        }
    }
}

impl<'a> WorkingProcess<'a> {
    fn finish(self) -> ReadyProcess<'a> {
        ReadyProcess {
            name: self.name,
            resource_intensity: self.resource_intensity,
            resource_slot: self.resource_slot,
            id: self.id,
        }
    }
}

#[derive(Clone, PartialEq, serde::Serialize)]
pub enum ProcessStates<'a> {
    Ready(ReadyProcess<'a>),
    Blocked(BlockedProcess<'a>),
    Working(WorkingProcess<'a>),
}

#[tauri::command]
pub fn create_process<'a>(
    name: String,
    resource_intensity: GenericProcessResourceIntensity,
) -> ReadyProcess<'a> {
    Process::new(name, resource_intensity)
}
