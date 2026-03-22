import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sb } from '../lib/supabase'

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('minecraft_builds')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data.map(r => ({ id: r.id, name: r.name, state: r.state }))
    },
  })
}

export function useSaveTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, state }) => {
      const { data, error } = await sb
        .from('minecraft_builds')
        .insert({ name, state })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await sb.from('minecraft_builds').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  })
}
