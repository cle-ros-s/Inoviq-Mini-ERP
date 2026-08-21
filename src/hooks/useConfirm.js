import { useState, useCallback } from 'react';

export function useConfirm() {
  const [config, setConfig] = useState(null);

  const confirm = useCallback((options) => new Promise((resolve) => {
    setConfig({ 
      ...options, 
      onConfirm: () => { setConfig(null); resolve(true); }, 
      onClose: () => { setConfig(null); resolve(false); } 
    });
  }), []);

  return { confirm, config };
}
