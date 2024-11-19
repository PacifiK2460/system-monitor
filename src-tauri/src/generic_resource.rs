pub struct GenericResource {
    name: String,
    blocking: bool,
    total_amount: u64,
    free_amount: u64,
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
            blocking
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
