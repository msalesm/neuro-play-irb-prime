/**
 * Services Layer - Barrel Export
 * 
 * Centralized data access layer. Hooks consume these services
 * instead of calling the database client directly.
 */

export * as gameService from './game-service';
export * as abaService from './aba-service';
export * as reportService from './report-service';
export * as userService from './user-service';
export * as cognitiveEngine from './cognitive-engine';
