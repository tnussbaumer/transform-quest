import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import type { Announcement } from '../../types/database'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'

interface AnnouncementForm {
  title: string
  body: string
  expires_at: string
}

const emptyForm: AnnouncementForm = { title: '', body: '', expires_at: '' }

export function AnnouncementsManager() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AnnouncementForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setAnnouncements((data ?? []) as Announcement[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  function handleNew() {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setSuccessMsg(null)
    setShowForm(true)
  }

  function handleEdit(a: Announcement) {
    setEditingId(a.id)
    setForm({
      title: a.title,
      body: a.body ?? '',
      expires_at: a.expires_at ? a.expires_at.split('T')[0] : '',
    })
    setError(null)
    setSuccessMsg(null)
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }

    setSaving(true)
    setError(null)
    setSuccessMsg(null)

    const payload = {
      title: form.title.trim(),
      body: form.body.trim() || null,
      expires_at: form.expires_at || null,
      created_by: user?.id ?? null,
    }

    if (editingId) {
      const { error: err } = await supabase
        .from('announcements')
        .update(payload)
        .eq('id', editingId)

      if (err) {
        setError(err.message)
      } else {
        setSuccessMsg('Announcement updated')
        setShowForm(false)
        setEditingId(null)
        setForm(emptyForm)
        fetchAnnouncements()
      }
    } else {
      const { error: err } = await supabase
        .from('announcements')
        .insert({ ...payload, is_active: true })

      if (err) {
        setError(err.message)
      } else {
        setSuccessMsg('Announcement created')
        setShowForm(false)
        setForm(emptyForm)
        fetchAnnouncements()
      }
    }
    setSaving(false)
  }

  async function handleToggleActive(a: Announcement) {
    const { error: err } = await supabase
      .from('announcements')
      .update({ is_active: !a.is_active })
      .eq('id', a.id)

    if (err) {
      setError(err.message)
    } else {
      setAnnouncements(prev =>
        prev.map(item =>
          item.id === a.id ? { ...item, is_active: !item.is_active } : item
        )
      )
    }
  }

  async function handleDelete(id: string) {
    const { error: err } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)

    if (err) {
      setError(err.message)
    } else {
      setAnnouncements(prev => prev.filter(a => a.id !== id))
      setConfirmDeleteId(null)
      setSuccessMsg('Announcement deleted')
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Announcements</h2>
        {!showForm && (
          <Button onClick={handleNew}>
            <Plus className="w-4 h-4" />
            New
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-tq-error/10 border border-tq-error/30 text-tq-error rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-tq-success/10 border border-tq-success/30 text-tq-success rounded-xl px-4 py-3 text-sm">
          {successMsg}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-tq-text-sec uppercase tracking-wider">
              {editingId ? 'Edit Announcement' : 'New Announcement'}
            </h3>

            <Input
              label="Title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Announcement title"
            />

            <Textarea
              label="Body (optional)"
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Additional details..."
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-tq-text-sec">
                Expires On (optional)
              </label>
              <input
                type="date"
                value={form.expires_at}
                onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                className="w-full bg-tq-surface border border-tq-border rounded-xl px-4 py-3 text-tq-text text-[16px] focus:border-tq-teal focus:ring-2 focus:ring-tq-teal/20 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving} fullWidth>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Announcements List */}
      {loading ? (
        <p className="text-tq-text-muted text-sm text-center py-10">Loading...</p>
      ) : announcements.length === 0 && !showForm ? (
        <Card>
          <p className="text-tq-text-muted text-sm text-center py-6">
            No announcements yet. Create your first one!
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <Card key={a.id} className="!p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-tq-text">{a.title}</h3>
                    {a.body && (
                      <p className="text-sm text-tq-text-sec mt-1 line-clamp-2">{a.body}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Active/Inactive toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(a)}
                      className={[
                        'text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors',
                        a.is_active
                          ? 'bg-tq-success/15 text-tq-success'
                          : 'bg-tq-surface-2 text-tq-text-muted',
                      ].join(' ')}
                    >
                      {a.is_active ? 'Active' : 'Inactive'}
                    </button>

                    {/* Delete */}
                    {confirmDeleteId === a.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="text-xs font-semibold text-tq-error bg-tq-error/10 px-2 py-1 rounded-lg hover:bg-tq-error/20 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs text-tq-text-muted px-2 py-1"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(a.id)}
                        className="p-1.5 text-tq-text-muted hover:text-tq-error transition-colors"
                        aria-label="Delete announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-3 text-xs text-tq-text-muted">
                  <span>Created {formatDate(a.created_at)}</span>
                  {a.expires_at && (
                    <span>Expires {formatDate(a.expires_at)}</span>
                  )}
                </div>

                {/* Edit button */}
                <button
                  onClick={() => handleEdit(a)}
                  className="text-xs font-semibold text-tq-teal hover:text-tq-teal/80 transition-colors"
                >
                  Edit
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
