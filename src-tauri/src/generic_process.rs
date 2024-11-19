use crate::generic_resource::GenericResource;
use rand::Rng;

pub enum GenericProcessResourceIntensity {
    None,
    Low,
    Medium,
    High,
    Extreme,
}

pub struct ResourceSlot<'a> {
    resource: &'a mut GenericResource,
    current_amount: u64,
    base_amount: u64,
}

#[derive(PartialEq)]
pub enum GenericProcessState {
    Ready,
    Blocked,
    BlockedAndSuspended,
    ReadyAndSuspended,
    Working,
    New,
}

pub struct GenericProcess<'a> {
    name: String,
    resource_intensity: GenericProcessResourceIntensity,
    resource_list: Vec<ResourceSlot<'a>>,
    state: GenericProcessState,
}

pub enum GenericProcessError {
    NotEnoughResource,
}

impl<'a> GenericProcess<'a> {
    pub fn new(
        name: String,
        resource_intensity: GenericProcessResourceIntensity,
        resource_slot: Option<Vec<ResourceSlot<'a>>>,
    ) -> Self {
        Self {
            name,
            resource_intensity,
            resource_list: resource_slot.unwrap_or(Vec::new()),
            state: GenericProcessState::New,
        }
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn resource_intensity(&self) -> &GenericProcessResourceIntensity {
        &self.resource_intensity
    }

    pub fn set_name(&mut self, name: String) {
        self.name = name;
    }

    pub fn set_resource_intensity(&mut self, resource_intensity: GenericProcessResourceIntensity) {
        self.resource_intensity = resource_intensity;
    }

    pub fn state(&self) -> &GenericProcessState {
        &self.state
    }

    pub fn set_state(&mut self, state: GenericProcessState) {
        self.state = state;
    }

    pub fn add_resource(&mut self, resource: &'a mut GenericResource, amount: u64) {
        self.resource_list.push(ResourceSlot::new(resource, amount));
    }

    pub fn remove_resource(&mut self, resource: &GenericResource) {
        let resource_index = self
            .resource_list
            .iter_mut()
            .position(|x| x.resource() == resource);
        match resource_index {
            Some(index) => {
                self.resource_list.remove(index);
            }
            None => {}
        }
    }

    pub fn resource_list(&self) -> &Vec<ResourceSlot> {
        &self.resource_list
    }

    fn should_perform_action(&self) -> bool {
        let mut rng = rand::thread_rng();
        let roll: f64 = rng.gen();

        match self.resource_intensity {
            GenericProcessResourceIntensity::None => false,
            GenericProcessResourceIntensity::Low => roll < 0.2, // 20% chance
            GenericProcessResourceIntensity::Medium => roll < 0.5, // 50% chance
            GenericProcessResourceIntensity::High => roll < 0.8, // 80% chance
            GenericProcessResourceIntensity::Extreme => true,   // 100% chance
        }
    }

    pub fn prepare(&mut self) {
        if !self.should_perform_action() {
            return;
        }

        for resource_slot in self.resource_list.iter_mut() {
            let mut rng = rand::thread_rng();
            let roll: f64 = rng.gen();

            let amount_to_request = match self.resource_intensity {
                GenericProcessResourceIntensity::None => 0.0,
                GenericProcessResourceIntensity::Low => {
                    if roll < 0.2 {
                        0.2
                    } else {
                        0.0
                    }
                }
                GenericProcessResourceIntensity::Medium => {
                    if roll < 0.5 {
                        0.5
                    } else {
                        0.0
                    }
                }
                GenericProcessResourceIntensity::High => {
                    if roll < 0.8 {
                        0.8
                    } else {
                        0.0
                    }
                }
                GenericProcessResourceIntensity::Extreme => {
                    if roll < 1.0 {
                        1.0
                    } else {
                        0.0
                    }
                }
            };

            resource_slot.set_current_amount(amount_to_request);
        }
    }

    pub fn run(&mut self) -> Result<(), GenericProcessError> {
        if self.state != GenericProcessState::Ready {
            return Ok(());
        }

        if self.state == GenericProcessState::Blocked {
            // When the process is blocked, we should try to unblock it
            let mut rng = rand::thread_rng();
            let roll: f64 = rng.gen();

            if roll < 0.7 {
                self.set_state(GenericProcessState::Ready);
            }

            return Ok(());
        }

        self.state = GenericProcessState::Working;

        for resource_slot in self.resource_list.iter_mut() {
            let current_amount = resource_slot.current_amount();
            match resource_slot
                .resource()
                .use_resource(current_amount)
            {
                Ok(_) => {
                    resource_slot.reset_current_amount();
                }
                Err(_) => {
                    self.set_state(GenericProcessState::Blocked);
                    return Err(GenericProcessError::NotEnoughResource);
                }
            }
        }

        Ok(())
    }

    pub fn finish(&mut self) {
        self.set_state(GenericProcessState::Ready);
    }
}

impl<'a> ResourceSlot<'a> {
    pub fn new(resource: &'a mut GenericResource, amount: u64) -> Self {
        Self {
            resource,
            current_amount: 0,
            base_amount: amount,
        }
    }

    pub fn resource(&mut self) -> &mut GenericResource {
        self.resource
    }

    pub fn base_amount(&self) -> u64 {
        self.base_amount
    }

    pub fn current_amount(&self) -> u64 {
        self.current_amount
    }

    pub fn set_current_amount(&mut self, amount: f64) {
        // Increase the current amount by the base amount times the given amount
        self.current_amount = self.base_amount + (self.base_amount as f64 * amount) as u64;
    }

    pub fn reset_current_amount(&mut self) {
        self.set_current_amount(0.0);
    }
}
