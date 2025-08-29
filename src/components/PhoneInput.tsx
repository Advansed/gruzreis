// PhoneInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { IonInput } from '@ionic/react';
import { Maskito } from '@maskito/core';

interface PhoneInputProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onKeyPress?: (event: React.KeyboardEvent) => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value = '',
  onValueChange,
  placeholder = "+7 (___) ___-__-__",
  disabled = false,
  className = '',
  onKeyPress
}) => {
  const [phone, setPhone] = useState(value);
  const phoneInputRef = useRef<HTMLIonInputElement>(null);
  const maskitoRef = useRef<Maskito | null>(null);

  // Инициализация Maskito для телефона
  useEffect(() => {
    const initMaskito = async () => {
      if (phoneInputRef.current && !maskitoRef.current) {
        try {
          // Получаем нативный input элемент из IonInput
          const inputElement = await phoneInputRef.current.getInputElement();
          
          if (inputElement) {
            // Кастомная маска для российского номера +7 (XXX) XXX-XX-XX
            const customMask = [
              '+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/
            ];

            // Инициализируем Maskito с кастомными настройками
            maskitoRef.current = new Maskito(inputElement, {
              mask: customMask,
              preprocessors: [
                // Предобработчик для нормализации ввода
                ({ elementState, data }) => {
                  const { value, selection } = elementState;
                  
                  // Если пользователь начинает вводить с 8 или без +7
                  if (data === '8' && value === '') {
                    return {
                      elementState: {
                        value: '+7 (',
                        selection: [4, 4] // Курсор после +7 (
                      },
                      data: ''
                    };
                  }
                  
                  // Если вводят цифру в пустое поле, добавляем +7 (
                  if (/\d/.test(data) && value === '') {
                    return {
                      elementState: {
                        value: '+7 (',
                        selection: [4, 4]
                      },
                      data
                    };
                  }

                  return { elementState, data };
                }
              ],
              postprocessors: [
                // Постобработчик для корректировки результата
                ({ value, selection }) => {
                  // Если значение короче минимального, оставляем как есть
                  if (value.length < 4) {
                    return { value: '+7 (', selection: [4, 4] };
                  }
                  
                  return { value, selection };
                }
              ],
              overwriteMode: 'replace' // Режим замещения
            });

            // Устанавливаем начальное значение если нужно
            if (phone && !phone.startsWith('+7')) {
              const cleanPhone = phone.replace(/\D/g, '');
              if (cleanPhone) {
                let formattedPhone = '+7 (';
                if (cleanPhone.length > 1) {
                  const digits = cleanPhone.startsWith('7') ? cleanPhone.slice(1) : cleanPhone;
                  for (let i = 0; i < digits.length && i < 10; i++) {
                    if (i === 3) formattedPhone += ') ';
                    else if (i === 6) formattedPhone += '-';
                    else if (i === 8) formattedPhone += '-';
                    formattedPhone += digits[i];
                  }
                }
                setPhone(formattedPhone);
              }
            }
          }
        } catch (error) {
          console.error('Ошибка инициализации Maskito:', error);
        }
      }
    };

    initMaskito();

    // Cleanup при размонтировании
    return () => {
      if (maskitoRef.current) {
        maskitoRef.current.destroy();
        maskitoRef.current = null;
      }
    };
  }, []);

  // Синхронизация с внешним значением
  useEffect(() => {
    setPhone(value);
  }, [value]);

  const handlePhoneInput = (event: CustomEvent) => {
    const newValue = event.detail.value || '';
    setPhone(newValue);
    
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <IonInput
      ref={phoneInputRef}
      value={phone}
      onIonInput={handlePhoneInput}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      type="tel"
      disabled={disabled}
      className={className}
    />
  );
};

// Утилитарные функции для работы с номером
export const getCleanPhone = (formattedPhone: string): string => {
  return formattedPhone.replace(/\D/g, '');
};

export const isPhoneValid = (phone: string): boolean => {
  const clean = getCleanPhone(phone);
  return clean.length === 11 && clean.startsWith('7');
};

export default PhoneInput;