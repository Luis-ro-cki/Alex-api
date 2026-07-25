const PLANS = {
  free: {
    id: 'free',
    label: 'Free',
    monthlyLimit: parseInt(process.env.FREE_MONTHLY_LIMIT || '4000', 10),
    maxApiKeys: 1,
    speed: 'estandar',
    support: 'basico'
  },
  premium: {
    id: 'premium',
    label: 'Premium',
    monthlyLimit: parseInt(process.env.PREMIUM_MONTHLY_LIMIT || '1000000', 10),
    maxApiKeys: 5,
    speed: 'prioritaria',
    support: 'prioritario'
  }
};

function getPlan(planId) {
  return PLANS[planId] || PLANS.free;
}

module.exports = { PLANS, getPlan };
