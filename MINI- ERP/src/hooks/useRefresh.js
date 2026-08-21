import { useErpData } from '../context/ErpDataContext.jsx';

export function useRefresh() {
  const { triggerRefresh, refreshCounter } = useErpData();
  return { triggerRefresh, refreshCounter };
}
