// DOM scanning and field candidate extraction for Local-Fill
// Analyzes form elements and extracts field candidates with metadata

export interface FieldCandidate {
  id: string;
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  selector: string;
  label: string | undefined;
  placeholder: string | undefined;
  name: string | undefined;
  type: string | undefined;
  value: string;
  isRequired: boolean;
  isVisible: boolean;
  boundingRect: DOMRect;
  attributes: Record<string, string>;
}

export interface ScanOptions {
  includeHidden?: boolean;
  includeDisabled?: boolean;
  maxDepth?: number;
  shadowDOM?: boolean;
  iframes?: boolean;
}

export class DOMScanner {
  private candidates: FieldCandidate[] = [];
  private scanId = 0;

  /**
   * Scan the current page for form field candidates
   */
  async scanPage(options: ScanOptions = {}): Promise<FieldCandidate[]> {
    const {
      includeHidden = false,
      includeDisabled = false,
      maxDepth = 10,
      shadowDOM: _shadowDOM = false,
      iframes = false
    } = options;

    this.candidates = [];
    this.scanId++;

    // Scan main document
    await this.scanDocument(document, maxDepth, _shadowDOM, includeHidden, includeDisabled);

    // Scan same-origin iframes if enabled
    if (iframes) {
      await this.scanIframes(includeHidden, includeDisabled, maxDepth, _shadowDOM);
    }

    return [...this.candidates];
  }

  /**
   * Scan a specific container for form fields
   */
  async scanContainer(
    container: Document | Element,
    options: ScanOptions = {}
  ): Promise<FieldCandidate[]> {
    const {
      includeHidden = false,
      includeDisabled = false,
      maxDepth = 10,
      shadowDOM: _shadowDOM = false
    } = options;

    this.candidates = [];
    this.scanId++;

    await this.scanDocument(container, maxDepth, _shadowDOM, includeHidden, includeDisabled);
    return [...this.candidates];
  }

  private async scanDocument(
    doc: Document | Element,
    maxDepth: number,
    _shadowDOM: boolean,
    includeHidden: boolean,
    includeDisabled: boolean
  ): Promise<void> {
    const root = doc instanceof Document ? doc.body : doc;
    if (!root) return;

    // Find all form elements
    const formElements = this.findFormElements(root, includeHidden, includeDisabled);
    
    for (const element of formElements) {
      const candidate = await this.createFieldCandidate(element, _shadowDOM);
      if (candidate) {
        this.candidates.push(candidate);
      }
    }

    // Scan shadow DOM if enabled
    if (_shadowDOM) {
      await this.scanShadowDOM(root, maxDepth, includeHidden, includeDisabled);
    }
  }

  private findFormElements(
    container: Element,
    includeHidden: boolean,
    includeDisabled: boolean
  ): (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[] {
    const selectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="tel"]',
      'input[type="url"]',
      'input[type="search"]',
      'input[type="password"]',
      'input[type="number"]',
      'input:not([type])', // inputs without type default to text
      'textarea',
      'select'
    ];

    const elements: (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[] = [];
    
    for (const selector of selectors) {
      const found = container.querySelectorAll(selector);
      for (const element of Array.from(found)) {
        const input = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        
        // Skip if hidden and not including hidden
        if (!includeHidden && !this.isElementVisible(input)) {
          continue;
        }
        
        // Skip if disabled and not including disabled
        if (!includeDisabled && input.disabled) {
          continue;
        }

        elements.push(input);
      }
    }

    return elements;
  }

  private async createFieldCandidate(
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    _shadowDOM: boolean
  ): Promise<FieldCandidate | null> {
    try {
      const id = this.generateCandidateId(element);
      const selector = this.generateSelector(element);
      const label = this.extractLabel(element);
      const placeholder = element.getAttribute('placeholder') ?? undefined;
      const name = element.getAttribute('name') ?? undefined;
      const type = element.getAttribute('type') ?? undefined;
      const value = this.getElementValue(element);
      const isRequired = element.hasAttribute('required') || 
                        element.getAttribute('aria-required') === 'true';
      const isVisible = this.isElementVisible(element);
      const boundingRect = element.getBoundingClientRect();
      const attributes = this.extractAttributes(element);

      return {
        id,
        element,
        selector,
        label,
        placeholder,
        name,
        type,
        value,
        isRequired,
        isVisible,
        boundingRect,
        attributes
      };
    } catch (error) {
      console.warn('Failed to create field candidate:', error);
      return null;
    }
  }

  private generateCandidateId(element: Element): string {
    // Try to use a stable ID
    const id = element.id;
    if (id) return id;

    const name = element.getAttribute('name');
    if (name) return `name-${name}`;

    // Generate a selector-based ID
    const selector = this.generateSelector(element);
    return `candidate-${this.scanId}-${this.hashString(selector)}`;
  }

  private generateSelector(element: Element): string {
    // Try to build a unique selector
    const path: string[] = [];
    let current: Element | null = element;

    while (current && current !== document.body && path.length < 5) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `#${current.id}`;
        path.unshift(selector);
        break;
      }
      
      if (current.className) {
        const classes = current.className.trim().split(/\s+/).filter(Boolean);
        if (classes.length > 0) {
          selector += `.${classes.join('.')}`;
        }
      }
      
      // Add attributes that might be unique
      const name = current.getAttribute('name');
      if (name) {
        selector += `[name="${name}"]`;
      }
      
      const type = current.getAttribute('type');
      if (type) {
        selector += `[type="${type}"]`;
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  }

  private extractLabel(element: Element): string | undefined {
    // Try to find associated label
    const id = element.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) {
        return this.getTextContent(label).trim();
      }
    }

    // Look for parent label
    const parentLabel = element.closest('label');
    if (parentLabel) {
      return this.getTextContent(parentLabel).trim();
    }

    // Look for aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      return ariaLabel.trim();
    }

    // Look for aria-labelledby
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) {
        return this.getTextContent(labelElement).trim();
      }
    }

    // Look for nearby text content
    const nearbyText = this.findNearbyText(element);
    if (nearbyText) {
      return nearbyText.trim();
    }

    return undefined;
  }

  private findNearbyText(element: Element): string | undefined {
    // Look for text in previous siblings
    let sibling = element.previousElementSibling;
    while (sibling && sibling.nodeType === Node.ELEMENT_NODE) {
      const text = this.getTextContent(sibling).trim();
      if (text && text.length < 100) { // Reasonable label length
        return text;
      }
      sibling = sibling.previousElementSibling;
    }

    // Look for text in parent's previous siblings
    const parent = element.parentElement;
    if (parent) {
      sibling = parent.previousElementSibling;
      while (sibling && sibling.nodeType === Node.ELEMENT_NODE) {
        const text = this.getTextContent(sibling).trim();
        if (text && text.length < 100) {
          return text;
        }
        sibling = sibling.previousElementSibling;
      }
    }

    return undefined;
  }

  private getTextContent(element: Element): string {
    // Get text content, excluding nested form elements
    const clone = element.cloneNode(true) as Element;
    const formElements = clone.querySelectorAll('input, textarea, select, button');
    formElements.forEach(el => el.remove());
    
    return clone.textContent || '';
  }

  private getElementValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
    if (element instanceof HTMLSelectElement) {
      return element.value;
    }
    
    if (element instanceof HTMLInputElement) {
      if (element.type === 'checkbox' || element.type === 'radio') {
        return element.checked ? element.value : '';
      }
      return element.value;
    }
    
    return element.value;
  }

  private isElementVisible(element: Element): boolean {
    const style = window.getComputedStyle(element);
    
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }
    
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  private extractAttributes(element: Element): Record<string, string> {
    const attributes: Record<string, string> = {};
    const relevantAttrs = [
      'name', 'id', 'type', 'placeholder', 'aria-label', 'aria-labelledby',
      'aria-describedby', 'data-testid', 'data-qa', 'class'
    ];

    for (const attr of relevantAttrs) {
      const value = element.getAttribute(attr);
      if (value) {
        attributes[attr] = value;
      }
    }

    return attributes;
  }

  private async scanShadowDOM(
    container: Element,
    maxDepth: number,
    includeHidden: boolean,
    includeDisabled: boolean
  ): Promise<void> {
    // Find all elements with shadow roots
    const shadowHosts = container.querySelectorAll('*');
    
    for (const host of Array.from(shadowHosts)) {
      const shadowRoot = (host as any).shadowRoot;
      if (shadowRoot) {
        await this.scanDocument(shadowRoot, maxDepth - 1, true, includeHidden, includeDisabled);
      }
    }
  }

  private async scanIframes(
    includeHidden: boolean,
    includeDisabled: boolean,
    maxDepth: number,
    shadowDOM: boolean
  ): Promise<void> {
    const iframes = document.querySelectorAll('iframe');
    
    for (const iframe of Array.from(iframes)) {
      try {
        // Only scan same-origin iframes
        if (this.isSameOrigin(iframe.src)) {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            await this.scanDocument(iframeDoc, maxDepth, shadowDOM, includeHidden, includeDisabled);
          }
        }
      } catch (error) {
        // Cross-origin iframe, skip silently
        console.debug('Cannot access iframe content:', iframe.src);
      }
    }
  }

  private isSameOrigin(url: string): boolean {
    try {
      const iframeUrl = new URL(url, window.location.href);
      return iframeUrl.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// Export singleton instance
export const domScanner = new DOMScanner();
