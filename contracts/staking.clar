;; Staking Contract

;; Define fungible token for staking
(define-fungible-token stake-token)

;; Define data structures
(define-map stakes principal uint)
(define-data-var total-stake uint u0)
(define-data-var minimum-stake uint u1000)

;; Error codes
(define-constant err-insufficient-stake (err u100))
(define-constant err-already-staked (err u101))
(define-constant err-unauthorized (err u102))

;; Define the contract owner
(define-data-var contract-owner principal tx-sender)

;; Stake tokens
(define-public (stake (amount uint))
  (let
    ((current-stake (default-to u0 (map-get? stakes tx-sender))))
    (asserts! (>= (+ current-stake amount) (var-get minimum-stake)) err-insufficient-stake)
    (try! (ft-transfer? stake-token amount tx-sender (as-contract tx-sender)))
    (map-set stakes tx-sender (+ current-stake amount))
    (var-set total-stake (+ (var-get total-stake) amount))
    (ok true)
  )
)

;; Unstake tokens
(define-public (unstake (amount uint))
  (let
    ((current-stake (default-to u0 (map-get? stakes tx-sender))))
    (asserts! (>= current-stake amount) err-insufficient-stake)
    (try! (as-contract (ft-transfer? stake-token amount tx-sender tx-sender)))
    (map-set stakes tx-sender (- current-stake amount))
    (var-set total-stake (- (var-get total-stake) amount))
    (ok true)
  )
)

;; Check if an address is staked
(define-read-only (is-staked (address principal))
  (>= (default-to u0 (map-get? stakes address)) (var-get minimum-stake))
)

;; Get stake amount for an address
(define-read-only (get-stake (address principal))
  (default-to u0 (map-get? stakes address))
)

;; Get total stake
(define-read-only (get-total-stake)
  (var-get total-stake)
)

;; Set minimum stake
(define-public (set-minimum-stake (new-minimum uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-unauthorized)
    (ok (var-set minimum-stake new-minimum))
  )
)

;; Change contract owner
(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-unauthorized)
    (ok (var-set contract-owner new-owner))
  )
)

