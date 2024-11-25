// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
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

use crate::generic_process::*;
use crate::generic_resource::*;
use crate::simulation::*;

use std::sync::Mutex;
use std::thread;
use window_vibrancy::*;

use tauri::{Builder, Manager};

#[derive(Default)]
struct TauriSim<'a> {
    simulation: Simulation<'a>,
}

fn main() {
    // move to a new thread
    let sim = Simulation::new();
    thread::spawn(move || {});

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            create_resource,
            get_resource_name,
            set_resource_name,
            get_resource_total_amount,
            set_resource_total_amount,
            get_resource_free_amount,
            create_process,
            process_remove_resource,
            // process_name,
            // process_resource_intensity,
            // process_set_name,
            // process_set_resource_intensity,
            // simulation_add_process,
            // simulation_add_resource,
            // simulation_processes,
            // simulation_resources,
            // set_simulation_speed,
            // simulation_speed,
            // stop_simulation,
            // start_simulation,
        ])
        .setup(move |app| {
            app.manage(Mutex::new(sim));
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

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
