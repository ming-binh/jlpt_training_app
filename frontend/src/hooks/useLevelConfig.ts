import { useEffect, useState, useCallback } from 'react';
import { levelConfigService, type JlptLevelConfig } from '@/services/levelConfig.service';

const DEFAULT_CONFIGS: JlptLevelConfig[] = [
  { id: 1, level: 'N5', name: 'JLPT N5 (Sơ cấp 1)', description: 'Sơ cấp 1 cơ bản', enabled: true, orderIndex: 1 },
  { id: 2, level: 'N4', name: 'JLPT N4 (Sơ cấp 2)', description: 'Sơ cấp 2 nâng cao', enabled: true, orderIndex: 2 },
  { id: 3, level: 'N3', name: 'JLPT N3 (Trung cấp)', description: 'Trung cấp', enabled: true, orderIndex: 3 },
  { id: 4, level: 'N2', name: 'JLPT N2 (Trung - Cao cấp)', description: 'Đang hoàn thiện dữ liệu', enabled: false, orderIndex: 4 },
  { id: 5, level: 'N1', name: 'JLPT N1 (Cao cấp)', description: 'Đang hoàn thiện dữ liệu', enabled: false, orderIndex: 5 },
];

let cachedConfigs: JlptLevelConfig[] | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function useLevelConfig() {
  const [configs, setConfigs] = useState<JlptLevelConfig[]>(cachedConfigs || DEFAULT_CONFIGS);
  const [loading, setLoading] = useState(!cachedConfigs);

  const fetchConfigs = useCallback(async () => {
    try {
      const data = await levelConfigService.getPublicConfigs();
      if (Array.isArray(data) && data.length > 0) {
        cachedConfigs = data;
        setConfigs(data);
        notifyListeners();
      }
    } catch {
      // Fallback to default
      if (!cachedConfigs) {
        setConfigs(DEFAULT_CONFIGS);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cachedConfigs) {
      fetchConfigs();
    }

    const handleChange = () => {
      if (cachedConfigs) {
        setConfigs(cachedConfigs);
      }
    };

    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, [fetchConfigs]);

  const activeLevels = configs.filter((c) => c.enabled).map((c) => c.level.toUpperCase());

  const isLevelActive = useCallback(
    (level: string | null | undefined): boolean => {
      if (!level || level.toLowerCase() === 'all') return true;
      const upper = level.toUpperCase();
      const cfg = configs.find((c) => c.level.toUpperCase() === upper);
      return cfg ? Boolean(cfg.enabled) : true;
    },
    [configs]
  );

  return {
    configs,
    activeLevels,
    isLevelActive,
    loading,
    refresh: fetchConfigs,
  };
}
