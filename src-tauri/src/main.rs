// Prevents additional console window on Windows in release, DO NOT REMOVE!!
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
// Copyright 2019-2022 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod generic_process;
mod generic_resource;
mod simulation;

use std::sync::Mutex;

use crate::generic_process::*;
use crate::generic_resource::*;
use crate::simulation::*;

use window_vibrancy::*;

use tauri::Manager;

pub struct TauriSim(RunningSimulation);

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            generic_resource::create_resource,
            generic_resource::get_resource_name,
            generic_resource::set_resource_name,
            generic_resource::get_resource_total_amount,
            generic_resource::set_resource_total_amount,
            generic_resource::get_resource_free_amount,
            generic_process::create_process,
            generic_process::process_add_resource,
            generic_process::process_remove_resource,
            generic_process::process_get_resource_intensity,
            generic_process::process_set_name,
            generic_process::process_get_name,
            generic_process::process_set_resource_intensity,
            simulation::simulation_add_process,
            simulation::simulation_add_resource,
            simulation::simulation_processes,
            simulation::simulation_resources,
            simulation::simulation_set_simulation_speed,
            simulation::simulation_speed,
            simulation::stop_simulation,
            simulation::start_simulation,
        ])
        .setup(move |app| {
            app.manage(Mutex::new(TauriSim(RunningSimulation::new())));

            let window = app.get_window("main").unwrap();

            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            #[cfg(target_os = "windows")]
            apply_acrylic(&window, Some((0, 0, 0, 0)))
                .expect("Unsupported platform! 'apply_blur' is only supported on Windows");

            // Add decorators to the window
            window
                .set_decorations(true)
                .expect("Failed to set window decorations");

            simulation::start_simulation(app.app_handle());

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
