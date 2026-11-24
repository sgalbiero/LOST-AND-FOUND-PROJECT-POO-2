export interface ReturnRecord {
  id: number
  itemId: number
  claimId: number
  confirmedBy: { id: number; name: string }
  returnedAt: string
  note?: string
}
