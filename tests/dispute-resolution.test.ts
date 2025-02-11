import { describe, it, expect, beforeEach } from "vitest"

// Mock storage for disputes and votes
const disputes = new Map<
    number,
    {
      challenger: string
      disputedValue: number
      votesFor: number
      votesAgainst: number
    }
>()
const votes = new Map<string, boolean>()
let lastDisputeId = 0
let contractOwner = "owner"

// Mock functions to simulate contract behavior
function createDispute(disputedValue: number, challenger: string) {
  const newDisputeId = ++lastDisputeId
  disputes.set(newDisputeId, {
    challenger,
    disputedValue,
    votesFor: 0,
    votesAgainst: 0,
  })
  return newDisputeId
}

function voteOnDispute(disputeId: number, voteFor: boolean, voter: string) {
  const dispute = disputes.get(disputeId)
  if (!dispute) throw new Error("Invalid dispute")
  const voteKey = `${disputeId}-${voter}`
  if (votes.has(voteKey)) throw new Error("Already voted")
  votes.set(voteKey, voteFor)
  if (voteFor) {
    dispute.votesFor++
  } else {
    dispute.votesAgainst++
  }
  disputes.set(disputeId, dispute)
  return true
}

function getDispute(disputeId: number) {
  return disputes.get(disputeId)
}

function setContractOwner(newOwner: string, caller: string) {
  if (caller !== contractOwner) throw new Error("Unauthorized")
  contractOwner = newOwner
  return true
}

describe("Dispute Resolution Contract", () => {
  beforeEach(() => {
    disputes.clear()
    votes.clear()
    lastDisputeId = 0
    contractOwner = "owner"
  })
  
  it("should create a new dispute", () => {
    const disputeId = createDispute(2000, "user1")
    expect(disputeId).toBe(1)
    expect(getDispute(disputeId)).toMatchObject({
      challenger: "user1",
      disputedValue: 2000,
      votesFor: 0,
      votesAgainst: 0,
    })
  })
  
  it("should allow voting on a dispute", () => {
    const disputeId = createDispute(2000, "user1")
    expect(voteOnDispute(disputeId, true, "user2")).toBe(true)
    expect(getDispute(disputeId)?.votesFor).toBe(1)
  })
  
  it("should not allow double voting", () => {
    const disputeId = createDispute(2000, "user1")
    voteOnDispute(disputeId, true, "user2")
    expect(() => voteOnDispute(disputeId, false, "user2")).toThrow("Already voted")
  })
  
  it("should allow multiple users to vote", () => {
    const disputeId = createDispute(2000, "user1")
    voteOnDispute(disputeId, true, "user2")
    voteOnDispute(disputeId, false, "user3")
    voteOnDispute(disputeId, true, "user4")
    const dispute = getDispute(disputeId)
    expect(dispute?.votesFor).toBe(2)
    expect(dispute?.votesAgainst).toBe(1)
  })
  
  it("should allow changing contract owner by current owner", () => {
    expect(setContractOwner("newOwner", "owner")).toBe(true)
    expect(contractOwner).toBe("newOwner")
  })
  
  it("should not allow changing contract owner by non-owner", () => {
    expect(() => setContractOwner("newOwner", "user1")).toThrow("Unauthorized")
  })
})

