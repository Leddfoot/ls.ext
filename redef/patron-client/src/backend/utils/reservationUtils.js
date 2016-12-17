module.exports.estimateWaitingPeriod = (queuePlace, items) => {
  if (items.length < 1) {
    return 'unknown'
  }
  if (queuePlace === 0) {
    return 'inTransit'
  }

  const reservableItems = items.filter(isReservable)

  if (reservableItems.length < 1) {
    return 'unknown'
  }

  const availableItems = reservableItems.filter(isAvailable)
  if (queuePlace <= availableItems.length) {
    return 'pending'
  } else {
    return getWaitPeriod(queuePlace, reservableItems)
  }
}

function isReservable (item) {
  return item.reservable === 1
}

function isAvailable (item) {
  return item.onloan === null
}

function getWaitPeriod (queuePlace, items) {
  const queued = queuePlace || 1
  const estimate = getEstimatedPeriod(queued, items)

  if (estimate === 'unknown') {
    return estimate
  }

  const floor = Math.floor(estimate)
  const ceiling = (floor === estimate) ? Math.ceil(estimate) + 1 : Math.ceil(estimate)
  const returnVal = (floor < 12) ? `${floor}–${ceiling}` : '12'

  return returnVal
}

function getEstimatedPeriod (queuePlace, items) {
  // Explanation:
  // Generate starting point by finding the oldest loan, add that to the loan-length multiplied by the queue:items ratio
  // divide by seconds in a week and finally divide by the number of items

  if (items) {
    const secondsInDay = 1000 * 60 * 60 * 24
    const secondsInAWeek = secondsInDay * 7
    const oldestLoan = getOldestLoan(items)
    const itemLoanLength = getLoanPeriod(oldestLoan.itype) * secondsInDay
    const startDateFromItem = Date.parse(oldestLoan.onloan)
    const initialTo = (startDateFromItem + itemLoanLength) - Date.now()
    const startDate = (initialTo <= 0) || isNaN(initialTo) ? 0 : initialTo
    const multiplicator = Math.ceil((queuePlace >= items.length) ? (queuePlace / items.length) : (items.length / queuePlace))
    const estimate = Math.ceil(((startDate + (itemLoanLength * multiplicator)) / secondsInAWeek) / items.length)
    return isNaN(estimate) ? 'unknown' : estimate
  } else {
    return 'unknown'
  }
}

function getLoanPeriod (itemtype, borrowerCategory = 'V') {
  if (borrowerCategory) {
    // TODO decide if we want to fix this.
  }

  switch (itemtype) {
    case 'FILM' :
    case 'KART' :
    case 'MUSIKK' :
    case 'PERIODIKA' :
      return 14
    case 'BOK' :
    case 'LYDBOK' :
    case 'NOTER' :
    case 'REALIA' :
    case 'SPILL' :
    case 'SPRAAKKURS' :
    default :
      return 28
  }
}

function getOldestLoan (items) {
  const sorted = items.sort(
    (a, b) => {
      return a.onloan > b.onloan
    })
  return sorted[ 0 ]
}
