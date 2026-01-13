import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

interface DialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'destructive' | 'success' | 'warning';
  icon?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface DialogContextType {
  showDialog: (options: DialogOptions) => Promise<boolean>;
  showConfirm: (title: string, message: string, onConfirm?: () => void | Promise<void>) => Promise<boolean>;
  showDestructive: (title: string, message: string, onConfirm?: () => void | Promise<void>) => Promise<boolean>;
  showSuccess: (title: string, message: string, onConfirm?: () => void | Promise<void>) => void;
  showWarning: (title: string, message: string, onConfirm?: () => void | Promise<void>) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [dialogOptions, setDialogOptions] = useState<DialogOptions>({
    title: '',
    message: '',
  });
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const showDialog = useCallback((options: DialogOptions): Promise<boolean> => {
    setDialogOptions(options);
    setVisible(true);

    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const showConfirm = useCallback(
    (title: string, message: string, onConfirm?: () => void | Promise<void>): Promise<boolean> => {
      return showDialog({
        title,
        message,
        type: 'default',
        onConfirm,
      });
    },
    [showDialog]
  );

  const showDestructive = useCallback(
    (title: string, message: string, onConfirm?: () => void | Promise<void>): Promise<boolean> => {
      return showDialog({
        title,
        message,
        type: 'destructive',
        onConfirm,
      });
    },
    [showDialog]
  );

  const showSuccess = useCallback(
    (title: string, message: string, onConfirm?: () => void | Promise<void>) => {
      showDialog({
        title,
        message,
        type: 'success',
        confirmText: 'OK',
        cancelText: '',
        onConfirm,
      });
    },
    [showDialog]
  );

  const showWarning = useCallback(
    (title: string, message: string, onConfirm?: () => void | Promise<void>) => {
      showDialog({
        title,
        message,
        type: 'warning',
        onConfirm,
      });
    },
    [showDialog]
  );

  const handleConfirm = useCallback(async () => {
    setVisible(false);
    
    if (dialogOptions.onConfirm) {
      await dialogOptions.onConfirm();
    }
    
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
  }, [dialogOptions, resolvePromise]);

  const handleCancel = useCallback(() => {
    setVisible(false);
    
    if (dialogOptions.onCancel) {
      dialogOptions.onCancel();
    }
    
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
  }, [dialogOptions, resolvePromise]);

  return (
    <DialogContext.Provider
      value={{
        showDialog,
        showConfirm,
        showDestructive,
        showSuccess,
        showWarning,
      }}
    >
      {children}
      <ConfirmDialog
        visible={visible}
        title={dialogOptions.title}
        message={dialogOptions.message}
        confirmText={dialogOptions.confirmText}
        cancelText={dialogOptions.cancelText}
        type={dialogOptions.type}
        icon={dialogOptions.icon}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within DialogProvider');
  }
  return context;
};
