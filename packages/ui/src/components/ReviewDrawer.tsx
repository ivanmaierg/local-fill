import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';

export interface FieldMapping {
  id: string;
  field: string;
  selector: string;
  label?: string;
  placeholder?: string;
  value: string;
  confidence: number;
  isMapped: boolean;
  isConflict?: boolean;
  originalValue?: string;
}

export interface ReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onUndo: () => void;
  onEditMapping: (mappingId: string, newField: string) => void;
  fieldMappings: FieldMapping[];
  profileName: string;
  domain: string;
  className?: string;
}

export const ReviewDrawer: React.FC<ReviewDrawerProps> = ({
  isOpen,
  onClose,
  onApply,
  onUndo,
  onEditMapping,
  fieldMappings,
  profileName,
  domain,
  className = ''
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempFieldValue, setTempFieldValue] = useState<string>('');

  const mappedFields = fieldMappings.filter(mapping => mapping.isMapped && !mapping.isConflict);
  const unmappedFields = fieldMappings.filter(mapping => !mapping.isMapped);
  const conflictFields = fieldMappings.filter(mapping => mapping.isConflict);

  const handleEditStart = (mappingId: string, currentField: string) => {
    setEditingField(mappingId);
    setTempFieldValue(currentField);
  };

  const handleEditSave = (mappingId: string) => {
    onEditMapping(mappingId, tempFieldValue);
    setEditingField(null);
    setTempFieldValue('');
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setTempFieldValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, mappingId: string) => {
    if (e.key === 'Enter') {
      handleEditSave(mappingId);
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden ${className}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Review Autofill</h2>
              <p className="text-sm text-gray-500">{domain}</p>
              <p className="text-xs text-gray-400">Profile: {profileName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
              aria-label="Close review panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{mappedFields.length}</div>
                <div className="text-xs text-gray-500">Mapped</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-yellow-600">{unmappedFields.length}</div>
                <div className="text-xs text-gray-500">Unmapped</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-red-600">{conflictFields.length}</div>
                <div className="text-xs text-gray-500">Conflicts</div>
              </Card>
            </div>

            {/* Mapped Fields */}
            {mappedFields.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Mapped Fields ({mappedFields.length})
                </h3>
                <div className="space-y-2">
                  {mappedFields.map((mapping) => (
                    <Card key={mapping.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center mb-1">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {mapping.label || mapping.placeholder || 'Unlabeled field'}
                            </span>
                            <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                              {Math.round(mapping.confidence * 100)}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mb-1">
                            Field: {mapping.field}
                          </div>
                          <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded border">
                            {mapping.value}
                          </div>
                        </div>
                        <button
                          onClick={() => handleEditStart(mapping.id, mapping.field)}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                          aria-label="Edit field mapping"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                      
                      {editingField === mapping.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <Input
                            label="Map to profile field:"
                            value={tempFieldValue}
                            onChange={(e) => setTempFieldValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, mapping.id)}
                            placeholder="e.g., basics.email"
                            className="text-sm"
                          />
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleEditSave(mapping.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleEditCancel}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Unmapped Fields */}
            {unmappedFields.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Unmapped Fields ({unmappedFields.length})
                </h3>
                <div className="space-y-2">
                  {unmappedFields.map((mapping) => (
                    <Card key={mapping.id} className="p-3 border-yellow-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {mapping.label || mapping.placeholder || 'Unlabeled field'}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            Selector: {mapping.selector}
                          </div>
                          <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded border">
                            {mapping.originalValue || '(empty)'}
                          </div>
                        </div>
                        <button
                          onClick={() => handleEditStart(mapping.id, '')}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                          aria-label="Map field"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      
                      {editingField === mapping.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <Input
                            label="Map to profile field:"
                            value={tempFieldValue}
                            onChange={(e) => setTempFieldValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, mapping.id)}
                            placeholder="e.g., basics.email"
                            className="text-sm"
                          />
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleEditSave(mapping.id)}
                            >
                              Map Field
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleEditCancel}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Conflict Fields */}
            {conflictFields.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Conflicts ({conflictFields.length})
                </h3>
                <div className="space-y-2">
                  {conflictFields.map((mapping) => (
                    <Card key={mapping.id} className="p-3 border-red-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {mapping.label || mapping.placeholder || 'Unlabeled field'}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            Field: {mapping.field}
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-gray-500">Current value:</div>
                              <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded border">
                                {mapping.originalValue || '(empty)'}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Profile value:</div>
                              <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded border">
                                {mapping.value}
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleEditStart(mapping.id, mapping.field)}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                          aria-label="Edit field mapping"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                      
                      {editingField === mapping.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <Input
                            label="Map to profile field:"
                            value={tempFieldValue}
                            onChange={(e) => setTempFieldValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, mapping.id)}
                            placeholder="e.g., basics.email"
                            className="text-sm"
                          />
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleEditSave(mapping.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleEditCancel}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onUndo}
                className="flex-1"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Undo All
              </Button>
              <Button
                variant="primary"
                onClick={onApply}
                className="flex-1"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
