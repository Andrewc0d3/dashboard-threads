// src/supabase.js
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://gizbmvpeziypecmxmmsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpemJtdnBleml5cGVjbXhtbXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Mzk5OTIsImV4cCI6MjA3OTUxNTk5Mn0.yIaO_bQfbot5UGLSjHuhvtiBa44nlvQMd6An81eVwMs';
export const supabase = createClient(supabaseUrl, supabaseKey);