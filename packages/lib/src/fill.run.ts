// Autofill execution and event dispatching for Local-Fill
// Handles setting field values and dispatching proper DOM events

import { FieldCandidate } from './dom.scan';
import { FieldMapping } from './rules.engine';

export interface FillOptions {
  delay?: number; // Delay between fills (ms)
  dispatchEvents?: boolean; // Whether to dispatch DOM events
  retryAttempts?: number; // Number of retry attempts for failed fills
  skipValidation?: boolean; // Skip client-side validation
}

export interface FillResult {
  success: boolean;
  filled: number;
  failed: number;
  errors: FillError[];
  timing: {
    startTime: number;
    endTime: number;
    duration: number;
  };
}

export interface FillError {
  fieldId: string;
  error: string;
  details?: any;
}

export interface FillOperation {
  candidate: FieldCandidate;
  mapping: FieldMapping;
  success: boolean;
  error?: string;
  timing: number;
}

export class FillRunner {
  private fillHistory: FillOperation[] = [];
  private isRunning = false;

  /**
   * Execute autofill for a set of field mappings
   */
  async fillFields(
    mappings: FieldMapping[],
    candidates: FieldCandidate[],
    options: FillOptions = {}
  ): Promise<FillResult> {
    const {
      delay = 50,
      dispatchEvents = true,
      retryAttempts = 2,
      skipValidation = false
    } = options;

    if (this.isRunning) {
      throw new Error('Fill operation already in progress');
    }

    this.isRunning = true;
    const startTime = performance.now();
    const errors: FillError[] = [];
    let filled = 0;
    let failed = 0;

    try {
      // Create a map of candidates by ID
      const candidateMap = new Map(candidates.map(c => [c.id, c]));
      
      // Process mappings in order of confidence (highest first)
      const sortedMappings = [...mappings].sort((a, b) => b.confidence - a.confidence);
      
      for (const mapping of sortedMappings) {
        const candidate = candidateMap.get(mapping.id);
        if (!candidate) {
          errors.push({
            fieldId: mapping.id,
            error: 'Candidate not found'
          });
          failed++;
          continue;
        }

        // Skip if this is a conflict and we're not overriding
        if (mapping.isConflict && candidate.value && !skipValidation) {
          continue;
        }

        const operation = await this.fillField(
          candidate,
          mapping,
          {
            dispatchEvents,
            retryAttempts,
            skipValidation
          }
        );

        this.fillHistory.push(operation);

        if (operation.success) {
          filled++;
        } else {
          failed++;
          errors.push({
            fieldId: mapping.id,
            error: operation.error || 'Unknown error'
          });
        }

        // Add delay between fills to avoid overwhelming the page
        if (delay > 0 && sortedMappings.indexOf(mapping) < sortedMappings.length - 1) {
          await this.delay(delay);
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      return {
        success: filled > 0,
        filled,
        failed,
        errors,
        timing: {
          startTime,
          endTime,
          duration
        }
      };

    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Fill a single field
   */
  private async fillField(
    candidate: FieldCandidate,
    mapping: FieldMapping,
    options: {
      dispatchEvents: boolean;
      retryAttempts: number;
      skipValidation: boolean;
    }
  ): Promise<FillOperation> {
    const startTime = performance.now();
    
    try {
      const success = await this.setFieldValue(
        candidate,
        mapping.value,
        options
      );

      const timing = performance.now() - startTime;

      return {
        candidate,
        mapping,
        success,
        timing
      };

    } catch (error) {
      const timing = performance.now() - startTime;
      
      return {
        candidate,
        mapping,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timing
      };
    }
  }

  /**
   * Set the value of a form field with proper event handling
   */
  private async setFieldValue(
    candidate: FieldCandidate,
    value: string,
    options: {
      dispatchEvents: boolean;
      retryAttempts: number;
      skipValidation: boolean;
    }
  ): Promise<boolean> {
    const { element } = candidate;
    
    // Handle different field types
    if (element instanceof HTMLSelectElement) {
      return this.setSelectValue(element, value, options);
    } else if (element instanceof HTMLInputElement) {
      if (element.type === 'checkbox' || element.type === 'radio') {
        return this.setCheckboxValue(element, value, options);
      } else {
        return this.setInputValue(element, value, options);
      }
    } else if (element instanceof HTMLTextAreaElement) {
      return this.setTextareaValue(element, value, options);
    }

    return false;
  }

  private async setInputValue(
    element: HTMLInputElement,
    value: string,
    options: { dispatchEvents: boolean; retryAttempts: number; skipValidation: boolean }
  ): Promise<boolean> {
    try {
      // Store original value for potential rollback
      const originalValue = element.value;
      
      // Clear the field first
      element.value = '';
      if (options.dispatchEvents) {
        this.dispatchEvent(element, 'input');
        this.dispatchEvent(element, 'change');
      }

      // Set the new value
      element.value = value;
      
      // Handle special input types that might need formatting
      if (element.type === 'tel' && value) {
        // Basic phone number formatting
        element.value = this.formatPhoneNumber(value);
      }

      // Dispatch events
      if (options.dispatchEvents) {
        this.dispatchEvent(element, 'input');
        this.dispatchEvent(element, 'change');
        this.dispatchEvent(element, 'blur');
      }

      // Validate the field if validation is enabled
      if (!options.skipValidation && !this.validateField(element)) {
        // Rollback on validation failure
        element.value = originalValue;
        return false;
      }

      return true;

    } catch (error) {
      console.warn('Failed to set input value:', error);
      return false;
    }
  }

  private async setTextareaValue(
    element: HTMLTextAreaElement,
    value: string,
    options: { dispatchEvents: boolean; retryAttempts: number; skipValidation: boolean }
  ): Promise<boolean> {
    try {
      element.value = value;
      
      if (options.dispatchEvents) {
        this.dispatchEvent(element, 'input');
        this.dispatchEvent(element, 'change');
        this.dispatchEvent(element, 'blur');
      }

      return true;

    } catch (error) {
      console.warn('Failed to set textarea value:', error);
      return false;
    }
  }

  private async setSelectValue(
    element: HTMLSelectElement,
    value: string,
    options: { dispatchEvents: boolean; retryAttempts: number; skipValidation: boolean }
  ): Promise<boolean> {
    try {
      // Try to find an option that matches the value
      const options_list = Array.from(element.options);
      let matchingOption = options_list.find(option => 
        option.value === value || 
        option.textContent?.trim() === value
      );

      // If no exact match, try fuzzy matching
      if (!matchingOption) {
        matchingOption = options_list.find(option => 
          option.value.toLowerCase().includes(value.toLowerCase()) ||
          option.textContent?.toLowerCase().includes(value.toLowerCase())
        );
      }

      if (matchingOption) {
        element.value = matchingOption.value;
        
        if (options.dispatchEvents) {
          this.dispatchEvent(element, 'change');
        }

        return true;
      }

      return false;

    } catch (error) {
      console.warn('Failed to set select value:', error);
      return false;
    }
  }

  private async setCheckboxValue(
    element: HTMLInputElement,
    value: string,
    options: { dispatchEvents: boolean; retryAttempts: number; skipValidation: boolean }
  ): Promise<boolean> {
    try {
      const shouldCheck = this.parseBooleanValue(value);
      element.checked = shouldCheck;
      
      if (options.dispatchEvents) {
        this.dispatchEvent(element, 'change');
      }

      return true;

    } catch (error) {
      console.warn('Failed to set checkbox value:', error);
      return false;
    }
  }

  /**
   * Dispatch a DOM event on an element
   */
  private dispatchEvent(element: Element, eventType: string): void {
    try {
      // Create and dispatch the event
      const event = new Event(eventType, {
        bubbles: true,
        cancelable: true
      });

      // For input events, also set the inputType property
      if (eventType === 'input') {
        (event as any).inputType = 'insertText';
      }

      element.dispatchEvent(event);

      // Also trigger any React or other framework handlers
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;

      if (nativeInputValueSetter && eventType === 'input') {
        const inputElement = element as HTMLInputElement;
        nativeInputValueSetter.call(inputElement, inputElement.value);
      }

    } catch (error) {
      console.warn(`Failed to dispatch ${eventType} event:`, error);
    }
  }

  /**
   * Validate a form field
   */
  private validateField(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
    try {
      // Check HTML5 validation
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        return element.checkValidity();
      }

      // For select elements, check if value is valid
      if (element instanceof HTMLSelectElement) {
        return element.value !== '' || !element.required;
      }

      return true;

    } catch (error) {
      // If validation fails, assume it's valid
      return true;
    }
  }

  /**
   * Format phone number for tel input
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Basic formatting for US numbers
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    
    // Return original if can't format
    return phone;
  }

  /**
   * Parse boolean value from string
   */
  private parseBooleanValue(value: string): boolean {
    const normalized = value.toLowerCase().trim();
    return normalized === 'true' || 
           normalized === 'yes' || 
           normalized === '1' || 
           normalized === 'on' ||
           normalized === 'checked';
  }

  /**
   * Undo the last fill operation
   */
  async undoLastFill(): Promise<boolean> {
    if (this.fillHistory.length === 0) {
      return false;
    }

    const lastOperation = this.fillHistory.pop();
    if (!lastOperation || !lastOperation.success) {
      return false;
    }

    try {
      const { candidate } = lastOperation;
      const element = candidate.element;
      
      // Restore original value
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.value = candidate.value;
      } else if (element instanceof HTMLSelectElement) {
        element.value = candidate.value;
      }

      // Dispatch change event
      this.dispatchEvent(element, 'change');

      return true;

    } catch (error) {
      console.warn('Failed to undo fill operation:', error);
      return false;
    }
  }

  /**
   * Clear all filled values
   */
  async clearAllFields(candidates: FieldCandidate[]): Promise<void> {
    for (const candidate of candidates) {
      try {
        const element = candidate.element;
        
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          element.value = '';
          this.dispatchEvent(element, 'input');
          this.dispatchEvent(element, 'change');
        } else if (element instanceof HTMLSelectElement) {
          element.selectedIndex = -1;
          this.dispatchEvent(element, 'change');
        }
      } catch (error) {
        console.warn('Failed to clear field:', error);
      }
    }
  }

  /**
   * Get fill history
   */
  getFillHistory(): ReadonlyArray<FillOperation> {
    return [...this.fillHistory];
  }

  /**
   * Clear fill history
   */
  clearHistory(): void {
    this.fillHistory = [];
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const fillRunner = new FillRunner();
