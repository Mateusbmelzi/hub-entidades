import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Check, AlertCircle } from 'lucide-react';
import { 
  formatDateTimeInput, 
  validateDateTime, 
  getDateTimeSuggestions,
  convertToDateTimeLocal,
  convertFromDateTimeLocal
} from '@/lib/datetime-input-utils';

interface DateTimeInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  error?: string;
}

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = "Ex: 25/12/2024 14:30",
  className = "",
  required = false,
  error: externalError
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [internalError, setInternalError] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Atualizar valor interno quando prop value mudar
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Validar em tempo real
  useEffect(() => {
    if (inputValue) {
      const validation = validateDateTime(inputValue);
      setIsValid(validation.isValid);
      setInternalError(validation.isValid ? '' : validation.message || '');
    } else {
      setIsValid(false);
      setInternalError('');
    }
  }, [inputValue]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatDateTimeInput(rawValue);
    
    setInputValue(formattedValue);
    onChange(formattedValue);
    
    // Atualizar sugestões
    const newSuggestions = getDateTimeSuggestions(formattedValue);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0 && formattedValue.length < 16);
  }, [onChange]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, [onChange]);

  const handleFocus = useCallback(() => {
    const newSuggestions = getDateTimeSuggestions(inputValue);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0 && inputValue.length < 16);
  }, [inputValue]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Não esconder sugestões se clicou em uma sugestão
    if (suggestionsRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, []);

  const error = externalError || internalError;

  return (
    <div className="space-y-2 relative">
      {label && (
        <Label htmlFor={id} className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`pr-10 ${className} ${
            error ? 'border-red-500 focus:border-red-500' : 
            isValid && inputValue ? 'border-green-500 focus:border-green-500' : ''
          }`}
          required={required}
        />
        
        {/* Ícone de status */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {inputValue && (
            isValid ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )
          )}
          {!inputValue && (
            <Clock className="w-4 h-4 text-gray-400" />
          )}
        </div>

        {/* Sugestões */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            <div className="p-2 text-xs text-gray-500 border-b">
              Sugestões (clique para selecionar):
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0 transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  {suggestion}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}

      {/* Dica de formato */}
      {!error && !inputValue && (
        <div className="text-xs text-gray-500">
          Digite a data e hora: DD/MM/AAAA HH:MM
        </div>
      )}

      {/* Status de validação */}
      {isValid && inputValue && !error && (
        <div className="flex items-center gap-1 text-sm text-green-600">
          <Check className="w-3 h-3" />
          Data e hora válidas
        </div>
      )}
    </div>
  );
};
