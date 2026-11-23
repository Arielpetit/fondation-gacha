'use client'

import { useRowLabel } from '@payloadcms/ui'

/** Shows the menu item's label instead of "Rubrique 01" in the admin. */
export function NavRowLabel() {
  const { data, rowNumber } = useRowLabel<{ label?: string }>()
  return <span>{data?.label || `Rubrique ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`}</span>
}
