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

  // ─── SERVICE REQUESTS ──────────────────────────────────────────────────────

  async getServiceRequests() {
    const { data, error } = await supabase
      .from('service_requests')
      .select('*, athlete:athlete_id(name, avatar, sport, location)')
      .order('created_at', { ascending: false })
    return { data: data || [], error }
  },

  async createServiceRequest(request) {
    const { data, error } = await supabase
      .from('service_requests')
      .insert(request)
      .select()
      .single()
    return { data, error }
  },

  async notifyProfessionals(category, city, state, message, requestId) {
    const { data: professionals } = await supabase
      .from('profiles')
      .select('id, location')
      .eq('role', 'profissional')

    const matching = (professionals || []).filter(p => {
      if (!p.location) return true
      const loc = p.location.toLowerCase()
      const cityMatch = city ? loc.includes(city.toLowerCase()) : false
      const stateMatch = state ? loc.includes(state.toLowerCase()) : false
      return cityMatch || stateMatch
    })

    if (matching.length === 0) return { count: 0 }

    const notifications = matching.map(p => ({
      user_id: p.id,
      type: 'service_request',
      title: `Nova solicitação: ${category}`,
      message,
      data: { request_id: requestId },
    }))

    await supabase.from('notifications').insert(notifications)
    return { count: matching.length }
  },

  // ─── NOTIFICATIONS ─────────────────────────────────────────────────────────

  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)
    return { data: data || [], error }
  },

  async markNotificationsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    return { error }
  },

  // ─── ATHLETE POSTS ─────────────────────────────────────────────────────────

  async getPostsByAuthor(authorId) {
    const { data, error } = await supabase
      .from('feed_posts')
      .select('*, author:author_id(name, avatar, sport)')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false })
      .limit(20)
    return { data: (data || []).map(p => ({
      ...p,
      author: p.author?.name || 'Anônimo',
      avatar: p.author?.avatar || '🏅',
      sport: p.author?.sport || '',
      time: timeAgo(p.created_at),
    })), error }
  },

  // Companies
  async getCompanies() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'empresa')
      .order('followers', { ascending: false })
    return { data: data || [], error }
  },

  // Comments
  async getComments(postId) {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*, author:author_id(name, avatar)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    return { data: data || [], error }
  },
  async createComment(postId, authorId, content) {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, author_id: authorId, content })
      .select('*, author:author_id(name, avatar)')
      .single()
    return { data, error }
  },

  // Athlete results
  async getAthleteResults(athleteId) {
    const { data, error } = await supabase
      .from('athlete_results')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('event_date', { ascending: false })
    return { data: data || [], error }
  },
  async addAthleteResult(result) {
    const { data, error } = await supabase
      .from('athlete_results')
      .insert(result)
      .select()
      .single()
    return { data, error }
  },
  async deleteAthleteResult(id) {
    const { error } = await supabase.from('athlete_results').delete().eq('id', id)
    return { error }
  },

  // Messages
  async getConversations(userId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:sender_id(id, name, avatar, role), receiver:receiver_id(id, name, avatar, role)')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    // Dedupe by conversation partner
    const seen = new Set()
    const convs = []
    for (const m of (data || [])) {
      const otherId = m.sender_id === userId ? m.receiver_id : m.sender_id
      const other = m.sender_id === userId ? m.receiver : m.sender
      if (!seen.has(otherId)) {
        seen.add(otherId)
        convs.push({ ...m, other, otherId, unread: !m.read && m.receiver_id === userId })
      }
    }
    return { data: convs, error }
  },
  async getMessages(userId, otherId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true })
    if (data) {
      await supabase.from('messages').update({ read: true })
        .eq('receiver_id', userId).eq('sender_id', otherId).eq('read', false)
    }
    return { data: data || [], error }
  },
  async sendMessage(senderId, receiverId, content) {
    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: senderId, receiver_id: receiverId, content })
      .select()
      .single()
    return { data, error }
  },
  async getUnreadMessageCount(userId) {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false)
    return count || 0
  },
}
