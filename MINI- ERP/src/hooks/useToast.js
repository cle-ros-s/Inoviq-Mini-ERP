import { useUI } from '../context/UIContext.jsx';

export function useToast() {
  const { showSuccess, showError, showWarning, showInfo } = useUI();
  return { showSuccess, showError, showWarning, showInfo };
}
