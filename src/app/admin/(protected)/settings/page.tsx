import { getSettings, updateSettings } from '@/app/actions/admin-crud'
import { DEFAULT_ASSUMPTIONS } from '@/lib/quote/calculator'

export default async function AdminSettingsPage() {
  const settings = await getSettings()

  const assumptions = settings.solar_assumptions || DEFAULT_ASSUMPTIONS

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt</h1>

      <form action={updateSettings} className="space-y-6">
        {/* Assumptions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Giả định tính toán</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Giá điện EVN (VNĐ/kWh)</label>
                <input name="setting_evnPricePerKwh" type="number" defaultValue={assumptions.evnPricePerKwh}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">VAT (%)</label>
                <input name="setting_vatRate" type="number" step="0.01" defaultValue={assumptions.vatRate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Suy giảm hiệu suất/năm</label>
                <input name="setting_annualDegradation" type="number" step="0.001" defaultValue={assumptions.annualDegradation}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tăng giá điện/năm</label>
                <input name="setting_annualElectricityPriceIncrease" type="number" step="0.01" defaultValue={assumptions.annualElectricityPriceIncrease}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Chi phí O&M (% đầu tư/năm)</label>
                <input name="setting_annualOmRate" type="number" step="0.01" defaultValue={assumptions.annualOmRate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phí dịch vụ trả góp (%)</label>
                <input name="setting_installmentSetupFee" type="number" step="0.01" defaultValue={assumptions.installmentSetupFee}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* System Price */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Giá hệ thống</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hòa lưới (VNĐ/kWp)</label>
              <input name="setting_systemPricePerKwp_gridTied" type="number" defaultValue={assumptions.systemPricePerKwp.gridTied}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hybrid (VNĐ/kWp)</label>
              <input name="setting_systemPricePerKwp_hybrid" type="number" defaultValue={assumptions.systemPricePerKwp.hybrid}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
        </div>

        {/* Production */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Sản lượng theo vùng (kWh/kWp/năm)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Miền Bắc</label>
              <input name="setting_annualProductionPerKwp_north" type="number" defaultValue={assumptions.annualProductionPerKwp.north}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Miền Trung</label>
              <input name="setting_annualProductionPerKwp_central" type="number" defaultValue={assumptions.annualProductionPerKwp.central}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Miền Nam</label>
              <input name="setting_annualProductionPerKwp_south" type="number" defaultValue={assumptions.annualProductionPerKwp.south}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Mặc định</label>
              <input name="setting_annualProductionPerKwp_default" type="number" defaultValue={assumptions.annualProductionPerKwp.default}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
        </div>

        <input type="hidden" name="setting_solar_assumptions" value={JSON.stringify(assumptions)} />

        <button type="submit" className="px-6 py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">
          Lưu cài đặt
        </button>
      </form>
    </div>
  )
}
