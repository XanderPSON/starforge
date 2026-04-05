'use client'

import { useMemo, useState } from 'react'

interface GasFeeCalculatorProps {
  gasUsedDefault?: number
  gasPriceGweiDefault?: number
}

export function GasFeeCalculator({
  gasUsedDefault = 73000,
  gasPriceGweiDefault = 0.012,
}: GasFeeCalculatorProps) {
  const [gasUsed, setGasUsed] = useState<number>(gasUsedDefault)
  const [gasPriceGwei, setGasPriceGwei] = useState<number>(gasPriceGweiDefault)

  const feeEth = useMemo(() => {
    if (!Number.isFinite(gasUsed) || !Number.isFinite(gasPriceGwei)) return 0
    if (gasUsed < 0 || gasPriceGwei < 0) return 0
    return gasUsed * gasPriceGwei * 1e-9
  }, [gasUsed, gasPriceGwei])

  return (
    <div className="my-6 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] p-5">
      <p className="m-0 text-sm font-semibold text-gray-900 dark:text-gray-100">
        ⛽ Try it: Gas Fee Calculator
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gas Used</span>
          <input
            type="number"
            min={0}
            step={1}
            value={Number.isFinite(gasUsed) ? gasUsed : ''}
            onChange={(e) => {
              const next = Number(e.target.value)
              setGasUsed(Number.isFinite(next) ? next : 0)
            }}
            className="rounded-md border border-gray-300 dark:border-white/20 bg-white dark:bg-black/20 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gas Price (gwei)</span>
          <input
            type="number"
            min={0}
            step="any"
            value={Number.isFinite(gasPriceGwei) ? gasPriceGwei : ''}
            onChange={(e) => {
              const next = Number(e.target.value)
              setGasPriceGwei(Number.isFinite(next) ? next : 0)
            }}
            className="rounded-md border border-gray-300 dark:border-white/20 bg-white dark:bg-black/20 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          />
        </label>
      </div>

      <div className="mt-4 rounded-md bg-white dark:bg-black/20 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
        <span className="font-medium">Estimated Fee:</span>{' '}
        <code className="font-semibold text-gray-900 dark:text-gray-100">
          {feeEth.toFixed(12)} ETH
        </code>
      </div>
    </div>
  )
}
