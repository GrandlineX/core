# Changelog
All notable changes to this project will be documented in this file.
## [0.18.0-pre01] 

### Changed
- update Module interfaces
### Fixed
- fix many spelling issues

## [0.17.3] - 2022-01-03

### Fixed 
- Add missing module exports 
 
All notable changes to this project will be documented in this file.
## [0.17.2] - 2022-01-03

### Fixed 
- Fix Core kernel interface (BREAKING)
 
## [0.17.1] - 2022-01-03

### Fixed 
- Add async init function for DbPrefab
- DbPrefab is now abstract

## [0.17.0] - 2022-01-03

### Added 
- Log level -> set  StoreGlobal.GLOBAL_LOG_LEVEL {VERBOSE,DEBUG,WARN,INFO,ERROR,SILENT}
- Array Load for add action/service
- Add Db Prefab/Facade
- DB getEntityMeta

## [0.16.2] - 2021-12-07

### Added 
- Env Store globals 
- Os globals 
- Arch globals 
### Fixed
- InMemCache fix 

## [0.16.1] - 2021-12-06

### Fixed
- Wrapper Entity interface for order result

## [0.16.0] - 2021-12-06

### Added
- Extending entityList interface 
  - result can now be ordered by `ASC` or `DESC`
  - (optinal) schema name for `foreignKey`
- Caching for entities
- InMemCache
### Changed
- Restructure entity module
## [0.15.1] - 2021-12-06
### Added
- CoreError # log to error log channel
### Changed
- Interface for entity update 
- Better interfaces for entity constructor
- Update InMemDb

## [0.15.0] - 2021-12-02
### Added
- Add Changelog
- Add ORM System 
- Add reflection Typescript feature (for ORM)
````json
 {
  "dependencies": {
    "reflect-metadata": "^0.1.13"
  }
}
````

### Changed
- Change tsconfig.json enable decorator feature 
````json
 {
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
````


### Removed
- outdated env file 

### Fixed
> nothing 

