export interface ReturnRecord {
  id: number
  itemId: number
  claimId: number
  recipient: { id: number; name: string }
  confirmedBy: { id: number; name: string }
  returnedAt: string
  note?: string
}
