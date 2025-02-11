;; Dispute Resolution Contract

;; Define data structures
(define-map disputes
  { dispute-id: uint }
  { challenger: principal, disputed-value: int, votes-for: uint, votes-against: uint }
)

(define-map votes
  { dispute-id: uint, voter: principal }
  bool
)

(define-data-var last-dispute-id uint u0)
(define-data-var contract-owner principal tx-sender)

;; Error codes
(define-constant err-unauthorized (err u100))
(define-constant err-invalid-dispute (err u101))
(define-constant err-already-voted (err u102))

;; Create a new dispute
(define-public (create-dispute (disputed-value int))
  (let
    ((new-dispute-id (+ (var-get last-dispute-id) u1)))
    (map-set disputes
      { dispute-id: new-dispute-id }
      { challenger: tx-sender, disputed-value: disputed-value, votes-for: u0, votes-against: u0 }
    )
    (var-set last-dispute-id new-dispute-id)
    (ok new-dispute-id)
  )
)

;; Vote on a dispute
(define-public (vote-on-dispute (dispute-id uint) (vote-for bool))
  (let
    ((dispute (unwrap! (map-get? disputes { dispute-id: dispute-id }) err-invalid-dispute)))
    (asserts! (is-none (map-get? votes { dispute-id: dispute-id, voter: tx-sender })) err-already-voted)
    (map-set votes { dispute-id: dispute-id, voter: tx-sender } vote-for)
    (if vote-for
      (map-set disputes { dispute-id: dispute-id }
        (merge dispute { votes-for: (+ (get votes-for dispute) u1) }))
      (map-set disputes { dispute-id: dispute-id }
        (merge dispute { votes-against: (+ (get votes-against dispute) u1) }))
    )
    (ok true)
  )
)

;; Get dispute details
(define-read-only (get-dispute (dispute-id uint))
  (map-get? disputes { dispute-id: dispute-id })
)

;; Set contract owner
(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-unauthorized)
    (ok (var-set contract-owner new-owner))
  )
)

