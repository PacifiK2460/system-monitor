export type Process = {
  Ready: {
    id: string;
    name: string;
    resource_intensity: number;
    resource_slot: {
      base_amount: number;
      current_amount: number;
      id: string;
      resource_id: string;
    }[];
  };
  Blocked: {
    id: string;
    name: string;
    resource_intensity: number;
    resource_slot: {
      base_amount: number;
      current_amount: number;
      id: string;
      resource_id: string;
    }[];
  };
  Working: {
    id: string;
    name: string;
    resource_intensity: number;
    resource_slot: {
      base_amount: number;
      current_amount: number;
      id: string;
      resource_id: string;
    }[];
  };
};

export type ProcessReady = {
  id: string;
  name: string;
  resource_intensity: number;
  resource_slot: {
    base_amount: number;
    current_amount: number;
    id: string;
    resource_id: string;
  }[];
};

// Define the resource type
export type Resource = {
  id: string;
  name: string;
  total_amount: number;
  free_amount: number;
};

// Define Process
