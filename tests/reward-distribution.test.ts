import { describe, it, expect, beforeEach } from "vitest"

// Mock storage for rewards
const rewards = new Map<string, number>()
let totalRewards = 0
let rewardRate = 100 // Reward rate per 1000 tokens
let contractOwner = "owner"

// Mock functions to simulate contract behavior
function distributeRewards(amount: number, caller: string) {
  if (caller !== contractOwner) throw new Error("Unauthorized")
  totalRewards += amount
  return amount
}

function claimRewards(address: string) {
  const claimableReward = getClaimableRewards(address)
  if (claimableReward === 0) throw new Error("Insufficient rewards")
  rewards.set(address, 0)
  totalRewards -= claimableReward
  return claimableReward
}

function getClaimableRewards(address: string) {
  return rewards.get(address) || 0
}

function setReward(address: string, amount: number, caller: string) {
  if (caller !== contractOwner) throw new Error("Unauthorized")
  rewards.set(address, amount)
  return true
}

function setRewardRate(newRate: number, caller: string) {
  if (caller !== contractOwner) throw new Error("Unauthorized")
  rewardRate = newRate
  return true
}

function setContractOwner(newOwner: string, caller: string) {
  if (caller !== contractOwner) throw new Error("Unauthorized")
  contractOwner = newOwner
  return true
}

describe("Reward Distribution Contract", () => {
  beforeEach(() => {
    rewards.clear()
    totalRewards = 0
    rewardRate = 100
    contractOwner = "owner"
  })
  
  it("should distribute rewards", () => {
    const distributedAmount = distributeRewards(500, "owner")
    expect(distributedAmount).toBe(500)
    expect(totalRewards).toBe(500)
  })
  
  it("should not allow unauthorized reward distribution", () => {
    expect(() => distributeRewards(500, "user1")).toThrow("Unauthorized")
  })
  
  it("should allow claiming rewards", () => {
    setReward("user1", 100, "owner")
    const claimedAmount = claimRewards("user1")
    expect(claimedAmount).toBe(100)
    expect(getClaimableRewards("user1")).toBe(0)
    expect(totalRewards).toBe(-100)
  })
  
  it("should not allow claiming when no rewards are available", () => {
    expect(() => claimRewards("user1")).toThrow("Insufficient rewards")
  })
  
  it("should allow setting rewards for an address", () => {
    expect(setReward("user1", 200, "owner")).toBe(true)
    expect(getClaimableRewards("user1")).toBe(200)
  })
  
  it("should not allow unauthorized reward setting", () => {
    expect(() => setReward("user1", 200, "user2")).toThrow("Unauthorized")
  })
  
  it("should allow changing reward rate by owner", () => {
    expect(setRewardRate(200, "owner")).toBe(true)
    expect(rewardRate).toBe(200)
  })
  
  it("should not allow changing reward rate by non-owner", () => {
    expect(() => setRewardRate(200, "user1")).toThrow("Unauthorized")
  })
  
  it("should allow changing contract owner by current owner", () => {
    expect(setContractOwner("newOwner", "owner")).toBe(true)
    expect(contractOwner).toBe("newOwner")
  })
  
  it("should not allow changing contract owner by non-owner", () => {
    expect(() => setContractOwner("newOwner", "user1")).toThrow("Unauthorized")
  })
})

