use nanoid::nanoid;

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct GenericResource {
    name: String,
    blocking: bool,
    total_amount: u64,
    free_amount: u64,
    id: String,
}

pub enum GenericResourceError {
    NotEnoughResource,
}

impl GenericResource {
    pub fn new(name: String, total_amount: u64, blocking: bool) -> Self {
        Self {
            name,
            total_amount,
            free_amount: total_amount,
            blocking,
            id: nanoid!(7)
        }
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn set_name(&mut self, name: String) {
        self.name = name;
    }

    pub fn total_amount(&self) -> u64 {
        self.total_amount
    }

    pub fn set_total_amount(&mut self, total_amount: u64) {
        self.total_amount = total_amount;
    }

    pub fn free_amount(&self) -> u64 {
        self.free_amount
    }

    pub fn set_free_amount(&mut self, free_amount: u64) {
        self.free_amount = free_amount;
    }

    pub fn use_resource(&mut self, amount: u64) -> Result<(), GenericResourceError> {
        if self.free_amount < amount {
            return Err(GenericResourceError::NotEnoughResource);
        }
        // self.free_amount -= amount;
        self.set_free_amount(self.free_amount - amount);
        Ok(())
    }
}

impl PartialEq for GenericResource {
    fn eq(&self, other: &Self) -> bool {
        std::ptr::eq(self, other)
    }
}

#[tauri::command]
pub fn create_resource(name: String, total_amount: u64, blocking: bool) -> GenericResource {
    GenericResource::new(name, total_amount, blocking)
}

#[tauri::command]
pub fn get_resource_name(resource: GenericResource) -> String {
    resource.name().to_string()
}

#[tauri::command]
pub fn set_resource_name(mut resource: GenericResource, name: String) {
    resource.set_name(name);
}

#[tauri::command]
pub fn get_resource_total_amount(resource: GenericResource) -> u64 {
    resource.total_amount()
}

#[tauri::command]
pub fn set_resource_total_amount(mut resource: GenericResource, total_amount: u64) {
    resource.set_total_amount(total_amount);
}

#[tauri::command]
pub fn get_resource_free_amount(resource: GenericResource) -> u64 {
    resource.free_amount()
}
