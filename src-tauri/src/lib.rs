use std::fs;
use std::path::Path;
use std::time::UNIX_EPOCH;
use serde::{Deserialize, Serialize};

/// Window state for persistence
#[derive(Debug, Serialize, Deserialize, Clone)]
struct WindowState {
    x: i32,
    y: i32,
    width: u32,
    height: u32,
    maximized: bool,
}

impl Default for WindowState {
    fn default() -> Self {
        Self {
            x: 100,
            y: 100,
            width: 1200,
            height: 800,
            maximized: false,
        }
    }
}

/// Search result for project-wide search
#[derive(Serialize, Deserialize, Clone)]
pub struct SearchResult {
    pub file_path: String,
    pub line_number: usize,
    pub line_content: String,
    pub match_start: usize,
    pub match_end: usize,
}

/// Search in all text files under a directory
#[tauri::command]
fn search_in_files(directory: String, query: String, case_sensitive: bool) -> Vec<SearchResult> {
    let mut results = Vec::new();
    if !query.is_empty() {
        search_recursive(Path::new(&directory), &query, case_sensitive, &mut results);
    }
    results
}

fn search_recursive(dir: &Path, query: &str, case_sensitive: bool, results: &mut Vec<SearchResult>) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let dir_name = path.file_name().unwrap_or_default().to_string_lossy();
                if !["node_modules", ".git", "target", "dist", "__pycache__", ".next"].contains(&dir_name.as_ref()) {
                    search_recursive(&path, query, case_sensitive, results);
                }
            } else if let Some(ext) = path.extension() {
                let ext_str = ext.to_string_lossy().to_lowercase();
                if ["md", "txt", "js", "ts", "tsx", "jsx", "json", "css", "html", "rs", "toml", "yaml", "yml", "py", "rb", "go", "java", "c", "cpp", "h", "hpp", "xml", "svg", "env", "gitignore", "dockerfile"].contains(&ext_str.as_str()) {
                    if let Ok(content) = fs::read_to_string(&path) {
                        let query_compare = if !case_sensitive { query.to_lowercase() } else { query.to_string() };
                        for (line_num, line) in content.lines().enumerate() {
                            let line_compare = if !case_sensitive { line.to_lowercase() } else { line.to_string() };
                            if let Some(pos) = line_compare.find(&query_compare) {
                                results.push(SearchResult {
                                    file_path: path.to_string_lossy().to_string(),
                                    line_number: line_num + 1,
                                    line_content: line.to_string(),
                                    match_start: pos,
                                    match_end: pos + query.len(),
                                });
                            }
                        }
                    }
                }
            }
        }
    }
}

/// Parse a .gitignore file and return the list of patterns
#[tauri::command]
fn parse_gitignore(directory: String) -> Vec<String> {
    let gitignore_path = Path::new(&directory).join(".gitignore");
    if !gitignore_path.exists() {
        return Vec::new();
    }
    match fs::read_to_string(&gitignore_path) {
        Ok(content) => {
            content
                .lines()
                .map(|line| line.trim().to_string())
                .filter(|line| !line.is_empty() && !line.starts_with('#'))
                .collect()
        }
        Err(_) => Vec::new(),
    }
}

/// Get the path to the window state file
fn get_window_state_path() -> Result<std::path::PathBuf, String> {
    let config_dir = dirs_next::config_dir()
        .ok_or_else(|| "Failed to get config directory".to_string())?;
    let app_dir = config_dir.join("FileWithJob");
    fs::create_dir_all(&app_dir).map_err(|e| format!("Failed to create app directory: {}", e))?;
    Ok(app_dir.join("window_state.json"))
}

/// Save window state to file
#[tauri::command]
fn save_window_state(state: WindowState) -> Result<(), String> {
    let path = get_window_state_path()?;
    let json = serde_json::to_string_pretty(&state)
        .map_err(|e| format!("Failed to serialize window state: {}", e))?;
    fs::write(&path, json)
        .map_err(|e| format!("Failed to write window state: {}", e))?;
    Ok(())
}

/// Load window state from file
#[tauri::command]
fn load_window_state() -> Result<WindowState, String> {
    let path = get_window_state_path()?;
    
    if !path.exists() {
        return Ok(WindowState::default());
    }
    
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read window state: {}", e))?;
    
    let state: WindowState = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse window state: {}", e))?;
    
    let validated_state = validate_window_state(state);
    
    Ok(validated_state)
}

/// Validate window state to ensure reasonable values
fn validate_window_state(state: WindowState) -> WindowState {
    let mut validated = state;
    // Ensure window is within reasonable bounds
    if validated.width < 400 { validated.width = 400; }
    if validated.height < 300 { validated.height = 300; }
    if validated.width > 10000 { validated.width = 10000; }
    if validated.height > 10000 { validated.height = 10000; }
    validated
}

/// Read file content
#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {}", e))
}

/// Write content to file
#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| format!("Failed to write file: {}", e))
}

/// Read directory entries
#[tauri::command]
fn read_dir(path: String) -> Result<Vec<DirEntry>, String> {
    let mut result = Vec::new();
    let entries = fs::read_dir(&path)
        .map_err(|e| format!("Failed to read directory: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let metadata = entry
            .metadata()
            .map_err(|e| format!("Failed to read metadata: {}", e))?;
        let name = entry.file_name().to_string_lossy().to_string();
        let path = entry.path().to_string_lossy().to_string();
        let is_dir = metadata.is_dir();
        let size = if is_dir { 0 } else { metadata.len() };
        let modified = metadata
            .modified()
            .ok()
            .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
            .map(|d| d.as_secs())
            .unwrap_or(0);

        result.push(DirEntry {
            name,
            path,
            is_dir,
            size,
            modified,
        });
    }

    result.sort_by(|a, b| {
        b.is_dir
            .cmp(&a.is_dir)
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    Ok(result)
}

/// Create a new file with empty content
#[tauri::command]
fn create_file(path: String) -> Result<(), String> {
    if Path::new(&path).exists() {
        return Err("File already exists".to_string());
    }
    fs::write(&path, "").map_err(|e| format!("Failed to create file: {}", e))
}

/// Create a new directory
#[tauri::command]
fn create_dir(path: String) -> Result<(), String> {
    fs::create_dir_all(&path).map_err(|e| format!("Failed to create directory: {}", e))
}

/// Delete a file or directory
#[tauri::command]
fn delete_path(path: String) -> Result<(), String> {
    let path = Path::new(&path);
    if !path.exists() {
        return Err("Path does not exist".to_string());
    }
    if path.is_dir() {
        fs::remove_dir_all(path).map_err(|e| format!("Failed to delete directory: {}", e))
    } else {
        fs::remove_file(path).map_err(|e| format!("Failed to delete file: {}", e))
    }
}

/// Rename/move a file or directory
#[tauri::command]
fn rename_path(from: String, to: String) -> Result<(), String> {
    fs::rename(&from, &to).map_err(|e| format!("Failed to rename: {}", e))
}

/// Check if a path exists
#[tauri::command]
fn path_exists(path: String) -> bool {
    Path::new(&path).exists()
}

/// Enhanced file info with creation time, extension, etc.
#[tauri::command]
fn get_file_info(path: String) -> Result<DetailedFileInfo, String> {
    let metadata = fs::metadata(&path).map_err(|e| format!("Failed to get metadata: {}", e))?;
    let file_name = Path::new(&path)
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let extension = Path::new(&path)
        .extension()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let is_dir = metadata.is_dir();
    let size = metadata.len();
    let readonly = metadata.permissions().readonly();

    let created = metadata
        .created()
        .ok()
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or(0);
    let modified = metadata
        .modified()
        .ok()
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or(0);

    Ok(DetailedFileInfo {
        name: file_name,
        path,
        extension,
        is_dir,
        size,
        created,
        modified,
        readonly,
    })
}

/// Check if a file is binary by reading first 8KB and looking for null bytes
#[tauri::command]
fn is_binary_file(path: String) -> Result<bool, String> {
    let data = fs::read(&path).map_err(|e| format!("Failed to read file: {}", e))?;
    let check_len = data.len().min(8192);
    let is_binary = data[..check_len].contains(&0);
    Ok(is_binary)
}

/// Get the user's home directory
#[tauri::command]
fn get_home_dir() -> Result<String, String> {
    dirs_next::home_dir()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "Failed to get home directory".to_string())
}

/// Get common directories (documents, desktop, etc.)
#[tauri::command]
fn get_common_dirs() -> CommonDirs {
    CommonDirs {
        home: dirs_next::home_dir().map(|p| p.to_string_lossy().to_string()),
        documents: dirs_next::document_dir().map(|p| p.to_string_lossy().to_string()),
        desktop: dirs_next::desktop_dir().map(|p| p.to_string_lossy().to_string()),
        downloads: dirs_next::download_dir().map(|p| p.to_string_lossy().to_string()),
    }
}

#[derive(serde::Serialize)]
struct DirEntry {
    name: String,
    path: String,
    is_dir: bool,
    size: u64,
    modified: u64,
}

/// Enhanced file info with creation time, extension, and readonly status
#[derive(serde::Serialize)]
struct DetailedFileInfo {
    name: String,
    path: String,
    extension: String,
    is_dir: bool,
    size: u64,
    created: u64,
    modified: u64,
    readonly: bool,
}

#[derive(serde::Serialize)]
struct CommonDirs {
    home: Option<String>,
    documents: Option<String>,
    desktop: Option<String>,
    downloads: Option<String>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            read_dir,
            create_file,
            create_dir,
            delete_path,
            rename_path,
            path_exists,
            get_file_info,
            get_home_dir,
            get_common_dirs,
            get_file_modified_time,
            save_window_state,
            load_window_state,
            search_in_files,
            parse_gitignore,
            is_binary_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Get file modified time as Unix timestamp (seconds)
#[tauri::command]
fn get_file_modified_time(path: String) -> Result<u64, String> {
    let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
    let modified = metadata.modified().map_err(|e| e.to_string())?;
    let timestamp = modified.duration_since(UNIX_EPOCH).map_err(|e| e.to_string())?;
    Ok(timestamp.as_secs())
}