import { useQuery } from '@tanstack/react-query';
import { apiPrivate } from '../api/axios';
import { isProcessing } from './format';
import type { InvoiceSummary, Meta, Vendor } from './types';

/** Invoice list; polls while any document is still being processed. */
export const useInvoices = () =>
  useQuery({
    queryKey: ['invoices'],
    queryFn: async () => (await apiPrivate.get<InvoiceSummary[]>('/invoices')).data,
    refetchInterval: query => (query.state.data?.some(i => isProcessing(i.status)) ? 2500 : false),
  });

export const useVendors = () =>
  useQuery({
    queryKey: ['vendors'],
    queryFn: async () => (await apiPrivate.get<Vendor[]>('/vendors')).data,
  });

export const useMeta = () =>
  useQuery({
    queryKey: ['meta'],
    queryFn: async () => (await apiPrivate.get<Meta>('/meta')).data,
    staleTime: Infinity,
  });
