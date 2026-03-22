import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sb } from '../lib/supabase'

export function useCustomBlocks() {
  return useQuery({
    queryKey: ['custom-blocks'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('minecraft_custom_blocks')
        .select('*')
        .order('created_at')
      if (error) throw error
      return data.map(r => ({ id: r.id, key: r.key, name: r.name, colors: r.colors }))
    },
  })
}

export function useSaveCustomBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ key, name, colors }) => {
      const { data, error } = await sb
        .from('minecraft_custom_blocks')
        .insert({ key, name, colors })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['custom-blocks'] }),
  })
}

export function useDeleteCustomBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (key) => {
      const { error } = await sb
        .from('minecraft_custom_blocks')
        .delete()
        .eq('key', key)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['custom-blocks'] }),
  })
}
