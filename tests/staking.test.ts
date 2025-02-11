import { describe, it, expect, beforeEach } from "vitest"

// Mock storage for stakes
const stakes = new Map<string, number>()
let totalStake = 0
let minimumStake = 1000
let contractOwner = "owner"

// Mock functions to simulate contract behavior
function stake(amount: number, staker: string) {
  const currentStake = stakes.get(staker) || 0
  if (currentStake + amount < minimumStake) throw new Error("Insufficient stake")
  stakes.set(staker, currentStake + amount)
  totalStake += amount
  return true
}

function unstake(amount: number, staker: string) {
  const currentStake = stakes.get(staker) || 0
  if (currentStake < amount) throw new Error("Insufficient stake")
  stakes.set(staker, currentStake - amount)
  totalStake -= amount
  return true
}

function isStaked(address: string) {
  return (stakes.get(address) || 0) >= minimumStake
}

function getStake(address: string) {
  return stakes.get(address) || 0
}

function getTotalStake() {
  return totalStake
}

function setMinimumStake(newMinimum: number, caller: string) {
  if (caller !== contractOwner) throw new Error("Unauthorized")
  minimumStake = newMinimum
  return true
}

function setContractOwner(newOwner: string, caller: string) {
  if (caller !== contractOwner) throw new Error("Unauthorized")
  contractOwner = newOwner
  return true
}

describe("Staking Contract", () => {
  beforeEach(() => {
    stakes.clear()
    totalStake = 0
    minimumStake = 1000
    contractOwner = "owner"
  })
  
  it("should allow staking", () => {
    expect(stake(1500, "user1")).toBe(true)
    expect(getStake("user1")).toBe(1500)
    expect(getTotalStake()).toBe(1500)
  })
  
  it("should not allow staking below minimum", () => {
    expect(() => stake(500, "user1")).toThrow("Insufficient stake")
  })
  
  it("should allow unstaking", () => {
    stake(2000, "user1")
    expect(unstake(500, "user1")).toBe(true)
    expect(getStake("user1")).toBe(1500)
    expect(getTotalStake()).toBe(1500)
  })
  
  it("should not allow unstaking more than staked", () => {
    stake(1500, "user1")
    expect(() => unstake(2000, "user1")).toThrow("Insufficient stake")
  })
  
  it("should allow changing minimum stake by owner", () => {
    expect(setMinimumStake(2000, "owner")).toBe(true)
    expect(minimumStake).toBe(2000)
    expect(() => stake(1500, "user1")).toThrow("Insufficient stake")
    expect(stake(2000, "user1")).toBe(true)
  })
  
  it("should not allow changing minimum stake by non-owner", () => {
    expect(() => setMinimumStake(2000, "user1")).toThrow("Unauthorized")
  })
  
  it("should allow changing contract owner by current owner", () => {
    expect(setContractOwner("newOwner", "owner")).toBe(true)
    expect(contractOwner).toBe("newOwner")
  })
  
  it("should not allow changing contract owner by non-owner", () => {
    expect(() => setContractOwner("newOwner", "user1")).toThrow("Unauthorized")
  })
})

