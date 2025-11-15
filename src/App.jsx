import { useState } from 'react'

function Input({ label, value, onChange, type = 'number', step = 'any', min }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm text-gray-700">
      <span className="w-40">{label}</span>
      <input
        className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        type={type}
        step={step}
        min={min}
        value={value}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      />
    </label>
  )
}

function App() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [instrument, setInstrument] = useState('option')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  // Option params
  const [S, setS] = useState(100)
  const [K, setK] = useState(100)
  const [r, setR] = useState(0.02)
  const [sigma, setSigma] = useState(0.2)
  const [T, setT] = useState(1)
  const [optionType, setOptionType] = useState('call')

  // Bond params
  const [face, setFace] = useState(1000)
  const [couponRate, setCouponRate] = useState(0.05)
  const [ytm, setYtm] = useState(0.05)
  const [years, setYears] = useState(5)
  const [freq, setFreq] = useState(2)

  // Swap params
  const [notional, setNotional] = useState(1000000)
  const [fixedRate, setFixedRate] = useState(0.03)
  const [payFixed, setPayFixed] = useState(true)
  const [swapYears, setSwapYears] = useState(5)
  const [swapFreq, setSwapFreq] = useState(4)
  const [flatRate, setFlatRate] = useState(0.03)

  const handlePrice = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      let endpoint = ''
      let body = {}

      if (instrument === 'option') {
        endpoint = '/api/price/option'
        body = { S, K, r, sigma, T, option_type: optionType }
      } else if (instrument === 'bond') {
        endpoint = '/api/price/bond'
        body = { face, coupon_rate: couponRate, ytm, years, freq }
      } else {
        endpoint = '/api/price/swap'
        body = { notional, fixed_rate: fixedRate, pay_fixed: payFixed, years: swapYears, freq: swapFreq, flat_rate: flatRate }
      }

      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.detail || `Request failed (${res.status})`)
      }
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Simple Pricing Tool</h1>
        <p className="text-sm text-gray-500 mb-6">Price a Black-Scholes option, a fixed-coupon bond, or a plain-vanilla interest rate swap.</p>

        <div className="flex items-center gap-2 mb-6">
          {['option','bond','swap'].map((k) => (
            <button
              key={k}
              onClick={() => setInstrument(k)}
              className={`px-4 py-2 rounded-full text-sm border transition ${instrument===k? 'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {k.toUpperCase()}
            </button>
          ))}
        </div>

        {instrument === 'option' && (
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Input label="Spot (S)" value={S} onChange={setS} />
            <Input label="Strike (K)" value={K} onChange={setK} />
            <Input label="Rate (r)" value={r} onChange={setR} />
            <Input label="Vol (sigma)" value={sigma} onChange={setSigma} />
            <Input label="Maturity (T, yrs)" value={T} onChange={setT} />
            <label className="flex items-center justify-between gap-3 text-sm text-gray-700">
              <span className="w-40">Type</span>
              <select
                className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={optionType}
                onChange={(e) => setOptionType(e.target.value)}
              >
                <option value="call">Call</option>
                <option value="put">Put</option>
              </select>
            </label>
          </div>
        )}

        {instrument === 'bond' && (
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Input label="Face" value={face} onChange={setFace} />
            <Input label="Coupon rate" value={couponRate} onChange={setCouponRate} />
            <Input label="YTM" value={ytm} onChange={setYtm} />
            <Input label="Years" value={years} onChange={setYears} />
            <Input label="Freq (per yr)" value={freq} onChange={setFreq} />
          </div>
        )}

        {instrument === 'swap' && (
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Input label="Notional" value={notional} onChange={setNotional} />
            <Input label="Fixed rate" value={fixedRate} onChange={setFixedRate} />
            <Input label="Years" value={swapYears} onChange={setSwapYears} />
            <Input label="Freq (per yr)" value={swapFreq} onChange={setSwapFreq} />
            <Input label="Flat curve rate" value={flatRate} onChange={setFlatRate} />
            <label className="flex items-center justify-between gap-3 text-sm text-gray-700">
              <span className="w-40">Pay fixed?</span>
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={payFixed}
                onChange={(e) => setPayFixed(e.target.checked)}
              />
            </label>
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrice}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded"
          >
            {loading ? 'Pricing…' : 'Price'}
          </button>
          <a href="/test" className="text-sm text-gray-600 hover:text-gray-800 underline">Check backend</a>
          <span className="text-xs text-gray-400 ml-auto">API: {baseUrl}</span>
        </div>

        {result && (
          <div className="mt-6 bg-gray-50 border rounded p-4">
            <h3 className="font-semibold mb-2">Result</h3>
            <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
