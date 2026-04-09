/**
 * Shared hook for fetching produce listings from /api/produce.
 * Falls back to static data if the API is unavailable.
 */
import { useState, useEffect } from 'react';
import type { Produce } from '@/data/produce';
import { produceData, dairyData } from '@/data/produce';

const STATIC_FALLBACK = [...produceData, ...dairyData];

export interface UseProduceOptions {
  category?: string;
  exportReady?: boolean;
}

export interface UseProduceResult {
  items: Produce[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProduce(options: UseProduceOptions = {}): UseProduceResult {
  const [items, setItems] = useState<Produce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const { category, exportReady } = options;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (exportReady) params.set('exportReady', 'true');

    fetch(`/api/produce?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Produce[]) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        // Graceful fallback to static data
        if (!cancelled) {
          let fallback = STATIC_FALLBACK;
          if (category && category !== 'All') {
            fallback = fallback.filter((i) => i.category === category);
          }
          if (exportReady) {
            fallback = fallback.filter((i) => i.exportReady);
          }
          setItems(fallback);
          setError(null); // silent fallback — don't show error to user
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [category, exportReady, tick]);

  return { items, loading, error, refetch: () => setTick((t) => t + 1) };
}

/** Fetch a single listing by id */
export async function fetchProduceListing(id: string): Promise<Produce | null> {
  try {
    const r = await fetch(`/api/produce/${id}`);
    if (!r.ok) return null;
    return r.json();
  } catch {
    return STATIC_FALLBACK.find((i) => i.id === id) ?? null;
  }
}
