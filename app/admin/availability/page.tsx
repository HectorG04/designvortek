import type { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import { CalendarDays, Plus } from 'lucide-react'

export const metadata: Metadata = { title: 'Availability' }

type SlotStatus = 'open' | 'reserved' | 'booked' | 'unavailable'

interface SlotRow {
  id: number
  created_at: string
  slot_month: string
  slot_number: number
  status: string
  reserved_email: string | null
  reserved_name: string | null
  reserved_phone: string | null
  order_id: number | null
  notes: string | null
}

const STATUS_CYCLE: SlotStatus[] = ['open', 'reserved', 'booked', 'unavailable']

function nextStatus(current: string): SlotStatus {
  const idx = STATUS_CYCLE.indexOf(current as SlotStatus)
  if (idx === -1) return 'reserved'
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

function isoMonth(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}-01`
}

function monthLabel(monthIso: string): string {
  const [y, m] = monthIso.split('-').map(Number)
  const d = new Date(y, (m ?? 1) - 1, 1)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default async function AvailabilityAdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortex.co'
  const initials = email.slice(0, 2).toUpperCase()

  // Three months starting at current month
  const now = new Date()
  const months: string[] = []
  for (let i = 0; i < 3; i++) {
    months.push(isoMonth(new Date(now.getFullYear(), now.getMonth() + i, 1)))
  }

  const admin = createAdminClient()
  const { data: slotsData } = await admin
    .from('slots')
    .select('*')
    .gte('slot_month', months[0])
    .lte('slot_month', months[months.length - 1])
    .order('slot_month')
    .order('slot_number')

  const slots = (slotsData ?? []) as SlotRow[]
  const slotsByMonth = new Map<string, SlotRow[]>()
  for (const month of months) slotsByMonth.set(month, [])
  for (const slot of slots) {
    const monthIsoKey =
      slot.slot_month.length >= 10
        ? slot.slot_month.slice(0, 7) + '-01'
        : slot.slot_month
    if (slotsByMonth.has(monthIsoKey)) {
      slotsByMonth.get(monthIsoKey)!.push(slot)
    }
  }

  const totalOpen = slots.filter((s) => s.status === 'open').length
  const totalSlots = slots.length
  const subtitle = `${totalOpen} open · ${totalSlots} slots · next 3 months`

  const defaultMonth = now.toISOString().slice(0, 7)

  return (
    <AdminShell
      user={{ email, initials }}
      title="Availability"
      subtitle={subtitle}
      actions={
        <a
          href="#configure-month"
          className="hidden sm:inline-flex items-center gap-1.5 bg-burgundy-700 text-cream-50 hover:bg-burgundy-500 transition-colors px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider"
        >
          <Plus size={14} strokeWidth={1.8} />
          Configure month
        </a>
      }
    >
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-6 px-4 py-3 bg-parchment-100 border border-border-light rounded-xl">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500">
          Legend
        </span>
        <LegendDot
          swatch="bg-parchment-50 border-[1.5px] border-border-medium"
          label="Open"
        />
        <LegendDot swatch="bg-gold-500" label="Reserved" />
        <LegendDot swatch="bg-burgundy-700" label="Booked" />
        <LegendDot swatch="bg-ink-300" label="Unavailable" />
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map((monthIso) => (
          <MonthCard
            key={monthIso}
            monthIso={monthIso}
            slots={slotsByMonth.get(monthIso) ?? []}
          />
        ))}
      </div>

      {/* Configure new month */}
      <section
        id="configure-month"
        className="mt-8 bg-parchment-100 border border-border-light rounded-xl p-5 lg:p-6"
      >
        <h2 className="font-display text-xl font-semibold text-ink-900 mb-1">
          Configure a month
        </h2>
        <p className="text-sm text-ink-500 mb-4">
          Seed slots for any month. Existing slot numbers are kept untouched.
        </p>
        <form
          action={seedMonth}
          className="grid grid-cols-1 md:grid-cols-[1fr_140px_auto] gap-3 items-end"
        >
          <div className="flex flex-col">
            <label
              htmlFor="month"
              className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 mb-1.5"
            >
              Month
            </label>
            <input
              id="month"
              name="month"
              type="month"
              required
              defaultValue={defaultMonth}
              className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2 text-sm text-ink-900 focus:outline-none focus:border-burgundy-500"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="count"
              className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 mb-1.5"
            >
              # of slots
            </label>
            <input
              id="count"
              name="count"
              type="number"
              min={1}
              max={20}
              required
              defaultValue={5}
              className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2 text-sm text-ink-900 font-mono focus:outline-none focus:border-burgundy-500"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 bg-burgundy-700 text-cream-50 hover:bg-burgundy-500 transition-colors px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider"
          >
            <Plus size={14} strokeWidth={1.8} />
            Seed slots
          </button>
        </form>
      </section>
    </AdminShell>
  )
}

function LegendDot({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[0.8125rem] text-ink-700">
      <span
        className={['w-[18px] h-[18px] rounded-full inline-block', swatch].join(
          ' ',
        )}
      />
      {label}
    </span>
  )
}

/* ---------- Server actions ---------- */

async function updateSlotStatus(id: number, current: string) {
  'use server'
  const admin = createAdminClient()
  await admin.from('slots').update({ status: nextStatus(current) }).eq('id', id)
  revalidatePath('/admin/availability')
}

async function updateMonthNotes(monthIso: string, formData: FormData) {
  'use server'
  const notes = String(formData.get('notes') ?? '')
  const admin = createAdminClient()
  const { data: first } = await admin
    .from('slots')
    .select('id')
    .eq('slot_month', monthIso)
    .order('slot_number')
    .limit(1)
    .maybeSingle()
  if (first?.id) {
    await admin.from('slots').update({ notes }).eq('id', first.id)
  }
  revalidatePath('/admin/availability')
}

async function seedMonth(formData: FormData) {
  'use server'
  const monthValue = String(formData.get('month') ?? '')
  const count = Math.min(20, Math.max(1, Number(formData.get('count') ?? 5)))
  if (!/^\d{4}-\d{2}$/.test(monthValue)) return
  const monthIso = `${monthValue}-01`

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('slots')
    .select('slot_number')
    .eq('slot_month', monthIso)

  const used = new Set((existing ?? []).map((s) => s.slot_number))
  const toInsert: Array<{
    slot_month: string
    slot_number: number
    status: string
  }> = []
  for (let n = 1; n <= count; n++) {
    if (!used.has(n))
      toInsert.push({
        slot_month: monthIso,
        slot_number: n,
        status: 'open',
      })
  }
  if (toInsert.length > 0) {
    await admin.from('slots').insert(toInsert)
  }
  revalidatePath('/admin/availability')
}

/* ---------- Month card ---------- */

function MonthCard({
  monthIso,
  slots,
}: {
  monthIso: string
  slots: SlotRow[]
}) {
  const sorted = [...slots].sort((a, b) => a.slot_number - b.slot_number)
  const openCount = sorted.filter((s) => s.status === 'open').length
  const total = sorted.length
  const monthNote = sorted.find((s) => s.slot_number === 1)?.notes ?? ''

  return (
    <article className="bg-parchment-100 border border-border-light rounded-xl p-5 flex flex-col gap-4">
      {/* Head */}
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-semibold text-ink-900 leading-none">
          {monthLabel(monthIso)}
        </h3>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gold-100 text-gold-700 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] whitespace-nowrap">
          {openCount} of {total || 0} open
        </span>
      </div>

      {/* Slot circles */}
      {sorted.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-medium px-4 py-6 text-center text-sm text-ink-500">
          <CalendarDays
            size={20}
            strokeWidth={1.5}
            className="mx-auto mb-2 text-ink-400"
          />
          No slots configured for this month. Seed some below.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {sorted.map((slot) => (
            <form
              key={slot.id}
              action={updateSlotStatus.bind(null, slot.id, slot.status)}
            >
              <button
                type="submit"
                title={`Slot ${slot.slot_number} · ${slot.status} (click to cycle)`}
                className={[
                  'w-10 h-10 rounded-full inline-flex items-center justify-center font-display text-sm font-semibold transition-transform hover:scale-105',
                  slotClasses(slot.status),
                ].join(' ')}
              >
                {String(slot.slot_number).padStart(2, '0')}
              </button>
            </form>
          ))}
        </div>
      )}

      {/* Notes */}
      <form
        action={updateMonthNotes.bind(null, monthIso)}
        className="flex flex-col gap-2 pt-3 border-t border-dashed border-border-light"
      >
        <label className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500">
          Notes
        </label>
        <textarea
          name="notes"
          defaultValue={monthNote}
          placeholder={
            sorted.length === 0
              ? 'Add slots before saving notes…'
              : 'e.g. Studio closed Aug 15–22 · vacation'
          }
          disabled={sorted.length === 0}
          className="w-full min-h-[60px] bg-parchment-50 border border-border-light rounded-md px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors resize-y"
        />
        <button
          type="submit"
          disabled={sorted.length === 0}
          className="self-end inline-flex items-center gap-1.5 bg-transparent border-[1.5px] border-burgundy-700 text-burgundy-700 hover:bg-burgundy-700 hover:text-cream-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-3 py-1.5 rounded-md text-[0.6875rem] font-semibold uppercase tracking-[0.1em]"
        >
          Save note
        </button>
      </form>
    </article>
  )
}

function slotClasses(status: string): string {
  switch (status) {
    case 'booked':
      return 'bg-burgundy-700 text-cream-50 border-[1.5px] border-burgundy-900'
    case 'reserved':
      return 'bg-gold-500 text-ink-900 border-[1.5px] border-gold-700'
    case 'unavailable':
      return 'bg-ink-300 text-ink-500 border-[1.5px] border-ink-300'
    case 'open':
    default:
      return 'bg-parchment-50 text-ink-500 border-[1.5px] border-border-medium hover:border-burgundy-500'
  }
}
