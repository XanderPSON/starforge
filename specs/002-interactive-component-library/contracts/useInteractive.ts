/**
 * TypeScript Contract Definitions for Interactive Component Library
 *
 * Feature: 002-interactive-component-library
 * Purpose: Defines interfaces for the useInteractive hook and all component props
 * Status: Phase 1 Design Artifact (NOT IMPLEMENTATION)
 */

// ============================================================================
// Core Hook Interface
// ============================================================================

/**
 * useInteractive Hook Signature
 *
 * Provides unified localStorage-based state management for interactive components.
 *
 * @template T - The type of the component's value (string, number, boolean[], etc.)
 * @param id - Unique identifier for the component within the codelab
 * @param defaultValue - Initial value used when no saved state exists
 * @returns Tuple of [value, setValue, isSaved]
 *
 * @example
 * const [text, setText, isSaved] = useInteractive<string>('my-response', '')
 */
export type UseInteractive = <T>(
  id: string,
  defaultValue: T
) => [
  value: T | undefined, // undefined during SSR/hydration
  setValue: (value: T) => void,
  isSaved: boolean
]

// ============================================================================
// Storage Key Utilities
// ============================================================================

/**
 * Generates the localStorage key for a component instance
 * Pattern: codelab:{slug}:{componentId}
 *
 * @param slug - Codelab identifier (from URL)
 * @param id - Component ID
 * @returns Namespaced storage key
 *
 * @example
 * getStorageKey('intro', 'question-1') // => 'codelab:intro:question-1'
 */
export type GetStorageKey = (slug: string, id: string) => string

// ============================================================================
// Component Prop Interfaces
// ============================================================================

/**
 * FreeResponse Component Props
 *
 * Multi-line text input with auto-save indicator.
 *
 * FR-005: Must accept id, label, and placeholder props
 * FR-006: Must display "Saved" indicator after user stops typing
 */
export interface FreeResponseProps {
  /** Unique identifier (scoped to codelab) */
  id: string

  /** Label displayed above the textarea */
  label: string

  /** Placeholder text shown when textarea is empty */
  placeholder?: string

  /** Optional CSS class name for styling */
  className?: string
}

/**
 * MultipleChoice Component Props
 *
 * Quiz-style multiple choice with immediate correctness feedback.
 *
 * FR-007: Must accept id, question, options[], and correctAnswer
 * FR-008: Show green success state when selected === correctAnswer
 * FR-009: Show red error state when selected !== correctAnswer
 */
export interface MultipleChoiceProps {
  /** Unique identifier (scoped to codelab) */
  id: string

  /** The question prompt displayed to the user */
  question: string

  /** Array of possible answer choices */
  options: string[]

  /** The correct answer (must match one option exactly, case-sensitive) */
  correctAnswer: string

  /** Optional CSS class name for styling */
  className?: string
}

/**
 * TemperatureCheck Component Props
 *
 * 5-emoji sentiment selector with scaling animation.
 *
 * FR-011: Must accept id prop
 * FR-012: Display 5 emojis (😕🤔😐😊🤩)
 * FR-013: Scale up selected emoji
 */
export interface TemperatureCheckProps {
  /** Unique identifier (scoped to codelab) */
  id: string

  /** Optional CSS class name for styling */
  className?: string
}

/**
 * Scale Component Props
 *
 * Visual rating scale with volume-bar style highlighting.
 *
 * FR-014: Must accept id, max (default 5), and label
 * FR-015: Render row of circles from 1 to max
 * FR-016: Highlight circles up to and including selected value
 */
export interface ScaleProps {
  /** Unique identifier (scoped to codelab) */
  id: string

  /** Maximum value (number of circles to render) */
  max?: number // default: 5

  /** Label displayed above the scale */
  label?: string

  /** Optional CSS class name for styling */
  className?: string
}

/**
 * Checklist Component Props
 *
 * Task list with checkbox persistence.
 *
 * FR-017: Must accept id and items[] props
 * FR-018: Render checkbox for each item
 * FR-019: Persist boolean[] state across reloads
 */
export interface ChecklistProps {
  /** Unique identifier (scoped to codelab) */
  id: string

  /** Array of task descriptions */
  items: string[]

  /** Optional CSS class name for styling */
  className?: string
}

// ============================================================================
// Internal State Representation
// ============================================================================

/**
 * InteractiveState<T>
 *
 * The structure saved to localStorage for each component instance.
 * This is an internal implementation detail exposed for type safety.
 *
 * @template T - The value type (component-specific)
 */
export interface InteractiveState<T> {
  /** Component ID (matches the id prop) */
  id: string

  /** The current state value */
  value: T

  /** Unix timestamp (milliseconds) of last update */
  updatedAt: number

  /** Schema version for future migrations */
  version: string // e.g., "1.0"
}

// ============================================================================
// Component Value Types
// ============================================================================

/**
 * Value type for FreeResponse component
 * Simple string for text content
 */
export type FreeResponseValue = string

/**
 * Value type for MultipleChoice component
 * null = no selection, string = selected option
 */
export type MultipleChoiceValue = string | null

/**
 * Value type for TemperatureCheck component
 * 1-5 = emoji selection, null = no selection
 */
export type TemperatureValue = 1 | 2 | 3 | 4 | 5 | null

/**
 * Value type for Scale component
 * 1-max = selected value, null = no selection
 */
export type ScaleValue = number | null

/**
 * Value type for Checklist component
 * Array of booleans (one per item)
 */
export type ChecklistValue = boolean[]

// ============================================================================
// Error Handling Types
// ============================================================================

/**
 * Result type for size validation
 */
export interface SizeCheckResult {
  /** Whether the value is within the 50KB limit */
  ok: boolean

  /** Size in bytes of the JSON-serialized value */
  size: number
}

/**
 * Error thrown when duplicate component IDs are detected
 */
export class DuplicateComponentIdError extends Error {
  constructor(id: string) {
    super(`Component ID "${id}" is already in use in this codelab`)
    this.name = 'DuplicateComponentIdError'
  }
}

/**
 * Error thrown when a component is missing required props
 */
export class MissingPropsError extends Error {
  constructor(componentName: string, missingProps: string[]) {
    super(
      `${componentName} is missing required props: ${missingProps.join(', ')}`
    )
    this.name = 'MissingPropsError'
  }
}

// ============================================================================
// Component Registry (for ID conflict detection)
// ============================================================================

/**
 * ComponentRegistry Interface
 *
 * React Context value that tracks active component IDs.
 * Used to detect duplicate IDs at runtime (FR-027).
 */
export interface ComponentRegistry {
  /** Set of currently mounted component IDs */
  activeIds: Set<string>
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for validating InteractiveState structure
 */
export type IsInteractiveState = <T>(
  data: unknown,
  valueValidator: (value: unknown) => value is T
) => data is InteractiveState<T>

/**
 * Type guard for FreeResponseValue
 */
export type IsFreeResponseValue = (value: unknown) => value is FreeResponseValue

/**
 * Type guard for MultipleChoiceValue
 */
export type IsMultipleChoiceValue = (value: unknown) => value is MultipleChoiceValue

/**
 * Type guard for TemperatureValue
 */
export type IsTemperatureValue = (value: unknown) => value is TemperatureValue

/**
 * Type guard for ScaleValue
 */
export type IsScaleValue = (value: unknown, max: number) => value is ScaleValue

/**
 * Type guard for ChecklistValue
 */
export type IsChecklistValue = (value: unknown) => value is ChecklistValue

// ============================================================================
// Utility Types
// ============================================================================

/**
 * localStorage wrapper with error handling
 */
export interface SafeStorage {
  /**
   * Safely get item from localStorage
   * @returns Parsed value or null if not found/invalid
   */
  getItem<T>(key: string): T | null

  /**
   * Safely set item to localStorage
   * @returns true if successful, false if quota exceeded or storage disabled
   */
  setItem<T>(key: string, value: T): boolean

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): void
}

// ============================================================================
// Temperature Check Mapping
// ============================================================================

/**
 * Semantic mapping for TemperatureCheck emoji values
 */
export const TEMPERATURE_LABELS = {
  1: { emoji: '😕', label: 'Confused' },
  2: { emoji: '🤔', label: 'Thinking' },
  3: { emoji: '😐', label: 'Okay' },
  4: { emoji: '😊', label: 'Happy' },
  5: { emoji: '🤩', label: 'Starstruck' },
} as const

export type TemperatureLabel = typeof TEMPERATURE_LABELS[keyof typeof TEMPERATURE_LABELS]

// ============================================================================
// Configuration Constants
// ============================================================================

/**
 * Maximum allowed size for a single component's state (50KB)
 */
export const MAX_STATE_SIZE_BYTES = 50 * 1024

/**
 * Debounce delay for auto-save (milliseconds)
 */
export const AUTO_SAVE_DEBOUNCE_MS = 500

/**
 * Storage schema version
 */
export const STORAGE_VERSION = '1.0'

/**
 * Storage key prefix for codelab-scoped data
 */
export const STORAGE_KEY_PREFIX = 'codelab'
