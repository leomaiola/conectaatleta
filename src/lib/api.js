import { supabase } from './supabase'

// ─── Normalizers ─────────────────────────────────────────────────────────────

function normalizePost(p) {
  if (!p) return p
  return {
    ...p,
    author: p.author?.name || 'Anônimo',
    avatar: p.author?.avatar || '🏅',
    sport: p.author?.sport || '',
    time: timeAgo(p.created_at),
  }
}

function normalizeSponsorship(s) {
  if (!s) return s
  return {
    ...s,
    athlete: s.athlete?.name || 'Atleta',
    sponsor: s.sponsor?.name || 'Patrocinador',
  }
}

function normalizeCampaign(c) {
  if (!c) return c
  return {
    ...c,
    athlete: c.athlete?.name || 'Atleta',
    avatar: c.athlete?.avatar || '🏅',
  }
}

function normalizeService(s) {
  if (!s) return s
  return {
    ...s,
    provider: s.provider?.name || 'Profissional',
    avatar: s.avatar || '🩺',
    reviews: s.reviews || 0,
  }
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime())
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  return `${Math.floor(hours / 24)}d atrás`
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const api = {
  async signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password })
  },

  async signUp(email, password) {
    return supabase.auth.signUp({ email, password })
  },

  async signOut() {
    return supabase.auth.signOut()
  },

  async getSession() {
    return supabase.auth.getSession()
  },

  // ─── PROFILE ───────────────────────────────────────────────────────────────

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async createProfile(profile) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })
      .select()
      .single()
    return { data, error }
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // ─── ATHLETES ──────────────────────────────────────────────────────────────

  async getAthletes() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'atleta')
      .order('followers', { ascending: false })
    return { data: data || [], error }
  },

  // ─── FEED ──────────────────────────────────────────────────────────────────

  async getFeedPosts() {
    const { data, error } = await supabase
      .from('feed_posts')
      .select('*, author:author_id(name, avatar, sport)')
      .order('created_at', { ascending: false })
      .limit(50)
    return { data: (data || []).map(normalizePost), error }
  },

  async createPost(authorId, content) {
    const { data, error } = await supabase
      .from('feed_posts')
      .insert({ author_id: authorId, content, likes: 0 })
      .select('*, author:author_id(name, avatar, sport)')
      .single()
    return { data: normalizePost(data), error }
  },

  async updatePostLikes(postId, newLikes) {
    const { error } = await supabase
      .from('feed_posts')
      .update({ likes: Math.max(0, newLikes) })
      .eq('id', postId)
    return { error }
  },

  // ─── SPONSORSHIPS ──────────────────────────────────────────────────────────

  async getSponsorships() {
    const { data, error } = await supabase
      .from('sponsorships')
      .select('*, athlete:athlete_id(name, avatar, sport), sponsor:sponsor_id(name)')
      .order('created_at', { ascending: false })
    return { data: (data || []).map(normalizeSponsorship), error }
  },

  async createSponsorship(sponsorship) {
    const { data, error } = await supabase
      .from('sponsorships')
      .insert(sponsorship)
      .select('*, athlete:athlete_id(name, avatar, sport), sponsor:sponsor_id(name)')
      .single()
    return { data: normalizeSponsorship(data), error }
  },

  // ─── CAMPAIGNS ─────────────────────────────────────────────────────────────

  async getCampaigns() {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, athlete:athlete_id(name, avatar)')
      .order('created_at', { ascending: false })
    return { data: (data || []).map(normalizeCampaign), error }
  },

  async createCampaign(campaign) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaign)
      .select('*, athlete:athlete_id(name, avatar)')
      .single()
    return { data: normalizeCampaign(data), error }
  },

  async donate(campaignId, amount) {
    // Fetch current raised
    const { data: camp } = await supabase
      .from('campaigns')
      .select('raised')
      .eq('id', campaignId)
      .single()
    const newRaised = (camp?.raised || 0) + Number(amount)
    const { error } = await supabase
      .from('campaigns')
      .update({ raised: newRaised })
      .eq('id', campaignId)
    // Record donation
    await supabase.from('donations').insert({ campaign_id: campaignId, amount: Number(amount) })
    return { newRaised, error }
  },

  // ─── SERVICES ──────────────────────────────────────────────────────────────

  async getServices() {
    const { data, error } = await supabase
      .from('services')
      .select('*, provider:provider_id(name, avatar)')
      .order('rating', { ascending: false })
    return { data: (data || []).map(normalizeService), error }
  },

  async createService(service) {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select('*, provider:provider_id(name, avatar)')
      .single()
    return { data: normalizeService(data), error }
  },

  // ─── BOOKINGS ──────────────────────────────────────────────────────────────

  async createBooking(booking) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single()
    return { data, error }
  },

  // ─── FOLLOWS ───────────────────────────────────────────────────────────────

  async getFollowing(userId) {
    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)
    return { data: (data || []).map(f => f.following_id), error }
  },

  async followUser(followerId, followingId) {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId })
    if (!error) {
      const { data: p } = await supabase.from('profiles').select('followers').eq('id', followingId).single()
      await supabase.from('profiles').update({ followers: (p?.followers || 0) + 1 }).eq('id', followingId)
    }
    return { error }
  },

  async unfollowUser(followerId, followingId) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
    if (!error) {
      const { data: p } = await supabase.from('profiles').select('followers').eq('id', followingId).single()
      await supabase.from('profiles').update({ followers: Math.max(0, (p?.followers || 0) - 1) }).eq('id', followingId)
    }
    return { error }
  },
}
