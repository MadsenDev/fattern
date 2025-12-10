/**
 * Cryptographic credit system for local-first app
 * Prevents tampering while maintaining privacy (no server calls)
 */

// Simple HMAC-like function using Web Crypto API
async function generateHMAC(message, key) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate a device-specific key (hardware-bound)
async function getDeviceKey() {
  // Use a combination of factors that are hard to change
  const factors = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset().toString(),
    // Add purchase proof if available (encrypted license key)
    localStorage.getItem('fattern:license_key') || 'no-license',
  ].join('|');
  
  // Hash it to create a stable key
  const encoder = new TextEncoder();
  const data = encoder.encode(factors);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Credit transaction types
 */
const TRANSACTION_TYPES = {
  PURCHASE: 'purchase',    // Initial purchase (e.g., 1000 credits)
  USE: 'use',              // Used a credit
  REFUND: 'refund',        // Refunded credits (admin)
  BONUS: 'bonus',          // Bonus credits (promotions)
};

/**
 * Create a credit transaction
 */
async function createTransaction(type, amount, metadata = {}) {
  const deviceKey = await getDeviceKey();
  const timestamp = Date.now();
  const transaction = {
    id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    amount,
    timestamp,
    metadata,
  };
  
  // Create signature
  const message = JSON.stringify(transaction);
  const signature = await generateHMAC(message, deviceKey);
  
  return {
    ...transaction,
    signature,
  };
}

/**
 * Verify a transaction signature
 */
async function verifyTransaction(transaction) {
  const deviceKey = await getDeviceKey();
  const { signature, ...transactionData } = transaction;
  const message = JSON.stringify(transactionData);
  const expectedSignature = await generateHMAC(message, deviceKey);
  return signature === expectedSignature;
}

/**
 * Load and verify credit ledger
 */
export async function loadCreditLedger() {
  try {
    const stored = localStorage.getItem('fattern:credit_ledger');
    if (!stored) return [];
    
    const ledger = JSON.parse(stored);
    
    // Verify all transactions
    const verified = [];
    for (const transaction of ledger) {
      const isValid = await verifyTransaction(transaction);
      if (!isValid) {
        console.warn('Invalid transaction detected:', transaction.id);
        // Could either reject the whole ledger or just skip invalid transactions
        // For now, skip invalid ones (tampering detected)
        continue;
      }
      verified.push(transaction);
    }
    
    return verified;
  } catch (error) {
    console.error('Failed to load credit ledger', error);
    return [];
  }
}

/**
 * Add a transaction to the ledger
 */
export async function addTransaction(type, amount, metadata = {}) {
  const transaction = await createTransaction(type, amount, metadata);
  const ledger = await loadCreditLedger();
  ledger.push(transaction);
  localStorage.setItem('fattern:credit_ledger', JSON.stringify(ledger));
  return transaction;
}

/**
 * Calculate current credit balance from ledger
 */
export async function getCreditBalance() {
  const ledger = await loadCreditLedger();
  return ledger.reduce((balance, tx) => {
    if (tx.type === TRANSACTION_TYPES.PURCHASE || tx.type === TRANSACTION_TYPES.BONUS || tx.type === TRANSACTION_TYPES.REFUND) {
      return balance + tx.amount;
    } else if (tx.type === TRANSACTION_TYPES.USE) {
      return balance - tx.amount;
    }
    return balance;
  }, 0);
}

/**
 * Use credits (creates a USE transaction)
 */
export async function useCredits(amount = 1) {
  const balance = await getCreditBalance();
  if (balance < amount) {
    return { success: false, error: 'Insufficient credits' };
  }
  
  await addTransaction(TRANSACTION_TYPES.USE, amount, {
    used_at: new Date().toISOString(),
  });
  
  return { success: true, newBalance: balance - amount };
}

/**
 * Initialize credits from purchase (one-time)
 */
export async function initializeCreditsFromPurchase(credits, purchaseProof = {}) {
  // Check if already initialized
  const ledger = await loadCreditLedger();
  const hasPurchase = ledger.some(tx => tx.type === TRANSACTION_TYPES.PURCHASE);
  
  if (hasPurchase) {
    return { success: false, error: 'Credits already initialized' };
  }
  
  await addTransaction(TRANSACTION_TYPES.PURCHASE, credits, {
    purchase_proof: purchaseProof,
    initialized_at: new Date().toISOString(),
  });
  
  return { success: true };
}

/**
 * Export ledger for backup/verification (without exposing signatures)
 */
export async function exportLedger() {
  const ledger = await loadCreditLedger();
  return ledger.map(({ signature, ...tx }) => tx); // Remove signatures for export
}

