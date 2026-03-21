import { useState, useEffect, useCallback } from 'react'
import { Plus, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Quest, QuestDay } from '../../types/database'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'

// ── Types ────────────────────────────────────────────────────────────

type View = 'list' | 'edit'

interface QuestFormData {
  title: string
  description: string
  quest_type: Quest['quest_type']
  start_date: string
  end_date: string
  is_active: boolean
  badge_name: string
  badge_icon: string
}

interface DayRow {
  id?: string
  quest_id: string
  day_number: number
  passage_reference: string
  passage_text: string
  reading_hint: string
  is_milestone: boolean
  milestone_note: string
  collapsed: boolean // UI-only
}

const emptyForm: QuestFormData = {
  title: '',
  description: '',
  quest_type: 'reading',
  start_date: '',
  end_date: '',
  is_active: true,
  badge_name: '',
  badge_icon: '',
}

// ── Component ────────────────────────────────────────────────────────

export function QuestBuilder() {
  const [view, setView] = useState<View>('list')
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingDays, setSavingDays] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Edit state
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [form, setForm] = useState<QuestFormData>(emptyForm)

  // Daily readings state
  const [days, setDays] = useState<DayRow[]>([])
  const [daysLoading, setDaysLoading] = useState(false)

  // ── Fetch quests ──────────────────────────────────────────────────

  const fetchQuests = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('quests')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setQuests((data ?? []) as Quest[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchQuests()
  }, [fetchQuests])

  // ── Fetch quest days when editing ─────────────────────────────────

  const fetchDays = useCallback(async (questId: string) => {
    setDaysLoading(true)
    const { data, error: err } = await supabase
      .from('quest_days')
      .select('*')
      .eq('quest_id', questId)
      .order('day_number', { ascending: true })

    if (err) {
      setError(err.message)
    } else {
      const rows = ((data ?? []) as QuestDay[]).map((d) => ({
        id: d.id,
        quest_id: d.quest_id,
        day_number: d.day_number,
        passage_reference: d.passage_reference ?? '',
        passage_text: d.passage_text ?? '',
        reading_hint: d.reading_hint ?? '',
        is_milestone: d.is_milestone,
        milestone_note: d.milestone_note ?? '',
        collapsed: true,
      }))
      setDays(rows)
    }
    setDaysLoading(false)
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────

  function handleCreate() {
    setSelectedQuest(null)
    setForm(emptyForm)
    setDays([])
    setError(null)
    setSuccessMsg(null)
    setView('edit')
  }

  function handleEdit(quest: Quest) {
    setSelectedQuest(quest)
    setForm({
      title: quest.title,
      description: quest.description ?? '',
      quest_type: quest.quest_type,
      start_date: quest.start_date,
      end_date: quest.end_date,
      is_active: quest.is_active,
      badge_name: quest.badge_name ?? '',
      badge_icon: quest.badge_icon ?? '',
    })
    setError(null)
    setSuccessMsg(null)
    fetchDays(quest.id)
    setView('edit')
  }

  function handleBack() {
    setView('list')
    setSelectedQuest(null)
    setDays([])
    setError(null)
    setSuccessMsg(null)
    fetchQuests()
  }

  function updateForm<K extends keyof QuestFormData>(key: K, value: QuestFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // ── Save quest ────────────────────────────────────────────────────

  async function handleSaveQuest() {
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    if (!form.start_date || !form.end_date) {
      setError('Start and end dates are required')
      return
    }

    setSaving(true)
    setError(null)
    setSuccessMsg(null)

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      quest_type: form.quest_type,
      start_date: form.start_date,
      end_date: form.end_date,
      is_active: form.is_active,
      badge_name: form.badge_name.trim() || null,
      badge_icon: form.badge_icon.trim() || null,
    }

    if (selectedQuest) {
      // Update
      const { error: err } = await supabase
        .from('quests')
        .update(payload)
        .eq('id', selectedQuest.id)

      if (err) {
        setError(err.message)
      } else {
        setSuccessMsg('Quest updated')
        setSelectedQuest({ ...selectedQuest, ...payload, created_at: selectedQuest.created_at } as Quest)
      }
    } else {
      // Insert
      const { data, error: err } = await supabase
        .from('quests')
        .insert(payload)
        .select('*')
        .single()

      if (err) {
        setError(err.message)
      } else {
        const created = data as Quest
        setSelectedQuest(created)
        setSuccessMsg('Quest created')
      }
    }
    setSaving(false)
  }

  // ── Auto-fill days ────────────────────────────────────────────────

  function handleAutoFill() {
    if (!form.start_date || !form.end_date || !selectedQuest) return
    const start = new Date(form.start_date)
    const end = new Date(form.end_date)
    const diffMs = end.getTime() - start.getTime()
    const totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1)

    const existingMap = new Map<number, DayRow>()
    days.forEach((d) => existingMap.set(d.day_number, d))

    const newDays: DayRow[] = []
    for (let i = 1; i <= totalDays; i++) {
      const existing = existingMap.get(i)
      if (existing) {
        newDays.push(existing)
      } else {
        newDays.push({
          quest_id: selectedQuest.id,
          day_number: i,
          passage_reference: '',
          passage_text: '',
          reading_hint: '',
          is_milestone: false,
          milestone_note: '',
          collapsed: true,
        })
      }
    }
    setDays(newDays)
  }

  // ── Update a single day row ───────────────────────────────────────

  function updateDay<K extends keyof DayRow>(index: number, key: K, value: DayRow[K]) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, [key]: value } : d)))
  }

  // ── Save all days ─────────────────────────────────────────────────

  async function handleSaveDays() {
    if (!selectedQuest) return
    setSavingDays(true)
    setError(null)
    setSuccessMsg(null)

    // Split into updates (existing rows with id) and inserts (new rows without id)
    const existing = days.filter(d => d.id)
    const newRows = days.filter(d => !d.id)

    let err: { message: string } | null = null

    // Update existing rows one by one
    for (const d of existing) {
      const { error: updateErr } = await supabase
        .from('quest_days')
        .update({
          passage_reference: d.passage_reference.trim() || null,
          passage_text: d.passage_text.trim() || null,
          reading_hint: d.reading_hint.trim() || null,
          is_milestone: d.is_milestone,
          milestone_note: d.is_milestone ? d.milestone_note.trim() || null : null,
        })
        .eq('id', d.id!)
      if (updateErr) { err = updateErr; break }
    }

    // Insert new rows
    if (!err && newRows.length > 0) {
      const insertPayload = newRows.map(d => ({
        quest_id: selectedQuest.id,
        day_number: d.day_number,
        passage_reference: d.passage_reference.trim() || null,
        passage_text: d.passage_text.trim() || null,
        reading_hint: d.reading_hint.trim() || null,
        is_milestone: d.is_milestone,
        milestone_note: d.is_milestone ? d.milestone_note.trim() || null : null,
      }))
      const { error: insertErr } = await supabase.from('quest_days').insert(insertPayload)
      if (insertErr) err = insertErr
    }

    if (err) {
      setError(err.message)
    } else {
      setSuccessMsg('Daily readings saved')
      // Re-fetch to get IDs for newly created rows
      fetchDays(selectedQuest.id)
    }
    setSavingDays(false)
  }

  // ── Render ────────────────────────────────────────────────────────

  if (view === 'list') {
    return <QuestList quests={quests} loading={loading} onCreate={handleCreate} onEdit={handleEdit} />
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-1 text-sm text-tq-text-sec hover:text-tq-text transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to quests
      </button>

      <h2 className="text-xl font-bold">
        {selectedQuest ? 'Edit Quest' : 'Create New Quest'}
      </h2>

      {/* Error / Success banners */}
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

      {/* Quest Form */}
      <Card>
        <div className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => updateForm('title', e.target.value)}
            placeholder="e.g. Journey Through Matthew"
          />

          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => updateForm('description', e.target.value)}
            placeholder="A brief description of this quest..."
          />

          {/* Quest Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-tq-text-sec">Quest Type</label>
            <select
              value={form.quest_type}
              onChange={(e) => updateForm('quest_type', e.target.value as Quest['quest_type'])}
              className="w-full bg-tq-surface border border-tq-border rounded-xl px-4 py-3 text-tq-text text-[16px] focus:border-tq-teal focus:ring-2 focus:ring-tq-teal/20 outline-none"
            >
              <option value="reading">Reading</option>
              <option value="discipline">Discipline</option>
              <option value="event">Event</option>
            </select>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-tq-text-sec">Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => updateForm('start_date', e.target.value)}
                className="w-full bg-tq-surface border border-tq-border rounded-xl px-4 py-3 text-tq-text text-[16px] focus:border-tq-teal focus:ring-2 focus:ring-tq-teal/20 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-tq-text-sec">End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => updateForm('end_date', e.target.value)}
                className="w-full bg-tq-surface border border-tq-border rounded-xl px-4 py-3 text-tq-text text-[16px] focus:border-tq-teal focus:ring-2 focus:ring-tq-teal/20 outline-none"
              />
            </div>
          </div>

          {/* Is Active toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-tq-text-sec">Status</label>
            <button
              type="button"
              onClick={() => updateForm('is_active', !form.is_active)}
              className={[
                'w-fit px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                form.is_active
                  ? 'bg-tq-teal/15 text-tq-teal border border-tq-teal/30'
                  : 'bg-tq-surface-2 text-tq-text-muted border border-tq-border',
              ].join(' ')}
            >
              {form.is_active ? 'Active' : 'Inactive'}
            </button>
          </div>

          {/* Badge fields */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Badge Name"
              value={form.badge_name}
              onChange={(e) => updateForm('badge_name', e.target.value)}
              placeholder="e.g. Matthew Master"
            />
            <Input
              label="Badge Icon"
              value={form.badge_icon}
              onChange={(e) => updateForm('badge_icon', e.target.value)}
              placeholder="e.g. book-open"
            />
          </div>

          <Button onClick={handleSaveQuest} disabled={saving} fullWidth>
            {saving ? 'Saving...' : selectedQuest ? 'Update Quest' : 'Create Quest'}
          </Button>
        </div>
      </Card>

      {/* Daily Readings Manager — only shown when editing an existing quest */}
      {selectedQuest && (
        <DailyReadingsManager
          days={days}
          loading={daysLoading}
          saving={savingDays}
          hasDateRange={!!form.start_date && !!form.end_date}
          onAutoFill={handleAutoFill}
          onUpdateDay={updateDay}
          onSave={handleSaveDays}
        />
      )}
    </div>
  )
}

// ── Quest List Sub-Component ──────────────────────────────────────────

function QuestList({
  quests,
  loading,
  onCreate,
  onEdit,
}: {
  quests: Quest[]
  loading: boolean
  onCreate: () => void
  onEdit: (q: Quest) => void
}) {
  if (loading) {
    return <p className="text-tq-text-muted text-sm text-center py-10">Loading quests...</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Quests</h2>
        <Button onClick={onCreate}>
          <Plus className="w-4 h-4" />
          Create New
        </Button>
      </div>

      {quests.length === 0 ? (
        <p className="text-tq-text-muted text-sm text-center py-10">
          No quests yet. Create your first one!
        </p>
      ) : (
        <div className="space-y-3">
          {quests.map((quest) => (
            <Card
              key={quest.id}
              className="cursor-pointer hover:border-tq-teal/50 transition-colors"
              onClick={() => onEdit(quest)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-tq-text truncate">{quest.title}</h3>
                  <p className="text-sm text-tq-text-sec mt-0.5">
                    {quest.start_date} — {quest.end_date}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-medium text-tq-text-muted bg-tq-surface-2 px-2 py-0.5 rounded-md">
                      {quest.quest_type}
                    </span>
                    <span
                      className={[
                        'text-xs font-semibold px-2 py-0.5 rounded-md',
                        quest.is_active
                          ? 'bg-tq-success/15 text-tq-success'
                          : 'bg-tq-surface-2 text-tq-text-muted',
                      ].join(' ')}
                    >
                      {quest.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-tq-text-muted rotate-180 flex-shrink-0 mt-1" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Daily Readings Manager Sub-Component ──────────────────────────────

function DailyReadingsManager({
  days,
  loading,
  saving,
  hasDateRange,
  onAutoFill,
  onUpdateDay,
  onSave,
}: {
  days: DayRow[]
  loading: boolean
  saving: boolean
  hasDateRange: boolean
  onAutoFill: () => void
  onUpdateDay: <K extends keyof DayRow>(index: number, key: K, value: DayRow[K]) => void
  onSave: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Daily Readings</h3>
        <Button
          variant="secondary"
          onClick={onAutoFill}
          disabled={!hasDateRange}
        >
          Auto-fill Days
        </Button>
      </div>

      {loading ? (
        <p className="text-tq-text-muted text-sm text-center py-6">Loading readings...</p>
      ) : days.length === 0 ? (
        <p className="text-tq-text-muted text-sm text-center py-6">
          No days yet. Click "Auto-fill Days" to generate rows from the date range.
        </p>
      ) : (
        <div className="space-y-2">
          {days.map((day, idx) => (
            <Card key={day.day_number} className="!p-3">
              {/* Day header row */}
              <div className="flex items-center gap-3">
                {/* Fill indicator */}
                <div
                  className={[
                    'w-2.5 h-2.5 rounded-full flex-shrink-0',
                    day.passage_text.trim() ? 'bg-tq-success' : 'bg-tq-text-muted/30',
                  ].join(' ')}
                  title={day.passage_text.trim() ? 'Passage text filled' : 'Passage text empty'}
                />

                {/* Day number */}
                <span className="text-sm font-bold text-tq-text-sec w-12 flex-shrink-0">
                  Day {day.day_number}
                </span>

                {/* Passage reference inline */}
                <input
                  value={day.passage_reference}
                  onChange={(e) => onUpdateDay(idx, 'passage_reference', e.target.value)}
                  placeholder="Passage reference"
                  className="flex-1 min-w-0 bg-tq-surface border border-tq-border rounded-lg px-3 py-1.5 text-sm text-tq-text placeholder:text-tq-text-muted focus:border-tq-teal focus:ring-1 focus:ring-tq-teal/20 outline-none"
                />

                {/* Milestone checkbox */}
                <label className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={day.is_milestone}
                    onChange={(e) => onUpdateDay(idx, 'is_milestone', e.target.checked)}
                    className="w-4 h-4 rounded border-tq-border text-tq-teal focus:ring-tq-teal/20 bg-tq-surface"
                  />
                  <span className="text-xs text-tq-text-muted">Milestone</span>
                </label>

                {/* Expand/collapse */}
                <button
                  type="button"
                  onClick={() => onUpdateDay(idx, 'collapsed', !day.collapsed)}
                  className="p-1 text-tq-text-muted hover:text-tq-text transition-colors"
                  aria-label={day.collapsed ? 'Expand' : 'Collapse'}
                >
                  {day.collapsed ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Expanded details */}
              {!day.collapsed && (
                <div className="mt-3 space-y-3 pl-5">
                  <Textarea
                    label="Passage Text"
                    value={day.passage_text}
                    onChange={(e) => onUpdateDay(idx, 'passage_text', e.target.value)}
                    placeholder="Full passage text..."
                  />
                  <div>
                    <Textarea
                      label="Reading Hint (optional)"
                      value={day.reading_hint}
                      onChange={(e) => onUpdateDay(idx, 'reading_hint', e.target.value)}
                      placeholder="A short question or tip to help students engage. 1-2 sentences."
                    />
                    <p className="text-xs text-tq-text-muted mt-1 tabular-nums">
                      {day.reading_hint.length}/200
                    </p>
                  </div>
                  {day.is_milestone && (
                    <Input
                      label="Milestone Note"
                      value={day.milestone_note}
                      onChange={(e) => onUpdateDay(idx, 'milestone_note', e.target.value)}
                      placeholder="Congratulations message for this milestone"
                    />
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {days.length > 0 && (
        <Button onClick={onSave} disabled={saving} fullWidth>
          {saving ? 'Saving...' : 'Save All Readings'}
        </Button>
      )}
    </div>
  )
}
