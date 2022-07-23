export enum OsRelease {
  WIN32 = 'win32',
  DARWIN = 'darwin',
  LINUX = 'linux',
}

export enum ArchType {
  X32 = 'x32',
  X64 = 'x64',
  ARM = 'arm',
  ARM64 = 'arm64',
}

export enum StoreGlobal {
  'GLOBAL_OS' = 'GLOBAL_OS',
  'GLOBAL_ARCH' = 'GLOBAL_ARCH',
  'GLOBAL_LOG_LEVEL' = 'GLOBAL_LOG_LEVEL',
  'GLOBAL_PATH_HOME' = 'GLOBAL_PATH_HOME',
  'GLOBAL_PATH_DATA' = 'GLOBAL_PATH_DATA',
  'GLOBAL_PATH_DB' = 'GLOBAL_PATH_DB',
  'GLOBAL_PATH_TEMP' = 'GLOBAL_PATH_TEMP',
  'GLOBAL_APP_VERSION' = 'GLOBAL_APP_VERSION',
  'GLOBAL_HOME_DIR' = 'GLOBAL_HOME_DIR',
  'GLOBAL_HOST_NAME' = 'GLOBAL_HOST_NAME',
}
