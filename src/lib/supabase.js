import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xeziherrnomjgjzdxltk.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlemloZXJybm9tamdqemR4bHRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODI0OTcsImV4cCI6MjA4OTM1ODQ5N30.lDOA2OYmZgQxcgUnjxtCqwlD60Il7Zg4OdcBt3PTSkw'

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY)
