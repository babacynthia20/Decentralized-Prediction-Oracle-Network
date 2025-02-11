;; Reward Distribution Contract

;; Define fungible token for rewards
(define-fungible-token reward-token)

;; Define data structures
(define-map rewards principal uint)
(define-data-var total-rewards uint u0)
(define-data-var reward-rate uint u100) ;; Reward rate per 1000 tokens
(define-data-var contract-owner principal tx-sender)

;; Error codes
(define-constant err-unauthorized (err u100))
(define-constant err-insufficient-rewards (err u101))

;; Distribute rewards
(define-public (distribute-rewards (amount uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-unauthorized)
    (var-set total-rewards (+ (var-get total-rewards) amount))
    (try! (ft-mint? reward-token amount (as-contract tx-sender)))
    (ok amount)
  )
)

;; Claim rewards
(define-public (claim-rewards)
  (let
    ((claimable-reward (get-claimable-rewards tx-sender)))
    (asserts! (> claimable-reward u0) err-insufficient-rewards)
    (map-set rewards tx-sender u0)
    (var-set total-rewards (- (var-get total-rewards) claimable-reward))
    (try! (as-contract (ft-transfer? reward-token claimable-reward tx-sender tx-sender)))
    (ok claimable-reward)
  )
)

;; Get claimable rewards for an address
(define-read-only (get-claimable-rewards (address principal))
  (default-to u0 (map-get? rewards address))
)

;; Set reward for an address
(define-public (set-reward (address principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-unauthorized)
    (map-set rewards address amount)
    (ok true)
  )
)

;; Set reward rate
(define-public (set-reward-rate (new-rate uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-unauthorized)
    (ok (var-set reward-rate new-rate))
  )
)

;; Set contract owner
(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-unauthorized)
    (ok (var-set contract-owner new-owner))
  )
)

