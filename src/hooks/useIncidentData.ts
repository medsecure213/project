import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useIncidentData() {
  const [incidents, setIncidents] = useState<any[]>([])

  useEffect(() => {
    fetchIncidents()

    const channel = supabase.channel('public:alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, (payload) => {
        // refresh data when new alert is inserted/updated
        fetchIncidents()
      })
      .subscribe()

    return () => {
      try {
        supabase.removeChannel(channel)
      } catch (e) {
        // ignore if removal fails
      }
    }
  }, [])

  async function fetchIncidents() {
    const { data, error } = await supabase.from('alerts').select('*').order('timestamp', { ascending: false })
    if (!error && data) setIncidents(data)
  }

  return { incidents }
}
